const axios = require("axios");
const B = "https://apis.prexzyvilla.site";
const H = (t) => `╭─[ *𝗨ꜱᴍᴀɴ-𝗠ᴅ* ]─╮
┃ *${t}*
╰──────────────────╯`;
const F = `

> 𝗨ꜱᴍᴀɴ-𝗠ᴅ`;
const get = (url, t=15000) => axios.get(url, {timeout:t}).then(r=>r.data);

const sticker = {
  name:"sticker", alias:["s","stk"],
  category:"tools",
  async execute({sock, jid, msg, reply}) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgMsg = msg.message?.imageMessage || quoted?.imageMessage;
    const vidMsg = msg.message?.videoMessage || quoted?.videoMessage;
    if(!imgMsg && !vidMsg) return reply(`${H("STICKER")}\n\n❌ *Reply with an image or video!*${F}`);
    await reply(`${H("STICKER")}\n\n⏳ *Making sticker...*`);
    try {
      const srcMsg = imgMsg
        ? {message:{imageMessage:imgMsg}, key:{remoteJid:jid,id:"q"}}
        : {message:{videoMessage:vidMsg}, key:{remoteJid:jid,id:"q"}};
      const media = await sock.downloadMediaMessage(srcMsg, "buffer");
      await sock.sendMessage(jid, {sticker:media}, {quoted:msg});
    } catch { reply(`${H("STICKER")}\n\n❌ *Fail!*${F}`); }
  }
};

const weather = {
  name:"weather", alias:["mausam","wtr"],
  category:"tools",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("WEATHER")}\n\n❌ *Usage:* .weather <city>\n📌 _Example: .weather Karachi_${F}`);
    const city = args.join(" ");
    try {
      const r = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {timeout:10000});
      const cur = r.data?.current_condition?.[0];
      const area = r.data?.nearest_area?.[0];
      reply(`${H("WEATHER")}\n\n📍 *${area?.areaName?.[0]?.value || city}, ${area?.country?.[0]?.value || ""}*\n🌡️ *Temp:* ${cur?.temp_C}°C / ${cur?.temp_F}°F\n💧 *Humidity:* ${cur?.humidity}%\n💨 *Wind:* ${cur?.windspeedKmph} km/h\n☁️ *Condition:* ${cur?.weatherDesc?.[0]?.value || "N/A"}${F}`);
    } catch { reply(`${H("WEATHER")}\n\n❌ *City not found!*${F}`); }
  }
};

const wiki = {
  name:"wiki", alias:["wikipedia","search"],
  category:"tools",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("WIKIPEDIA")}\n\n❌ *Usage:* .wiki <topic>${F}`);
    const q = args.join(" ");
    try {
      const r = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`, {timeout:10000});
      reply(`${H("WIKIPEDIA")}\n\n📖 *${r.data.title}*\n\n${r.data.extract?.slice(0,700)}...\n\n🔗 ${r.data.content_urls?.desktop?.page}${F}`);
    } catch { reply(`${H("WIKIPEDIA")}\n\n❌ *Not found: ${q}*${F}`); }
  }
};

const translate = {
  name:"translate", alias:["tr","tarjuma"],
  category:"tools",
  async execute({args, reply}) {
    if(args.length < 2) return reply(`${H("TRANSLATE")}\n\n❌ *Usage:* .tr <lang> <text>\n📌 _Codes: ur=Urdu, en=English, ar=Arabic, hi=Hindi_${F}`);
    const lang = args[0].toLowerCase();
    const text = args.slice(1).join(" ");
    try {
      const r = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${lang}`, {timeout:10000});
      const translated = r.data?.responseData?.translatedText;
      if(!translated || translated.includes("PLEASE SELECT")) throw new Error("bad");
      reply(`${H("TRANSLATE")}\n\n📝 *Original:* ${text}\n🌐 *${lang.toUpperCase()}:* ${translated}${F}`);
    } catch { reply(`${H("TRANSLATE")}\n\n❌ *Translation fail!*${F}`); }
  }
};

