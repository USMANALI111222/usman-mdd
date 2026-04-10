const axios = require("axios");
const H = (t) => `╭─[ *𝗨ꜱᴍᴀɴ-𝗠ᴅ* ]─╮
┃ *${t}*
╰──────────────────╯`;
const F = `

> 𝗨ꜱᴍᴀɴ-𝗠ᴅ`;

const dp = {
  name: "dp",
  alias: ["getdp","profilepic","pp"],
  category: "tools",
  async execute({ args, sock, jid, msg, reply }) {
    if (!args[0]) {
      return reply(
        `${H("WʜᴀᴛsAᴘᴘ Dᴘ")}\n\n` +
        `Usage: .dp <number>\n` +
        `Example: .dp 923001234567\n` +
        `Enter number with country code, no +${F}`
      );
    }

    const num = args[0].replace(/[^0-9]/g, "");
    if (num.length < 10) {
      return reply(`${H("WʜᴀᴛsAᴘᴘ Dᴘ")}\n\nInvalid number. Include country code.\nExample: .dp 923001234567${F}`);
    }

    await reply(`${H("WʜᴀᴛsAᴘᴘ Dᴘ")}\n\nFetching profile picture for +${num}...`);

    const dpUrl = `https://unavatar.io/whatsapp/${num}`;

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: dpUrl },
          caption:
            `${H("WʜᴀᴛsAᴘᴘ Dᴘ")}\n\n` +
            `Nᴜᴍʙᴇʀ ▸ +${num}\n` +
            `Sᴛᴀᴛᴜs ▸ Pʀᴏꜰɪʟᴇ Fᴏᴜɴᴅ` +
            F,
        },
        { quoted: msg }
      );
    } catch {
      reply(
        `${H("WʜᴀᴛsAᴘᴘ Dᴘ")}\n\n` +
        `Could not fetch DP for +${num}.\n` +
        `User may have set DP to private.${F}`
      );
    }
  },
};

module.exports = dp;
