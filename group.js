const kick = {
  name: "kick",
  alias: ["remove"],
  description: "Kick a member from group",
  category: "group",
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, jid, msg, reply, isOwner, isBotAdmin }) {
    if (!isBotAdmin && !isOwner) return reply("❌ Bot must be admin!");
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned?.[0] || quoted;
    if (!target) return reply("❌ Tag someone to kick!\nUsage: .kick @user");
    try {
      await sock.groupParticipantsUpdate(jid, [target], "remove");
      reply("✅ Member kicked!");
    } catch {
      reply("❌ Could not kick. Check bot admin permissions!");
    }
  },
};

const add = {
  name: "add",
  description: "Add member to group",
  category: "group",
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, jid, args, reply, isBotAdmin, isOwner }) {
    if (!isBotAdmin && !isOwner) return reply("❌ Bot must be admin!");
    if (!args[0]) return reply("❌ Usage: .add 923001234567");
    const num = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    try {
      await sock.groupParticipantsUpdate(jid, [num], "add");
      reply("✅ Member added!");
    } catch {
      reply("❌ Could not add member!");
    }
  },
};

const promote = {
  name: "promote",
  description: "Promote member to admin",
  category: "group",
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, jid, msg, reply, isBotAdmin, isOwner }) {
    if (!isBotAdmin && !isOwner) return reply("❌ Bot must be admin!");
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned?.[0] || quoted;
    if (!target) return reply("❌ Tag someone!\nUsage: .promote @user");
    try {
      await sock.groupParticipantsUpdate(jid, [target], "promote");
      reply("✅ Member promoted to admin!");
    } catch {
      reply("❌ Could not promote!");
    }
  },
};

const demote = {
  name: "demote",
  description: "Demote admin to member",
  category: "group",
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, jid, msg, reply, isBotAdmin, isOwner }) {
    if (!isBotAdmin && !isOwner) return reply("❌ Bot must be admin!");
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned?.[0] || quoted;
    if (!target) return reply("❌ Tag someone!\nUsage: .demote @user");
    try {
      await sock.groupParticipantsUpdate(jid, [target], "demote");
      reply("✅ Admin demoted!");
    } catch {
      reply("❌ Could not demote!");
    }
  },
};

const tagall = {
  name: "tagall",
  alias: ["everyone", "all"],
  description: "Tag all group members",
  category: "group",
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, jid, msg, args, reply }) {
    try {
      const groupMeta = await sock.groupMetadata(jid);
      const members = groupMeta.participants.map(p => p.id);
      const text = args.join(" ") || "Attention everyone!";
      const mentions = members;
      const tagText = text + "\n\n" + members.map(m => `@${m.split("@")[0]}`).join(" ");
      await sock.sendMessage(jid, { text: tagText, mentions }, { quoted: msg });
    } catch {
      reply("❌ Could not tag all members!");
    }
  },
};

const ginfo = {
  name: "ginfo",
  alias: ["groupinfo"],
  description: "Get group info",
  category: "group",
  groupOnly: true,
  async execute({ sock, jid, reply }) {
    try {
      const meta = await sock.groupMetadata(jid);
      const admins = meta.participants.filter(p => p.admin).length;
      reply(
        `Group Info\n\n` +
        `Name: ${meta.subject}\n` +
        `Members: ${meta.participants.length}\n` +
        `Admins: ${admins}\n` +
        `Created: ${new Date(meta.creation * 1000).toLocaleDateString()}\n` +
        `Description: ${meta.desc || "None"}`
      );
    } catch {
      reply("❌ Could not get group info!");
    }
  },
};

const mute = {
  name: "mute",
  description: "Mute group (admins only can send)",
  category: "group",
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, jid, reply, isBotAdmin, isOwner }) {
    if (!isBotAdmin && !isOwner) return reply("❌ Bot must be admin!");
    try {
      await sock.groupSettingUpdate(jid, "announcement");
      reply("✅ Group muted! Only admins can send messages.");
    } catch {
      reply("❌ Could not mute group!");
    }
  },
};

const unmute = {
  name: "unmute",
  description: "Unmute group",
  category: "group",
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, jid, reply, isBotAdmin, isOwner }) {
    if (!isBotAdmin && !isOwner) return reply("❌ Bot must be admin!");
    try {
      await sock.groupSettingUpdate(jid, "not_announcement");
      reply("✅ Group unmuted! Everyone can send messages.");
    } catch {
      reply("❌ Could not unmute group!");
    }
  },
};

const invite = {
  name: "invite",
  alias: ["link"],
  description: "Get group invite link",
  category: "group",
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, jid, reply }) {
    try {
      const code = await sock.groupInviteCode(jid);
      reply(`Group Invite Link:\nhttps://chat.whatsapp.com/${code}`);
    } catch {
      reply("❌ Could not get invite link!");
    }
  },
};

module.exports = [kick, add, promote, demote, tagall, ginfo, mute, unmute, invite];