const tts = {
  name:"tts", alias:["speak","bolao"],
  category:"tools",
  async execute({args, sock, jid, msg, reply}) {
    if(!args[0]) return reply(`${H("TEXT TO SPEECH")}\n\n❌ *Usage:* .tts <text>${F}`);
    const text = args.join(" ").slice(0,200);
    try {
      const url = `${B}/tts/tts-en?text=${encodeURIComponent(text)}`;
      const d = await get(url);
      const audioUrl = d?.result || d?.url || d?.audio;
      if(audioUrl) {
        await sock.sendMessage(jid, {audio:{url:audioUrl}, mimetype:"audio/mpeg", ptt:true}, {quoted:msg});
      } else {
        // Fallback Google TTS
        const gUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
        await sock.sendMessage(jid, {audio:{url:gUrl}, mimetype:"audio/mpeg", ptt:true}, {quoted:msg});
      }
    } catch {
      try {
        const gUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
        await sock.sendMessage(jid, {audio:{url:gUrl}, mimetype:"audio/mpeg", ptt:true}, {quoted:msg});
      } catch { reply(`${H("TTS")}\n\n❌ *Fail!*${F}`); }
    }
  }
};

const calc = {
  name:"calc", alias:["calculate","math"],
  category:"tools",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("CALCULATOR")}\n\n❌ *Usage:* .calc 2+2*5${F}`);
    try {
      const expr = args.join("").replace(/[^0-9+\-*/()%.^]/g,"");
      const result = Function(`"use strict"; return (${expr})`)();
      reply(`${H("CALCULATOR")}\n\n🧮 *${expr}*\n✅ *= ${result}*${F}`);
    } catch { reply(`${H("CALCULATOR")}\n\n❌ *Invalid expression!*${F}`); }
  }
};

const qr = {
  name:"qr", alias:["qrcode"],
  category:"tools",
  async execute({args, sock, jid, msg, reply}) {
    if(!args[0]) return reply(`${H("QR CODE")}\n\n❌ *Usage:* .qr <text>${F}`);
    const text = args.join(" ");
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}&margin=10`;
    await sock.sendMessage(jid, {image:{url}, caption:`${H("QR CODE")}\n\n📱 *${text.slice(0,60)}*${F}`}, {quoted:msg});
  }
};

