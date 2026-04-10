const axios = require("axios");

const H = (t) => `╭─[ *𝗨ꜱᴍᴀɴ-𝗠ᴅ* ]─╮\n┃ *${t}*\n╰──────────────────╯`;
const F = `\n\n> 𝗨ꜱᴍᴀɴ-𝗠ᴅ`;

// ── FREE working helpers ──────────────────────────────
const get  = (url, t=20000) => axios.get(url, {timeout:t, headers:{"User-Agent":"Mozilla/5.0"}}).then(r=>r.data);
const post = (url, data, cfg={}) => axios.post(url, data, {timeout:20000, ...cfg}).then(r=>r.data);

// ── YouTube: cobalt.tools (100% free, no key needed) ──
async function cobaltFetch(url, isAudio=false) {
  const res = await axios.post("https://cobalt.tools/api/json",
    { url, isAudioOnly: isAudio, audioFormat: "mp3", isNoTTWatermark: true },
    { headers: { "Accept": "application/json", "Content-Type": "application/json" }, timeout: 30000 }
  );
  return res.data;
}

// ── YouTube search via yt-search style free API ────────
async function ytSearch(query) {
  const r = await get(`https://yt-api.p.rapidapi.com/search?query=${encodeURIComponent(query)}&hl=en&gl=US`, 10000).catch(()=>null);
  const id = r?.data?.[0]?.videoId;
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  // fallback: scrape suggestion
  const r2 = await get(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`).catch(()=>null);
  return null;
}

// ── TikTok (tikwm - free) ─────────────────────────────
async function tikwm(url) {
  const r = await axios.post("https://www.tikwm.com/api/",
    `url=${encodeURIComponent(url)}&hd=1`,
    { headers: {"Content-Type":"application/x-www-form-urlencoded"}, timeout:20000 }
  );
  return r.data?.data;
}

// ── Instagram (save-insta.com free API) ───────────────
async function igFetch(url) {
  const r = await axios.post("https://ssig.net/api/ajaxSearch",
    `q=${encodeURIComponent(url)}&t=media&lang=en`,
    { headers: {"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"}, timeout:20000 }
  );
  return r.data;
}

// ─────────────────────────────────────────────────────

const tiktok = {
  name:"tiktok", alias:["tt","tk"],
  category:"download",
  async execute({args, reply, sock, jid, msg}) {
    if(!args[0]) return reply(`${H("Tɪᴋᴛᴏᴋ")}\n\nUsage: .tiktok <url>${F}`);
    await reply(`${H("Tɪᴋᴛᴏᴋ")}\n\nDownloading...${F}`);
    try {
      const d = await tikwm(args[0]);
      const url = d?.hdplay || d?.play || d?.wmplay;
      if(!url) throw new Error("no url");
      const title = d?.title?.slice(0,80) || "TikTok";
      await sock.sendMessage(jid, {video:{url}, caption:`${H("Tɪᴋᴛᴏᴋ")}\n\n${title}${F}`}, {quoted:msg});
    } catch {
      try {
        // fallback: ssstik
        const r = await axios.post("https://ssstik.io/abc?url=dl",
          `id=${encodeURIComponent(args[0])}&locale=en&tt=aHR0cHM6Ly9zc3N0aWsuaW8v`,
          { headers:{"Content-Type":"application/x-www-form-urlencoded","User-Agent":"Mozilla/5.0"}, timeout:20000 }
        );
        const match = r.data?.match(/href="(https:\/\/tikcdn[^"]+)"/);
        const url2 = match?.[1];
        if(!url2) throw new Error("no url");
        await sock.sendMessage(jid, {video:{url:url2}, caption:`${H("Tɪᴋᴛᴏᴋ")}${F}`}, {quoted:msg});
      } catch { reply(`${H("Tɪᴋᴛᴏᴋ")}\n\nFailed. Check URL.${F}`); }
    }
  }
};

const ytv = {
  name:"ytv", alias:["youtube","yt","ytmp4"],
  category:"download",
  async execute({args, reply, sock, jid, msg}) {
    if(!args[0]) return reply(`${H("Yᴏᴜᴛᴜʙᴇ Vɪᴅᴇᴏ")}\n\nUsage: .ytv <youtube url>${F}`);
    await reply(`${H("Yᴏᴜᴛᴜʙᴇ Vɪᴅᴇᴏ")}\n\nDownloading video...${F}`);
    try {
      const d = await cobaltFetch(args[0], false);
      if(d?.status === "stream" || d?.status === "redirect") {
        const url = d.url;
        await sock.sendMessage(jid, {video:{url}, caption:`${H("Yᴏᴜᴛᴜʙᴇ Vɪᴅᴇᴏ")}${F}`, mimetype:"video/mp4"}, {quoted:msg});
      } else if(d?.status === "picker") {
        const url = d.picker?.[0]?.url;
        if(!url) throw new Error("no url");
        await sock.sendMessage(jid, {video:{url}, caption:`${H("Yᴏᴜᴛᴜʙᴇ Vɪᴅᴇᴏ")}${F}`, mimetype:"video/mp4"}, {quoted:msg});
      } else { throw new Error("cobalt fail"); }
    } catch {
      try {
        // fallback: yt1s
        const r1 = await post("https://yt1s.com/api/ajaxSearch/index",
          `q=${encodeURIComponent(args[0])}&vt=home`,
          {headers:{"Content-Type":"application/x-www-form-urlencoded"}}
        );
        const vid = r1?.vid;
        if(!vid) throw new Error("no vid");
        const r2 = await post("https://yt1s.com/api/ajaxConvert/convert",
          `vid=${vid}&k=${encodeURIComponent(r1?.links?.mp4?.['720']?.k || r1?.links?.mp4?.['480']?.k || "")}`,
          {headers:{"Content-Type":"application/x-www-form-urlencoded"}}
        );
        const url = r2?.dlink;
        if(!url) throw new Error("no url");
        await sock.sendMessage(jid, {video:{url}, caption:`${H("Yᴏᴜᴛᴜʙᴇ Vɪᴅᴇᴏ")}${F}`, mimetype:"video/mp4"}, {quoted:msg});
      } catch { reply(`${H("Yᴏᴜᴛᴜʙᴇ Vɪᴅᴇᴏ")}\n\nFailed. Use direct YouTube URL.${F}`); }
    }
  }
};

const song = {
  name:"song", alias:["play","ytmp3","music","mp3"],
  category:"download",
  async execute({args, reply, sock, jid, msg}) {
    if(!args[0]) return reply(`${H("Sᴏɴɢ Dᴏᴡɴʟᴏᴀᴅ")}\n\nUsage: .song <song name>\nExample: .song Shape of You Ed Sheeran${F}`);
    const q = args.join(" ");
    await reply(`${H("Sᴏɴɢ Dᴏᴡɴʟᴏᴀᴅ")}\n\nSearching: ${q}...${F}`);

    let ytUrl = q;
    // If not a URL, search for it
    if(!q.includes("youtube.com") && !q.includes("youtu.be")) {
      try {
        // Use yt-search free endpoint
        const sr = await get(`https://youtube.com/results?search_query=${encodeURIComponent(q)}`, 10000);
        const match = sr.match(/"videoId":"([^"]{11})"/);
        if(match) ytUrl = `https://www.youtube.com/watch?v=${match[1]}`;
      } catch {}
    }

    try {
      // cobalt.tools - best free option
      const d = await cobaltFetch(ytUrl, true);
      if(d?.status === "stream" || d?.status === "redirect") {
        await sock.sendMessage(jid, {audio:{url:d.url}, mimetype:"audio/mpeg", ptt:false}, {quoted:msg});
        await sock.sendMessage(jid, {text:`*${q}*`}, {quoted:msg});
        return;
      }
      throw new Error("cobalt no stream");
    } catch {}

    try {
      // fallback: yt1s mp3
      const r1 = await post("https://yt1s.com/api/ajaxSearch/index",
        `q=${encodeURIComponent(ytUrl)}&vt=home`,
        {headers:{"Content-Type":"application/x-www-form-urlencoded"}}
      );
      const vid = r1?.vid;
      const k = r1?.links?.mp3?.mp3128?.k;
      if(!vid || !k) throw new Error("no key");
      const r2 = await post("https://yt1s.com/api/ajaxConvert/convert",
        `vid=${vid}&k=${encodeURIComponent(k)}`,
        {headers:{"Content-Type":"application/x-www-form-urlencoded"}}
      );
      const url = r2?.dlink;
      if(!url) throw new Error("no url");
      const title = r1?.title || q;
      await sock.sendMessage(jid, {audio:{url}, mimetype:"audio/mpeg", ptt:false}, {quoted:msg});
      await sock.sendMessage(jid, {text:`*${title}*`}, {quoted:msg});
      return;
    } catch {}

    reply(`${H("Sᴏɴɢ Dᴏᴡɴʟᴏᴀᴅ")}\n\nFailed to download. Try a direct YouTube URL.${F}`);
  }
};

