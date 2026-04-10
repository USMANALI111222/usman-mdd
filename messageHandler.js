const config = require("./config");
const { getContentType } = require("@whiskeysockets/baileys");
const logger = require("./logger");
const fs = require("fs");
const path = require("path");

const commands = new Map();
const cooldowns = new Map();

// ━━━ STORES (module-level, persistent) ━━━
const allMsgs = new Map();         // msgId → stored msg (for anti-delete)
global.viewOnceStore = global.viewOnceStore || new Map();

function loadCommands() {
  const skip = ["messageHandler.js","groupHandler.js","index.js","config.js","logger.js","helpers.js","index.html"];
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith(".js") && !skip.includes(f));
  for (const file of files) {
    try {
      const cmd = require(path.join(__dirname, file));
      (Array.isArray(cmd) ? cmd : [cmd]).forEach(c => {
        if (!c?.name) return;
        commands.set(c.name, c);
        (c.alias || []).forEach(a => commands.set(a, c));
      });
    } catch (e) {
      logger.error(`Load error ${file}: ${e.message}`);
    }
  }
  logger.info(`✅ Loaded ${commands.size} commands`);
}

loadCommands();
global.commands = commands;

async function handleMessage(sock, msg) {
  const jid = msg.key?.remoteJid;
  if (!jid || jid === "status@broadcast") return;

  const isGroup = jid.endsWith("@g.us");
  const sender = isGroup ? msg.key.participant : jid;
  const senderNum = sender?.replace("@s.whatsapp.net", "").replace(/\D/g, "");
  const fromMe = msg.key.fromMe;
  const msgId = msg.key.id;

  const isOwner =
    senderNum === config.ownerNumber?.replace(/\D/g, "") ||
    senderNum === config.ownerNumber2?.replace(/\D/g, "") ||
    senderNum === config.ownerNumber3?.replace(/\D/g, "") ||
    fromMe;

  const rawMsg = msg.message;
  const msgType = getContentType(rawMsg);
  const body =
    rawMsg?.conversation ||
    rawMsg?.extendedTextMessage?.text ||
    rawMsg?.imageMessage?.caption ||
    rawMsg?.videoMessage?.caption ||
    rawMsg?.documentMessage?.caption || "";

  // ━━━ STORE ALL MSGS (for anti-delete) ━━━
  if (msgId) {
    allMsgs.set(msgId, { jid, sender, senderNum, body, msgType, time: Date.now(), rawMsg });
    if (allMsgs.size > 1000) {
      const old = [...allMsgs.entries()].sort((a,b) => a[1].time - b[1].time)[0];
      allMsgs.delete(old[0]);
    }
  }

  // ━━━ STORE VIEW ONCE ━━━
  const vo =
    rawMsg?.viewOnceMessage?.message ||
    rawMsg?.viewOnceMessageV2?.message ||
    rawMsg?.viewOnceMessageV2Extension?.message;
  if (vo && msgId) {
    global.viewOnceStore.set(msgId, { jid, sender, senderNum, message: vo, time: Date.now() });
    if (global.viewOnceStore.size > 300) {
      const old = [...global.viewOnceStore.entries()].sort((a,b) => a[1].time - b[1].time)[0];
      global.viewOnceStore.delete(old[0]);
    }
  }

  // ━━━ SINGLE TICK / AUTO READ ━━━
  if (config.autoRead) {
    await sock.readMessages([msg.key]).catch(() => {});
  }
  // autoRead = false means DON'T call readMessages → stays single tick ✓

  // ━━━ AUTO REACT ━━━
  if (config.autoReact && body && !fromMe) {
    const emojis = ["❤️","🔥","👍","😂","🥳","💯","✨"];
    await sock.sendMessage(jid, {
      react: { text: emojis[Math.floor(Math.random()*emojis.length)], key: msg.key }
    }).catch(() => {});
  }

  // ━━━ ANTI BUG ━━━
  if (config.antiBug && !isOwner) {
    if (rawMsg?.protocolMessage?.type === 14 || rawMsg?.senderKeyDistributionMessage) return;
    if (body.length > 10000) return;
  }

  // ━━━ ANTI LINK ━━━
  if (config.antiLink && isGroup && !isOwner && body) {
    if (/https?:\/\/|chat\.whatsapp\.com/i.test(body)) {
      try {
        const meta = await sock.groupMetadata(jid);
        const admins = meta.participants.filter(p => p.admin).map(p => p.id);
        if (!admins.includes(sender)) {
          await sock.sendMessage(jid, { delete: msg.key }).catch(() => {});
          await sock.groupParticipantsUpdate(jid, [sender], "remove");
          await sock.sendMessage(jid, { text: `❌ @${senderNum} removed for sending link!`, mentions: [sender] });
          return;
        }
      } catch {}
    }
  }

  // ━━━ COMMAND CHECK ━━━
  const prefix = config.prefix;
  if (!body.startsWith(prefix)) return;

  const args = body.slice(prefix.length).trim().split(/\s+/);
  const cmdName = args.shift()?.toLowerCase();
  if (!cmdName) return;

  // ━━━ COOLDOWN ━━━
  const ck = `${senderNum}_${cmdName}`;
  const now = Date.now();
  if (cooldowns.has(ck) && now - cooldowns.get(ck) < 2000) return;
  cooldowns.set(ck, now);

  // ━━━ MODE ━━━
  if (config.mode === "private" && !isOwner) return;
  if (config.mode === "groups" && !isGroup) return;
  if (config.mode === "inbox" && isGroup && !isOwner) return;

  const command = commands.get(cmdName);
  if (!command) return;

  if (command.ownerOnly && !isOwner)
    return sock.sendMessage(jid, { text: "❌ *Owner only!*" }, { quoted: msg });
  if (command.groupOnly && !isGroup)
    return sock.sendMessage(jid, { text: "❌ *Group only!*" }, { quoted: msg });

  let isAdmin = false, isBotAdmin = false;
  if (isGroup) {
    try {
      const meta = await sock.groupMetadata(jid);
      const admins = meta.participants.filter(p => p.admin);
      isAdmin = admins.some(a => a.id === sender);
      isBotAdmin = admins.some(a =>
        a.id === sock.user.id ||
        a.id === sock.user.id.replace(/:.*/, "") + "@s.whatsapp.net"
      );
    } catch {}
  }

  if (command.adminOnly && !isAdmin && !isOwner)
    return sock.sendMessage(jid, { text: "❌ *Admin only!*" }, { quoted: msg });

  const ctx = {
    sock, msg, jid, sender, senderNum,
    isOwner, isGroup, isAdmin, isBotAdmin,
    args, body, msgType, prefix,
    reply: (text) => sock.sendMessage(jid, { text }, { quoted: msg }),
    react: (emoji) => sock.sendMessage(jid, { react: { text: emoji, key: msg.key } }).catch(() => {}),
  };

  try {
    await ctx.react("⏳");
    await command.execute(ctx);
    await ctx.react("✅");
  } catch (e) {
    logger.error(`.${cmdName} error: ${e.message}`);
    await ctx.reply(`❌ *Error:* ${e.message}`);
    await ctx.react("❌");
  }
}

// ━━━ ANTI DELETE — Called from index.js messages.delete event ━━━
async function handleMessageDelete(sock, update) {
  if (!config.antiDelete) return;
  try {
    // Baileys v6: update = { keys: [{id, remoteJid, ...}] }
    const keys = update?.keys || [];
    for (const key of keys) {
      const stored = allMsgs.get(key.id);
      if (!stored) continue;
      // Skip empty/system messages
      if (!stored.body && !["imageMessage","videoMessage","audioMessage","documentMessage"].includes(stored.msgType)) continue;

      const sec = Math.floor((Date.now() - stored.time) / 1000);
      await sock.sendMessage(stored.jid, {
        text:
          `*🗑️ ANTI DELETE*\n\n` +
          `*👤 Sender:* @${stored.senderNum}\n` +
          `*⏱️ ${sec}s ago*\n` +
          `*📝 Message:*\n${stored.body || `[${stored.msgType || "media"}]`}`,
        mentions: stored.sender ? [stored.sender] : [],
      });
    }
  } catch (e) {
    logger.error("Anti-delete error: " + e.message);
  }
}

module.exports = { handleMessage, handleMessageDelete, commands };
