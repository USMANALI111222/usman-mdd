const autoread = {
  name: "autoread", alias: ["bluetick"],
  category: "privacy", ownerOnly: true,
  async execute({ reply }) {
    global.config.autoRead = !global.config.autoRead;
    reply(`Auto Read: ${global.config.autoRead ? "ON (blue ticks)" : "OFF (single tick)"}`);
  },
};

const readtick = {
  name: "readtick", alias: ["singletick","privacy"],
  category: "privacy", ownerOnly: true,
  async execute({ reply }) {
    global.config.autoRead = false;
    reply(`Single tick mode ON. No blue ticks. Use .autoread to turn on blue ticks.`);
  },
};

// .vv - reveal view once message
const vv = {
  name: "vv", alias: ["viewonce","vo","reveal"],
  category: "privacy",
  async execute({ sock, jid, msg, reply }) {
    // Check quoted message
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quotedMsg = ctx?.quotedMessage;
    const quotedId  = ctx?.stanzaId;

    // Try from quoted first
    let vo = null;
    if (quotedMsg) {
      vo = quotedMsg?.viewOnceMessage?.message
        || quotedMsg?.viewOnceMessageV2?.message
        || quotedMsg?.viewOnceMessageV2Extension?.message
        || quotedMsg?.imageMessage
        || quotedMsg?.videoMessage;
    }

    // Fallback: check global store
    if (!vo && quotedId) {
      const stored = global.viewOnceStore?.get(quotedId);
      if (stored) vo = stored.message;
    }

    // Fallback: latest in store
    if (!vo && global.viewOnceStore?.size > 0) {
      const entries = [...global.viewOnceStore.entries()].sort((a,b) => b[1].time - a[1].time);
      const latest = entries[0]?.[1];
      if (latest) vo = latest.message;
    }

    if (!vo) {
      return reply(`Reply to a view once message, or use .vv right after someone sends one.`);
    }

    try {
      // Handle image
      const imgMsg = vo?.imageMessage || (vo?.viewOnceMessage?.message?.imageMessage);
      const vidMsg = vo?.videoMessage || (vo?.viewOnceMessage?.message?.videoMessage);

      if (imgMsg) {
        const fakeSrc = { message: { imageMessage: imgMsg }, key: { remoteJid: jid, id: quotedId || "vo" } };
        const buf = await sock.downloadMediaMessage(fakeSrc, "buffer");
        return await sock.sendMessage(jid, { image: buf, caption: "View Once Revealed" }, { quoted: msg });
      }

      if (vidMsg) {
        const fakeSrc = { message: { videoMessage: vidMsg }, key: { remoteJid: jid, id: quotedId || "vo" } };
        const buf = await sock.downloadMediaMessage(fakeSrc, "buffer");
        return await sock.sendMessage(jid, { video: buf, caption: "View Once Revealed" }, { quoted: msg });
      }

      reply(`Media type not supported or already expired.`);
    } catch {
      reply(`Failed to retrieve. Media may have expired.`);
    }
  },
};

module.exports = [vv, autoread, readtick];