const currency = {
  name:"currency", alias:["cur","exchange"],
  category:"tools",
  async execute({args, reply}) {
    if(args.length<3) return reply(`${H("CURRENCY")}\n\n❌ *Usage:* .currency 100 USD PKR${F}`);
    const [amount, from, to] = args;
    try {
      const r = await axios.get(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`, {timeout:10000});
      const rate = r.data?.rates?.[to.toUpperCase()];
      if(!rate) throw new Error("invalid");
      reply(`${H("CURRENCY")}\n\n💱 *${amount} ${from.toUpperCase()} = ${(parseFloat(amount)*rate).toFixed(2)} ${to.toUpperCase()}*\n📊 Rate: 1 ${from.toUpperCase()} = ${rate.toFixed(4)} ${to.toUpperCase()}${F}`);
    } catch { reply(`${H("CURRENCY")}\n\n❌ *Invalid currency!*\n_Use: USD PKR EUR GBP AED SAR_${F}`); }
  }
};

const timenow = {
  name:"time", alias:["date","clock"],
  category:"tools",
  async execute({reply}) {
    const now = new Date();
    const pkt = new Date(now.getTime()+5*3600000);
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    reply(`${H("TIME & DATE")}\n\n📅 *${days[pkt.getUTCDay()]}, ${pkt.getUTCDate()} ${months[pkt.getUTCMonth()]} ${pkt.getUTCFullYear()}*\n⏰ *${String(pkt.getUTCHours()).padStart(2,"0")}:${String(pkt.getUTCMinutes()).padStart(2,"0")} PKT*\n🌍 Pakistan Standard Time (UTC+5)${F}`);
  }
};

const lyrics = {
  name:"lyrics", alias:["lyric","lrc"],
  category:"tools",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("LYRICS")}\n\n❌ *Usage:* .lyrics <song name>${F}`);
    const q = args.join(" ");
    try {
      const d = await get(`${B}/search/lyrics?title=${encodeURIComponent(q)}`);
      const lyr = d?.result?.lyrics || d?.lyrics || d?.result;
      if(!lyr) throw new Error("no lyrics");
      reply(`${H("LYRICS")}\n\n🎵 *${d?.result?.title || q}*\n👤 *${d?.result?.artist || "Unknown"}*\n\n${(typeof lyr==='string'?lyr:'No lyrics').slice(0,1500)}${F}`);
    } catch { reply(`${H("LYRICS")}\n\n❌ *Lyrics not found for ${q}*${F}`); }
  }
};

const ss = {
  name:"ss", alias:["screenshot","webss"],
  category:"tools",
  async execute({args, sock, jid, msg, reply}) {
    if(!args[0]) return reply(`${H("SCREENSHOT")}\n\n❌ *Usage:* .ss <url>\n📌 _Example: .ss https://google.com_${F}`);
    const url = args[0].startsWith("http") ? args[0] : "https://"+args[0];
    await reply(`${H("SCREENSHOT")}\n\n⏳ *Taking screenshot...*`);
    try {
      const d = await get(`${B}/ssweb/webss?url=${encodeURIComponent(url)}`, 30000);
      const imgUrl = d?.result || d?.url || d?.image;
      if(!imgUrl) throw new Error("no url");
      await sock.sendMessage(jid, {image:{url:imgUrl}, caption:`${H("SCREENSHOT")}\n\n🔗 *${url}*${F}`}, {quoted:msg});
    } catch { reply(`${H("SCREENSHOT")}\n\n❌ *Fail!*${F}`); }
  }
};

const geoip = {
  name:"geoip", alias:["ip","ipinfo"],
  category:"tools",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("GEOIP")}\n\n❌ *Usage:* .geoip <ip address>${F}`);
    try {
      const d = await get(`${B}/tools/geoip?ip=${encodeURIComponent(args[0])}`);
      const r = d?.result || d?.data || d;
      reply(`${H("GEOIP")}\n\n🌐 *IP:* ${r?.ip || args[0]}\n🏠 *Country:* ${r?.country || "N/A"}\n🏙️ *City:* ${r?.city || "N/A"}\n📡 *ISP:* ${r?.isp || r?.org || "N/A"}${F}`);
    } catch { reply(`${H("GEOIP")}\n\n❌ *Fail!*${F}`); }
  }
};

const shorturl = {
  name:"shorturl", alias:["short","shorten"],
  category:"tools",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("URL SHORTENER")}\n\n❌ *Usage:* .shorturl <url>${F}`);
    try {
      const d = await get(`${B}/tools/random?url=${encodeURIComponent(args[0])}`);
      const short = d?.result || d?.url || d?.short;
      reply(`${H("URL SHORTENER")}\n\n🔗 *Original:* ${args[0].slice(0,50)}...\n✂️ *Short:* ${short}${F}`);
    } catch { reply(`${H("URL SHORTENER")}\n\n❌ *Fail!*${F}`); }
  }
};

const imdb = {
  name:"imdb", alias:["movie","film"],
  category:"tools",
  async execute({args, sock, jid, msg, reply}) {
    if(!args[0]) return reply(`${H("IMDB")}\n\n❌ *Usage:* .imdb <movie name>${F}`);
    const q = args.join(" ");
    try {
      const d = await get(`${B}/search/imdb?query=${encodeURIComponent(q)}`);
      const r = d?.result?.[0] || d?.[0] || d?.data?.[0];
      if(!r) throw new Error("not found");
      const caption = `${H("IMDB")}\n\n🎬 *${r.title || r.name}*\n⭐ *Rating:* ${r.rating || r.imdbRating || "N/A"}\n📅 *Year:* ${r.year || "N/A"}\n🎭 *Genre:* ${r.genre || "N/A"}\n📝 *Plot:* ${(r.plot || r.overview || "N/A").slice(0,200)}${F}`;
      if(r.poster || r.image) {
        await sock.sendMessage(jid, {image:{url:r.poster||r.image}, caption}, {quoted:msg});
      } else {
        reply(caption);
      }
    } catch { reply(`${H("IMDB")}\n\n❌ *Not found: ${q}*${F}`); }
  }
};

module.exports = [sticker, weather, wiki, translate, tts, calc, qr, currency, timenow, lyrics, ss, geoip, shorturl, imdb];
