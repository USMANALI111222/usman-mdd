const block = {
  name: "block",
  description: "Block a user",
  category: "owner",
  ownerOnly: true,
  async execute({ sock, msg, reply }) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned?.[0] || quoted;
    if (!target) return reply("❌ Tag someone to block!\nUsage: .block @user");
    try {
      await sock.updateBlockStatus(target, "block");
      reply("✅ User blocked!");
    } catch {
      reply("❌ Could not block user!");
    }
  },
};

const unblock = {
  name: "unblock",
  description: "Unblock a user",
  category: "owner",
  ownerOnly: true,
  async execute({ sock, msg, reply }) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned?.[0] || quoted;
    if (!target) return reply("❌ Tag someone to unblock!\nUsage: .unblock @user");
    try {
      await sock.updateBlockStatus(target, "unblock");
      reply("✅ User unblocked!");
    } catch {
      reply("❌ Could not unblock user!");
    }
  },
};

const broadcast = {
  name: "broadcast",
  alias: ["bc"],
  description: "Broadcast message to all groups",
  category: "owner",
  ownerOnly: true,
  async execute({ sock, args, reply }) {
    if (!args[0]) return reply("❌ Usage: .broadcast your message");
    const text = args.join(" ");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let sent = 0;
      for (const id of groupIds) {
        try {
          await sock.sendMessage(id, { text });
          sent++;
          await new Promise(r => setTimeout(r, 1000));
        } catch {}
      }
      reply(`✅ Broadcast sent to ${sent}/${groupIds.length} groups!`);
    } catch {
      reply("❌ Broadcast failed!");
    }
  },
};

const leave = {
  name: "leave",
  description: "Leave a group",
  category: "owner",
  ownerOnly: true,
  groupOnly: true,
  async execute({ sock, jid, reply }) {
    await reply("Leaving group...");
    try {
      await sock.groupLeave(jid);
    } catch {
      reply("❌ Could not leave group!");
    }
  },
};

const status = {
  name: "status",
  description: "Post a WhatsApp status",
  category: "owner",
  ownerOnly: true,
  async execute({ sock, args, reply }) {
    if (!args[0]) return reply("❌ Usage: .status your status text");
    try {
      await sock.sendMessage("status@broadcast", { text: args.join(" ") });
      reply("✅ Status posted!");
    } catch {
      reply("❌ Could not post status!");
    }
  },
};

module.exports = [block, unblock, broadcast, leave, status];
