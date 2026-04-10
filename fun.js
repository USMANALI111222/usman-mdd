const axios = require("axios");
const B = "https://apis.prexzyvilla.site";
const H = (t) => `╭─[ *𝗨ꜱᴍᴀɴ-𝗠ᴅ* ]─╮
┃ *${t}*
╰──────────────────╯`;
const F = `

> 𝗨ꜱᴍᴀɴ-𝗠ᴅ`;
const get = (url, t=10000) => axios.get(url, {timeout:t}).then(r=>r.data);
const getText = (d) => d?.result || d?.text || d?.content || d?.data;

const joke = {
  name:"joke", alias:["jokes","funny"],
  category:"fun",
  async execute({reply}) {
    try {
      const d = await get("https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist&type=single");
      reply(`${H("JOKE 😂")}\n\n${d?.joke || "Haath dhono corona hai 😂"}${F}`);
    } catch {
      const jokes = ["Why do programmers prefer dark mode? Because light attracts bugs!","I told my wife she was drawing her eyebrows too high. She looked surprised.","Why don't scientists trust atoms? Because they make up everything!"];
      reply(`${H("JOKE 😂")}\n\n${jokes[Math.floor(Math.random()*jokes.length)]}${F}`);
    }
  }
};

const quote = {
  name:"quote", alias:["aqwal","wisdom"],
  category:"fun",
  async execute({reply}) {
    try {
      const r = await axios.get("https://api.quotable.io/random", {timeout:8000});
      reply(`${H("QUOTE 💭")}\n\n_"${r.data?.content}"_\n\n— *${r.data?.author}*${F}`);
    } catch {
      const quotes = ['"Hard times create strong people.","Success belongs to those who keep trying.","Every storm ends with sunshine."];
      reply(`${H("QUOTE 💭")}\n\n💭 _${quotes[Math.floor(Math.random()*quotes.length)]}_${F}`);
    }
  }
};

const roast = {
  name:"roast", alias:["insult","bakwas"],
  category:"fun",
  async execute({args, msg, reply}) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const name = args[0] || mentioned?.[0]?.split("@")[0] || "tu";
    const roasts = [
      `${name} is so slow, Google stopped indexing them 😂`,
      `${name} should go to the gym — especially for their brain 💪`,
      `${name} 's life is so boring, Netflix rejected the script 😂`,
      `${name} drank water and the water filed a complaint 💀`,
      `${name} 's WiFi and IQ run at the same speed 🤣`,
    ];
    reply(`${H("ROAST 🔥")}\n\n${roasts[Math.floor(Math.random()*roasts.length)]}${F}`);
  }
};

const ship = {
  name:"ship", alias:["love","lovecalc"],
  category:"fun",
  async execute({args, msg, reply}) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const name1 = args[0] || mentioned[0]?.split("@")[0] || "Ali";
    const name2 = args[1] || mentioned[1]?.split("@")[0] || "Sara";
    const pct = Math.floor(Math.random()*101);
    const emoji = pct>=80?"💘":pct>=60?"❤️":pct>=40?"💛":pct>=20?"💔":"😬";
    const msg2 = pct>=80?"Perfect match! 💑":pct>=60?"Good compatibility! 😊":pct>=40?"Just friends maybe 🤝":"Not a great match 😬";
    reply(`${H("SHIP 💘")}\n\n💑 *${name1}* + *${name2}*\n\n${emoji} *Love: ${pct}%*\n\n${msg2}${F}`);
  }
};

const truth = {
  name:"truth",
  category:"fun",
  async execute({reply}) {
    const truths = [
      "Have you ever cried over someone?",
      "Share your most embarrassing moment",
      "Kisi par crush tha jo pata chala?",
      "What was your biggest mistake?",
      "Social media pe koi alag personality maintain karte ho?",
      "Kabhi kisi se jhooth bola jaan boojh ke?",
    ];
    reply(`${H("TRUTH 🎯")}\n\n❓ *${truths[Math.floor(Math.random()*truths.length)]}*${F}`);
  }
};

const dare = {
  name:"dare",
  category:"fun",
  async execute({reply}) {
    const dares = [
      "Sing a song in the group",
      "Change your profile picture for 1 hour",
      "Send a random voice note to someone",
      "Do 10 pushups and send proof",
      "Status mein likho 'Main bewaqoof hoon' 😂",
      "Sing a line of your favorite song and send it",
    ];
    reply(`${H("DARE 🎲")}\n\n🎯 *${dares[Math.floor(Math.random()*dares.length)]}*${F}`);
  }
};

const eightball = {
  name:"8ball", alias:["magic","8b"],
  category:"fun",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("8 BALL 🎱")}\n\n❌ *Usage:* .8ball <sawaal>${F}`);
    const q = args.join(" ");
    const answers = ["Yes, definitely!","Absolutely!","For sure!","Maybe...","Not sure","It is possible","Don't count on it","No way!","Definitely not!","The future is unclear"];
    reply(`${H("8 BALL 🎱")}\n\n❓ *${q}*\n\n🎱 *${answers[Math.floor(Math.random()*answers.length)]}*${F}`);
  }
};

// Anime GIF reactions
const makeReaction = (name, alias, label, path) => ({
  name, alias:[alias],
  category:"fun",
  async execute({sock, jid, msg, reply}) {
    try {
      const d = await axios.get(`${B}${path}`, {timeout:15000});
      const url = d.data?.result || d.data?.url || d.data?.gif;
      if(!url) throw new Error("no url");
      const isVid = url.endsWith('.mp4');
      await sock.sendMessage(jid, {[isVid?'video':'image']:{url,gifPlayback:isVid}, caption:`${H(label)}\n\n${label}!`}, {quoted:msg});
    } catch { reply(`${H(label)}\n\n❌ *GIF not found!*${F}`); }
  }
});

module.exports = [joke, quote, roast, ship, truth, dare, eightball,
  makeReaction("hug","abrazo","HUG 🤗","/anime/hug"),
  makeReaction("slap","thappar","SLAP 👋","/anime/slap"),
  makeReaction("pat","seetlana","PAT 🤝","/anime/pat"),
  makeReaction("cry","rona","CRY 😭","/anime/cry"),
  makeReaction("dance","nacho","DANCE 💃","/anime/dance"),
  makeReaction("wink","aankhmarana","WINK 😉","/anime/wink"),
  makeReaction("cuddle","gale","CUDDLE 🤗","/anime/cuddle"),
  makeReaction("bonk","bonk","BONK 🔨","/anime/bonk"),
];
