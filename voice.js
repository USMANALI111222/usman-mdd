const axios = require("axios");
const B = "https://apis.prexzyvilla.site";
const H = (t) => `╭─[ *𝗨ꜱᴍᴀɴ-𝗠ᴅ* ]─╮
┃ *${t}*
╰──────────────────╯`;
const F = `

> 𝗨ꜱᴍᴀɴ-𝗠ᴅ`;

// Voice presets using prexzyvilla TTS API
const VOICES = {
  girl:   {path:"/tts/jennifer", label:"👧 Girl (Jennifer)"},
  boy:    {path:"/tts/james", label:"👦 Boy (James)"},
  child:  {path:"/tts/ivy", label:"👶 Child (Ivy)"},
  oldman: {path:"/tts/paul", label:"👴 Old Man (Paul)"},
  robot:  {path:"/tts/tts-robosoft-one", label:"🤖 Robot"},
  deep:   {path:"/tts/michael", label:"🎤 Deep (Michael)"},
  helium: {path:"/tts/amy", label:"🎈 Helium (Amy)"},
  whisper:{path:"/tts/tts-female-whisper", label:"🤫 Whisper"},
  uk:     {path:"/tts/noah", label:"🇬🇧 UK (Noah)"},
  arabic: {path:"/tts/tts-ar", label:"🌙 Arabic TTS"},
  urdu:   {path:"/tts/tts-hi", label:"🇵🇰 Urdu/Hindi TTS"},
};

const voice = {
  name:"voice", alias:["vc","voicechanger","vchange"],
  category:"voice",
  async execute({sock, jid, msg, args, reply}) {
    const type = args[0]?.toLowerCase();
    if(!type || !VOICES[type]) {
      return reply(
        `${H("VOICE CHANGER")}\n\n*Available Voices:*\n\n` +
        `*▸ .voice girl* — 👧 Girl Voice\n` +
        `*▸ .voice boy* — 👦 Boy Voice\n` +
        `*▸ .voice child* — 👶 Child Voice\n` +
        `*▸ .voice oldman* — 👴 Old Man\n` +
        `*▸ .voice robot* — 🤖 Robot\n` +
        `*▸ .voice deep* — 🎤 Deep\n` +
        `*▸ .voice helium* — 🎈 Helium\n` +
        `*▸ .voice whisper* — 🤫 Whisper\n` +
        `*▸ .voice uk* — 🇬🇧 UK English\n` +
        `*▸ .voice arabic* — 🌙 Arabic\n` +
        `*▸ .voice urdu* — 🇵🇰 Urdu/Hindi\n\n` +
        `📌 *Usage:* .voice <type> <text>\n_Example: .voice girl Hello everyone!_${F}`
      );
    }

    const text = args.slice(1).join(" ");
    if(!text) return reply(`${H("VOICE CHANGER")}\n\n❌ *Text likho!*\n📌 .voice ${type} <text>\n_Example: .voice girl Hello everyone!_${F}`);

    await reply(`${H("VOICE CHANGER")}\n\n⏳ *${VOICES[type].label} voice ban rahi found...*`);

    try {
      const url = `${B}${VOICES[type].path}?text=${encodeURIComponent(text.slice(0,200))}`;
      const d = await axios.get(url, {timeout:25000});
      const audioUrl = d.data?.result || d.data?.url || d.data?.audio;
      if(!audioUrl) throw new Error("no audio url");
      await sock.sendMessage(jid, {audio:{url:audioUrl}, mimetype:"audio/mpeg", ptt:true}, {quoted:msg});
    } catch (e) {
      reply(`${H("VOICE CHANGER")}\n\n❌ *Fail!*\n_API error: ${e.message}_${F}`);
    }
  }
};

// Individual TTS voice commands
const makeTTSCmd = (name, path, label) => ({
  name, alias:[],
  category:"voice",
  async execute({args, sock, jid, msg, reply}) {
    if(!args[0]) return reply(`${H(label.toUpperCase())}\n\n❌ *Usage:* .${name} <text>${F}`);
    const text = args.join(" ").slice(0,200);
    try {
      const d = await axios.get(`${B}${path}?text=${encodeURIComponent(text)}`, {timeout:20000});
      const url = d.data?.result || d.data?.url || d.data?.audio;
      if(!url) throw new Error("no url");
      await sock.sendMessage(jid, {audio:{url}, mimetype:"audio/mpeg", ptt:true}, {quoted:msg});
    } catch { reply(`${H(label.toUpperCase())}\n\n❌ *Fail!*${F}`); }
  }
});

module.exports = [voice,
  makeTTSCmd("ttsen", "/tts/tts-en", "TTS English"),
  makeTTSCmd("ttsar", "/tts/tts-ar", "TTS Arabic"),
  makeTTSCmd("ttshi", "/tts/tts-hi", "TTS Hindi"),
  makeTTSCmd("ttsru", "/tts/tts-ru", "TTS Russian"),
  makeTTSCmd("ttsjp", "/tts/tts-ja", "TTS Japanese"),
];