const igdl = {
  name:"igdl", alias:["instagram","ig","insta"],
  category:"download",
  async execute({args, reply, sock, jid, msg}) {
    if(!args[0]) return reply(`${H("Iɴsᴛᴀɢʀᴀᴍ")}\n\nUsage: .igdl <url>${F}`);
    await reply(`${H("Iɴsᴛᴀɢʀᴀᴍ")}\n\nDownloading...${F}`);
    try {
      const d = await cobaltFetch(args[0], false);
      if(d?.status === "stream" || d?.status === "redirect") {
        await sock.sendMessage(jid, {video:{url:d.url}, caption:`${H("Iɴsᴛᴀɢʀᴀᴍ")}${F}`}, {quoted:msg});
      } else if(d?.status === "picker") {
        for(const item of (d.picker || []).slice(0,4)) {
          const isVid = item?.type === "video";
          await sock.sendMessage(jid, {[isVid?"video":"image"]:{url:item.url}, caption:""}, {quoted:msg});
        }
      } else { throw new Error("no result"); }
    } catch {
      try {
        // fallback: instadownloader.app
        const r = await post("https://instadownloader.app/wp-admin/admin-ajax.php",
          `action=tiga_get_download_url&url=${encodeURIComponent(args[0])}`,
          {headers:{"Content-Type":"application/x-www-form-urlencoded"}}
        );
        const url = r?.url?.[0]?.url || r?.url;
        if(!url) throw new Error("no url");
        const isVid = url.includes(".mp4");
        await sock.sendMessage(jid, {[isVid?"video":"image"]:{url}, caption:`${H("Iɴsᴛᴀɢʀᴀᴍ")}${F}`}, {quoted:msg});
      } catch { reply(`${H("Iɴsᴛᴀɢʀᴀᴍ")}\n\nFailed. Post must be public.${F}`); }
    }
  }
};

