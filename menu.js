const { getRuntime } = require("./helpers");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "menu",
  alias: ["help", "list", "commands"],
  description: "Show full commands menu",
  category: "main",
  async execute({ sock, jid, msg, prefix }) {
    const config = global.config;
    const runtime = getRuntime();
    const totalCmds = global.commands?.size || 500;
    const on = (v) => v ? "[ ON  ]" : "[ OFF ]";

    // Get sender info for @mention (tap opens profile)
    const senderJid = jid?.endsWith("@g.us")
      ? (msg.key?.participant || msg.key?.remoteJid)
      : msg.key?.remoteJid;
    const senderNum = senderJid?.replace("@s.whatsapp.net","").replace(/\D/g,"") || "";

    const menu =
`〔 𝗨ꜱᴍᴀɴ-𝗠ᴅ 〕
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
〢 Bᴏᴛ ɪs Oɴʟɪɴᴇ & Rᴇᴀᴅʏ
〢 Uꜱᴇʀ   ▸ @${senderNum}
〢 Uᴘᴛɪᴍᴇ ▸ ${runtime}
〢 Oᴡɴᴇʀ  ▸ ${config.ownerName}
〢 Mᴏᴅᴇ   ▸ ${config.mode.toUpperCase()}
〢 Cᴍᴅs   ▸ ${totalCmds}+
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

『 Tᴏɢɢʟᴇs 』
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
┃ Aɴᴛɪ Dᴇʟᴇᴛᴇ   ${on(config.antiDelete)}  .antidelete
┃ Aɴᴛɪ Bᴜɢ      ${on(config.antiBug)}  .antibug
┃ Aɴᴛɪ Lɪɴᴋ     ${on(config.antiLink)}  .antilink
┃ Aɴᴛɪ Cᴀʟʟ     ${on(config.antiCall)}  .anticall
┃ Aᴜᴛᴏ Rᴇᴀᴄᴛ    ${on(config.autoReact)}  .autoreact
┃ Aᴜᴛᴏ Rᴇᴀᴅ     ${on(config.autoRead)}  .autoread
┃ Sᴛᴀᴛᴜs Vɪᴇᴡ   ${on(config.statusView)}  .autoviewstatus
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄

『 Gᴇɴᴇʀᴀʟ 』
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
┃ ⬡ .alive   ⬡ .ping   ⬡ .uptime
┃ ⬡ .info    ⬡ .owner  ⬡ .delete
┃ ⬡ .vv      ⬡ .dp <number>
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄

『 Gʀᴏᴜᴘ 』
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
┃ ⬡ .kick    ⬡ .promote  ⬡ .demote
┃ ⬡ .mute    ⬡ .unmute   ⬡ .lock
┃ ⬡ .unlock  ⬡ .tagall   ⬡ .hidetag
┃ ⬡ .invite  ⬡ .revoke   ⬡ .warn
┃ ⬡ .ginfo   ⬡ .members  ⬡ .rules
┃ ⬡ .setname ⬡ .setdesc  ⬡ .events
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄

『 Aɪ Cʜᴀᴛ 』
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
┃ ⬡ .ai        ⬡ .gpt      ⬡ .gpt5
┃ ⬡ .copilot   ⬡ .deepseek ⬡ .zai
┃ ⬡ .logical   ⬡ .creative ⬡ .summarize
┃ ⬡ .story     ⬡ .dream    ⬡ .codeai
┃ ⬡ .detectbugs
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄

『 Aɪ Iᴍᴀɢᴇ Gᴇɴ 』
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
┃ .imagine  .realistic  .cartoon
┃ .sketch   .pixelart   .horror
┃ .scifi    .fantasy    .watercolor
┃ .vintage  .oilpaint   .abstract
┃ .popart   .steampunk
┃
┃ Nᴀᴍᴇ Aʀᴛ  →  .cmd <your name>
┃ .hacker  .cyber   .warrior .demon
┃ .ghost   .shadow  .fire    .king
┃ .wolf    .dragon  .anime   .galaxy
┃ .robot   .ninja   .god
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄

『 Dᴏᴡɴʟᴏᴀᴅ 』
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
┃ ⬡ .tiktok   ⬡ .ytv      ⬡ .song
┃ ⬡ .igdl     ⬡ .fb       ⬡ .twitter
┃ ⬡ .spotify  ⬡ .capcut   ⬡ .pinterest
┃ ⬡ .mediafire            ⬡ .aio
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄

『 Aɴɪᴍᴇ & Fᴜɴ 』
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
┃ .animesearch  .manga   .hug  .kiss
┃ .pat   .slap   .cry   .dance .wave
┃ .waifu .neko   .joke  .roast .quote
┃ .ship  .dare   .truth .8ball
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄

『 Tᴏᴏʟs 』
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
┃ .sticker    .removebg  .upscale
┃ .weather    .wiki      .tts
┃ .translate  .calc      .qr
┃ .currency   .time      .ocr
┃ .shorturl   .github    .lyrics
┃ .news       .password  .ss
┃ .define     .urban     .dp
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄

『 Oᴡɴᴇʀ 』
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
┃ .announce  .broadcast  .restart
┃ .block     .unblock    .leavegroup
┃ .setbio    .setmode    .setname
┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
𝗨ꜱᴍᴀɴ-𝗠ᴅ`;

    const picPath    = path.join(__dirname, "../../pic.jpg");
    const picPathPng = path.join(__dirname, "../../pic.png");
    const videoPath  = path.join(__dirname, "../../video.mp4");

    // Newsletter forward = channel button under message
    const fwdInfo = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363419090044543@newsletter",
        newsletterName: "𝗨ꜱᴍᴀɴ-𝗠ᴅ",
        serverMessageId: 143,
      },
    };

    const sendOpts = { quoted: msg };

    try {
      if (fs.existsSync(videoPath)) {
        await sock.sendMessage(jid,
          { video: fs.readFileSync(videoPath), caption: menu, gifPlayback: false, ...fwdInfo },
          sendOpts
        );
      } else if (fs.existsSync(picPath)) {
        await sock.sendMessage(jid,
          { image: fs.readFileSync(picPath), caption: menu, mentions: [senderJid], ...fwdInfo },
          sendOpts
        );
      } else if (fs.existsSync(picPathPng)) {
        await sock.sendMessage(jid,
          { image: fs.readFileSync(picPathPng), caption: menu, mentions: [senderJid], ...fwdInfo },
          sendOpts
        );
      } else {
        await sock.sendMessage(jid,
          { text: menu, mentions: [senderJid], ...fwdInfo },
          sendOpts
        );
      }
    } catch {
      await sock.sendMessage(jid,
        { text: menu, mentions: [senderJid] },
        sendOpts
      );
    }
  },
};
