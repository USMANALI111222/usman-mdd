const axios = require("axios");
const B = "https://apis.prexzyvilla.site";
const get = (url, t=15000) => axios.get(url, {timeout:t}).then(r=>r.data);
const getText = (d) => d?.result || d?.response || d?.text || d?.data || d?.content || d?.answer || (typeof d === "string" ? d : null);

const news = {
  name:"news", alias:["headlines"],
  category:"tools",
  async execute({args, reply}) {
    const topic = args.join(" ") || "world";
    try {
      const d = await get(`${B}/tools/news?query=${encodeURIComponent(topic)}`, 15000);
      const items = d?.result || d?.articles || d?.data || [];
      if(!items.length) throw new Error("no news");
      let out = `Nᴇᴡs: ${topic}\n\n`;
      items.slice(0,5).forEach((n,i) => {
        out += `${i+1}. *${n.title || n.headline}*\n${n.source || ""}\n\n`;
      });
      reply(out.trim());
    } catch { reply(`Could not fetch news for: ${topic}`); }
  }
};

const define = {
  name:"define", alias:["dict","meaning"],
  category:"tools",
  async execute({args, reply}) {
    if(!args[0]) return reply(`Usage: .define <word>`);
    const word = args.join(" ");
    try {
      const r = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {timeout:10000});
      const entry = r.data?.[0];
      const def = entry?.meanings?.[0]?.definitions?.[0];
      reply(`*${entry?.word}*\n\nPart of Speech: ${entry?.meanings?.[0]?.partOfSpeech}\n\nDefinition:\n${def?.definition}\n\nExample: ${def?.example || "N/A"}`);
    } catch { reply(`Definition not found for: ${word}`); }
  }
};

const urban = {
  name:"urban", alias:["slang","ud"],
  category:"tools",
  async execute({args, reply}) {
    if(!args[0]) return reply(`Usage: .urban <word>`);
    const word = args.join(" ");
    try {
      const r = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`, {timeout:10000});
      const e = r.data?.list?.[0];
      if(!e) throw new Error("not found");
      reply(`*${e.word}*\n\n${e.definition?.slice(0,500)}\n\nExample: ${e.example?.slice(0,200) || "N/A"}`);
    } catch { reply(`Not found: ${word}`); }
  }
};

const github = {
  name:"github", alias:["gh","gituser"],
  category:"tools",
  async execute({args, reply}) {
    if(!args[0]) return reply(`Usage: .github <username>`);
    const user = args[0];
    try {
      const r = await axios.get(`https://api.github.com/users/${user}`, {timeout:10000});
      const d = r.data;
      reply(`*${d.name || d.login}*\n\nUsername: ${d.login}\nBio: ${d.bio || "N/A"}\nRepos: ${d.public_repos}\nFollowers: ${d.followers}\nFollowing: ${d.following}\nLocation: ${d.location || "N/A"}\nLink: ${d.html_url}`);
    } catch { reply(`GitHub user not found: ${user}`); }
  }
};

const password = {
  name:"password", alias:["pass","pw","genpass"],
  category:"tools",
  async execute({args, reply}) {
    const len = parseInt(args[0]) || 16;
    if(len < 4 || len > 64) return reply(`Length must be between 4 and 64.`);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "";
    for(let i=0; i<len; i++) pass += chars[Math.floor(Math.random()*chars.length)];
    reply(`Generated Password (${len} chars):\n\`${pass}\`\n\nDo not share this with anyone.`);
  }
};

const ocr = {
  name:"ocr", alias:["readtext","imgtext"],
  category:"tools",
  async execute({args, msg, sock, jid, reply}) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg = msg.message?.imageMessage || quoted?.imageMessage;
    if(!imgMsg) return reply(`Reply to an image to read text from it.`);
    await reply(`Reading text from image...`);
    try {
      const src = {message:{imageMessage:imgMsg}, key:{remoteJid:jid, id:"q"}};
      const buf = await sock.downloadMediaMessage(src, "buffer");
      const base64 = buf.toString("base64");
      const d = await get(`${B}/tools/ocr?image=${encodeURIComponent("data:image/jpeg;base64,"+base64)}`, 20000);
      const text = getText(d);
      if(!text) throw new Error("no text");
      reply(`Text found:\n\n${text}`);
    } catch { reply(`Could not read text from image.`); }
  }
};

module.exports = [news, define, urban, github, password, ocr];