const fbdl = {
  name:"fb", alias:["facebook","fbdl"],
  category:"download",
  async execute({args, reply, sock, jid, msg}) {
    if(!args[0]) return reply(`${H("Fᴀᴄᴇʙᴏᴏᴋ")}\n\nUsage: .fb <url>${F}`);
    await reply(`${H("Fᴀᴄᴇʙᴏᴏᴋ")}\n\nDownloading...${F}`);
    try {
      const d = await cobaltFetch(args[0], false);
      const url = d?.url;
      if(!url) throw new Error("no url");
      await sock.sendMessage(jid, {video:{url}, caption:`${H("Fᴀᴄᴇʙᴏᴏᴋ")}${F}`}, {quoted:msg});
    } catch {
      try {
        const r = await post("https://getfvid.com/downloader",
          `URLz=${encodeURIComponent(args[0])}`,
          {headers:{"Content-Type":"application/x-www-form-urlencoded","User-Agent":"Mozilla/5.0"}}
        );
        const match = r?.match(/href="(https:\/\/video\.fdcdn\.net[^"]+)"/);
        const url2 = match?.[1];
        if(!url2) throw new Error("no url");
        await sock.sendMessage(jid, {video:{url:url2}, caption:`${H("Fᴀᴄᴇʙᴏᴏᴋ")}${F}`}, {quoted:msg});
      } catch { reply(`${H("Fᴀᴄᴇʙᴏᴏᴋ")}\n\nFailed. Video must be public.${F}`); }
    }
  }
};

const twitter = {
  name:"twitter", alias:["x","twit","xdl"],
  category:"download",
  async execute({args, reply, sock, jid, msg}) {
    if(!args[0]) return reply(`${H("Tᴡɪᴛᴛᴇʀ/X")}\n\nUsage: .twitter <url>${F}`);
    await reply(`${H("Tᴡɪᴛᴛᴇʀ/X")}\n\nDownloading...${F}`);
    try {
      const d = await cobaltFetch(args[0], false);
      const url = d?.url || d?.picker?.[0]?.url;
      if(!url) throw new Error("no url");
      await sock.sendMessage(jid, {video:{url}, caption:`${H("Tᴡɪᴛᴛᴇʀ/X")}${F}`}, {quoted:msg});
    } catch { reply(`${H("Tᴡɪᴛᴛᴇʀ/X")}\n\nFailed. Tweet must have a video.${F}`); }
  }
};

const spotify = {
  name:"spotify", alias:["sp","spot"],
  category:"download",
  async execute({args, reply, sock, jid, msg}) {
    if(!args[0]) return reply(`${H("Sᴘᴏᴛɪꜰʏ")}\n\nUsage: .spotify <track name or url>${F}`);
    const q = args.join(" ");
    await reply(`${H("Sᴘᴏᴛɪꜰʏ")}\n\nSearching: ${q}...${F}`);
    // Spotify -> search YT -> download audio
    try {
      const sr = await get(`https://youtube.com/results?search_query=${encodeURIComponent(q+" audio")}`, 10000);
      const match = sr.match(/"videoId":"([^"]{11})"/);
      if(!match) throw new Error("no result");
      const ytUrl = `https://www.youtube.com/watch?v=${match[1]}`;
      const d = await cobaltFetch(ytUrl, true);
      if(d?.status !== "stream" && d?.status !== "redirect") throw new Error("cobalt fail");
      await sock.sendMessage(jid, {audio:{url:d.url}, mimetype:"audio/mpeg", ptt:false}, {quoted:msg});
      await sock.sendMessage(jid, {text:`*${q}*`}, {quoted:msg});
    } catch { reply(`${H("Sᴘᴏᴛɪꜰʏ")}\n\nFailed. Try .song instead.${F}`); }
  }
};

const pinterest = {
  name:"pinterest", alias:["pin","pint"],
  category:"download",
  async execute({args, reply, sock, jid, msg}) {
    if(!args[0]) return reply(`${H("Pɪɴᴛᴇʀᴇsᴛ")}\n\nUsage: .pinterest <url>${F}`);
    await reply(`${H("Pɪɴᴛᴇʀᴇsᴛ")}\n\nDownloading...${F}`);
    try {
      const r = await get(args[0], 15000);
      const match = r.match(/"url":"(https:\/\/[^"]+\.(jpg|png|mp4)[^"]*)"/);
      const url = match?.[1]?.replace(/\\u002F/g,"/");
      if(!url) throw new Error("no url");
      const isVid = url.includes(".mp4");
      await sock.sendMessage(jid, {[isVid?"video":"image"]:{url}, caption:`${H("Pɪɴᴛᴇʀᴇsᴛ")}${F}`}, {quoted:msg});
    } catch { reply(`${H("Pɪɴᴛᴇʀᴇsᴛ")}\n\nFailed.${F}`); }
  }
};

const capcut = {
  name:"capcut", alias:["cc"],
  category:"download",
  async execute({args, reply, sock, jid, msg}) {
    if(!args[0]) return reply(`${H("Cᴀᴘᴄᴜᴛ")}\n\nUsage: .capcut <url>${F}`);
    await reply(`${H("Cᴀᴘᴄᴜᴛ")}\n\nDownloading...${F}`);
    try {
      const d = await cobaltFetch(args[0], false);
      const url = d?.url;
      if(!url) throw new Error("no url");
      await sock.sendMessage(jid, {video:{url}, caption:`${H("Cᴀᴘᴄᴜᴛ")}${F}`}, {quoted:msg});
    } catch { reply(`${H("Cᴀᴘᴄᴜᴛ")}\n\nFailed.${F}`); }
  }
};

const mediafire = {
  name:"mediafire", alias:["mf"],
  category:"download",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("Mᴇᴅɪᴀꜰɪʀᴇ")}\n\nUsage: .mediafire <url>${F}`);
    await reply(`${H("Mᴇᴅɪᴀꜰɪʀᴇ")}\n\nGetting link...${F}`);
    try {
      const r = await get(args[0], 15000);
      const match = r.match(/href="(https:\/\/download\d*\.mediafire\.com\/[^"]+)"/);
      const url = match?.[1];
      if(!url) throw new Error("no url");
      const nameMatch = r.match(/<div class="filename">([^<]+)<\/div>/);
      const name = nameMatch?.[1]?.trim() || "File";
      reply(`${H("Mᴇᴅɪᴀꜰɪʀᴇ")}\n\n*${name}*\n\nLink:\n${url}${F}`);
    } catch { reply(`${H("Mᴇᴅɪᴀꜰɪʀᴇ")}\n\nFailed.${F}`); }
  }
};

const aio = {
  name:"aio", alias:["dl"],
  category:"download",
  async execute({args, reply, sock, jid, msg}) {
    if(!args[0]) return reply(`${H("Dᴏᴡɴʟᴏᴀᴅᴇʀ")}\n\nUsage: .aio <url>\nSupports: YouTube, TikTok, Instagram, Twitter, Facebook, Pinterest${F}`);
    await reply(`${H("Dᴏᴡɴʟᴏᴀᴅᴇʀ")}\n\nDownloading...${F}`);
    try {
      const d = await cobaltFetch(args[0], false);
      const url = d?.url || d?.picker?.[0]?.url;
      if(!url) throw new Error("no url");
      const isAudio = url.includes(".mp3") || url.includes("audio");
      const isVid = !isAudio && (url.includes(".mp4") || d?.status === "stream");
      if(isAudio) {
        await sock.sendMessage(jid, {audio:{url}, mimetype:"audio/mpeg", ptt:false}, {quoted:msg});
      } else {
        await sock.sendMessage(jid, {[isVid?"video":"image"]:{url}, caption:`${H("Dᴏᴡɴʟᴏᴀᴅᴇʀ")}${F}`}, {quoted:msg});
      }
    } catch { reply(`${H("Dᴏᴡɴʟᴏᴀᴅᴇʀ")}\n\nFailed. Try platform-specific command.${F}`); }
  }
};

module.exports = [tiktok, ytv, song, igdl, fbdl, twitter, spotify, pinterest, capcut, mediafire, aio];
