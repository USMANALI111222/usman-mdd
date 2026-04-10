const axios = require("axios");
const B = "https://apis.prexzyvilla.site";
const H = (t) => `╭─[ *𝗨ꜱᴍᴀɴ-𝗠ᴅ* ]─╮
┃ *${t}*
╰──────────────────╯`;
const F = `

> 𝗨ꜱᴍᴀɴ-𝗠ᴅ`;
const get = (url, t=15000) => axios.get(url, {timeout:t}).then(r=>r.data);
const getText = (d) => d?.result || d?.response || d?.answer || d?.message || d?.text || d?.reply || d?.output || d?.content || (typeof d === "string" ? d : null);

// ── AI CHAT ──────────────────────────────────────────
const ai = {
  name:"ai", alias:["ask","chat","gpt"],
  category:"ai",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("AI CHAT")}\n\n❌ Usage: .ai <question>${F}`);
    const q = args.join(" ");
    await reply(`${H("AI CHAT")}\n\n⏳ Thinking...`);
    try {
      const d = await get(`${B}/ai/gpt4?text=${encodeURIComponent(q)}`, 20000);
      const ans = getText(d);
      if(!ans) throw new Error("no answer");
      reply(`${H("AI CHAT")}\n\n❓ *${q}*\n\n💬 ${ans}${F}`);
    } catch {
      try {
        const d2 = await get(`${B}/ai/aichat?prompt=${encodeURIComponent(q)}`, 20000);
        reply(`${H("AI CHAT")}\n\n💬 ${getText(d2) || "No answer found."}${F}`);
      } catch { reply(`${H("AI CHAT")}\n\n❌ AI is currently unavailable!${F}`); }
    }
  }
};

const gpt5 = {
  name:"gpt5", alias:["gpt-5"],
  category:"ai",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("GPT-5")}\n\n❌ Usage: .gpt5 <text>${F}`);
    const q = args.join(" ");
    await reply(`${H("GPT-5")}\n\n⏳ GPT-5 thinking...`);
    try {
      const d = await get(`${B}/ai/gpt-5?text=${encodeURIComponent(q)}`, 25000);
      reply(`${H("GPT-5")}\n\n💬 ${getText(d) || "No response."}${F}`);
    } catch { reply(`${H("GPT-5")}\n\n❌ Failed!${F}`); }
  }
};

const copilot = {
  name:"copilot", alias:["ms","microsoft"],
  category:"ai",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("COPILOT")}\n\n❌ Usage: .copilot <text>${F}`);
    const q = args.join(" ");
    await reply(`${H("COPILOT")}\n\n⏳ Copilot thinking...`);
    try {
      const d = await get(`${B}/ai/copilot?text=${encodeURIComponent(q)}`, 20000);
      reply(`${H("COPILOT")}\n\n💬 ${getText(d) || "No response."}${F}`);
    } catch {
      try {
        const d2 = await get(`${B}/ai/copilot-think?text=${encodeURIComponent(q)}`, 25000);
        reply(`${H("COPILOT")}\n\n💬 ${getText(d2) || "No response."}${F}`);
      } catch { reply(`${H("COPILOT")}\n\n❌ Failed!${F}`); }
    }
  }
};

const deepseek = {
  name:"deepseek", alias:["ds"],
  category:"ai",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("DEEPSEEK")}\n\n❌ Usage: .deepseek <text>${F}`);
    const q = args.join(" ");
    await reply(`${H("DEEPSEEK")}\n\n⏳ DeepSeek thinking...`);
    try {
      const d = await get(`${B}/ai/deepseekchat?prompt=${encodeURIComponent(q)}`, 25000);
      reply(`${H("DEEPSEEK")}\n\n💬 ${getText(d) || "No response."}${F}`);
    } catch {
      try {
        const d2 = await get(`${B}/ai/deepseekreasoner?prompt=${encodeURIComponent(q)}`, 30000);
        reply(`${H("DEEPSEEK")}\n\n💬 ${getText(d2) || "No response."}${F}`);
      } catch { reply(`${H("DEEPSEEK")}\n\n❌ Failed!${F}`); }
    }
  }
};

const zai = {
  name:"zai", alias:["glm","zglm"],
  category:"ai",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("Z.AI GLM-5")}\n\n❌ Usage: .zai <text>${F}`);
    const q = args.join(" ");
    await reply(`${H("Z.AI GLM-5")}\n\n⏳ GLM-5 thinking...`);
    try {
      const d = await get(`${B}/ai/zai?text=${encodeURIComponent(q)}`, 20000);
      reply(`${H("Z.AI GLM-5")}\n\n💬 ${getText(d) || "No response."}${F}`);
    } catch { reply(`${H("Z.AI GLM-5")}\n\n❌ Failed!${F}`); }
  }
};

const logical = {
  name:"logical", alias:["logic","analyze"],
  category:"ai",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("LOGICAL AI")}\n\n❌ Usage: .logical <question>${F}`);
    const q = args.join(" ");
    await reply(`${H("LOGICAL AI")}\n\n⏳ Analyzing...`);
    try {
      const d = await get(`${B}/ai/logical?text=${encodeURIComponent(q)}`, 20000);
      reply(`${H("LOGICAL AI")}\n\n🧠 ${getText(d) || "No response."}${F}`);
    } catch { reply(`${H("LOGICAL AI")}\n\n❌ Failed!${F}`); }
  }
};

const creative = {
  name:"creative", alias:["brainstorm","createai"],
  category:"ai",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("CREATIVE AI")}\n\n❌ Usage: .creative <idea>${F}`);
    const q = args.join(" ");
    await reply(`${H("CREATIVE AI")}\n\n⏳ Creating...`);
    try {
      const d = await get(`${B}/ai/creative?text=${encodeURIComponent(q)}`, 20000);
      reply(`${H("CREATIVE AI")}\n\n✨ ${getText(d) || "No response."}${F}`);
    } catch { reply(`${H("CREATIVE AI")}\n\n❌ Failed!${F}`); }
  }
};

const summarize = {
  name:"summarize", alias:["sum","tldr"],
  category:"ai",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("SUMMARIZE")}\n\n❌ Usage: .summarize <text>${F}`);
    const text = args.join(" ");
    await reply(`${H("SUMMARIZE")}\n\n⏳ Summarizing...`);
    try {
      const d = await get(`${B}/ai/summarize?text=${encodeURIComponent(text)}`, 20000);
      reply(`${H("SUMMARIZE")}\n\n📝 ${getText(d) || "No summary."}${F}`);
    } catch { reply(`${H("SUMMARIZE")}\n\n❌ Failed!${F}`); }
  }
};

const dream = {
  name:"dream", alias:["khwab"],
  category:"ai",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("DREAM INTERPRETER")}\n\n❌ Usage: .dream <describe your dream>${F}`);
    const d_text = args.join(" ");
    await reply(`${H("DREAM INTERPRETER")}\n\n⏳ Interpreting dream...`);
    try {
      const d = await get(`${B}/ai/dream?dream=${encodeURIComponent(d_text)}`, 20000);
      reply(`${H("DREAM INTERPRETER")}\n\n🌙 *Dream:* ${d_text}\n\n✨ *Meaning:*\n${getText(d) || "No interpretation."}${F}`);
    } catch { reply(`${H("DREAM INTERPRETER")}\n\n❌ Failed!${F}`); }
  }
};

const story = {
  name:"story", alias:["storyai"],
  category:"ai",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("STORY AI")}\n\n❌ Usage: .story <topic>${F}`);
    const text = args.join(" ");
    await reply(`${H("STORY AI")}\n\n⏳ Writing story...`);
    try {
      const d = await get(`${B}/ai/quick?text=${encodeURIComponent(text)}`, 25000);
      reply(`${H("STORY AI")}\n\n📖 ${getText(d) || "No story."}${F}`);
    } catch { reply(`${H("STORY AI")}\n\n❌ Failed!${F}`); }
  }
};

const codeai = {
  name:"codeai", alias:["code","promptcode"],
  category:"ai",
  async execute({args, reply}) {
    if(args.length < 2) return reply(`${H("CODE AI")}\n\n❌ Usage: .codeai <language> <task>\n📌 Example: .codeai javascript sort array${F}`);
    const language = args[0];
    const prompt = args.slice(1).join(" ");
    await reply(`${H("CODE AI")}\n\n⏳ Writing code...`);
    try {
      const d = await get(`${B}/ai/prompttocode?prompt=${encodeURIComponent(prompt)}&language=${encodeURIComponent(language)}`, 20000);
      reply(`${H("CODE AI")}\n\n\`\`\`${language}\n${getText(d) || "No code."}\n\`\`\`${F}`);
    } catch { reply(`${H("CODE AI")}\n\n❌ Failed!${F}`); }
  }
};

const detectbugs = {
  name:"detectbugs", alias:["bugcheck","fixcode"],
  category:"ai",
  async execute({args, reply}) {
    if(!args[0]) return reply(`${H("DETECT BUGS")}\n\n❌ Usage: .detectbugs <code>${F}`);
    const code = args.join(" ");
    await reply(`${H("DETECT BUGS")}\n\n⏳ Scanning for bugs...`);
    try {
      const d = await get(`${B}/ai/detectbugs?code=${encodeURIComponent(code)}`, 20000);
      reply(`${H("DETECT BUGS")}\n\n🔍 ${getText(d) || "No bugs found."}${F}`);
    } catch { reply(`${H("DETECT BUGS")}\n\n❌ Failed!${F}`); }
  }
};

// ── AI IMAGE GEN ─────────────────────────────────────
const imagine = {
  name:"imagine", alias:["dalle","img2ai","aiimg"],
  category:"ai",
  async execute({args, sock, jid, msg, reply}) {
    if(!args[0]) return reply(`${H("AI IMAGE")}\n\n❌ Usage: .imagine <description>${F}`);
    const prompt = args.join(" ");
    await reply(`${H("AI IMAGE")}\n\n⏳ Generating image...\n_${prompt}_`);
    try {
      const d = await get(`${B}/ai/dalle?prompt=${encodeURIComponent(prompt)}`, 35000);
      const url = d?.result || d?.url || d?.image || d?.imageUrl;
      if(!url) throw new Error("no url");
      await sock.sendMessage(jid, {image:{url}, caption:`${H("AI IMAGE")}\n\n🎨 *${prompt}*${F}`}, {quoted:msg});
    } catch {
      try {
        const url2 = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
        await sock.sendMessage(jid, {image:{url:url2}, caption:`${H("AI IMAGE")}\n\n🎨 *${prompt}*${F}`}, {quoted:msg});
      } catch { reply(`${H("AI IMAGE")}\n\n❌ Failed!${F}`); }
    }
  }
};

// Name-to-image commands (hacker, cyber, warrior, etc.)
const makeNameCmd = (name, alias, style, emoji) => ({
  name, alias: [alias],
  category:"ai",
  async execute({args, sock, jid, msg, reply}) {
    if(!args[0]) return reply(`${H(name.toUpperCase())}\n\n❌ Usage: .${name} <your name>${F}`);
    const prompt = `${style} style warrior with name ${args.join(" ")} written on it, glowing text, dramatic lighting, epic art`;
    await reply(`${H(name.toUpperCase())}\n\n⏳ ${emoji} Generating ${name} image...`);
    try {
      const d = await get(`${B}/ai/dalle?prompt=${encodeURIComponent(prompt)}`, 35000);
      const url = d?.result || d?.url || d?.image;
      if(!url) throw new Error("no url");
      await sock.sendMessage(jid, {image:{url}, caption:`${H(name.toUpperCase())}\n\n${emoji} *${args.join(" ")}*${F}`}, {quoted:msg});
    } catch {
      try {
        const url2 = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
        await sock.sendMessage(jid, {image:{url:url2}, caption:`${H(name.toUpperCase())}\n\n${emoji} *${args.join(" ")}*${F}`}, {quoted:msg});
      } catch { reply(`${H(name.toUpperCase())}\n\n❌ Failed!${F}`); }
    }
  }
});

// Style image commands (realistic, cartoon, etc.)
const makeStyleCmd = (name, alias, apiStyle, label, emoji) => ({
  name, alias: [alias],
  category:"ai",
  async execute({args, sock, jid, msg, reply}) {
    if(!args[0]) return reply(`${H(label.toUpperCase())}\n\n❌ Usage: .${name} <description>${F}`);
    const prompt = args.join(" ");
    await reply(`${H(label.toUpperCase())}\n\n⏳ ${emoji} Generating ${label} image...`);
    try {
      const d = await get(`${B}/ai/${apiStyle}?prompt=${encodeURIComponent(prompt)}`, 35000);
      const url = d?.result || d?.url || d?.image;
      if(!url) throw new Error("no url");
      await sock.sendMessage(jid, {image:{url}, caption:`${H(label.toUpperCase())}\n\n${emoji} *${prompt}*${F}`}, {quoted:msg});
    } catch {
      try {
        const url2 = `https://image.pollinations.ai/prompt/${encodeURIComponent(apiStyle+" "+prompt)}?width=512&height=512&nologo=true`;
        await sock.sendMessage(jid, {image:{url:url2}, caption:`${H(label.toUpperCase())}\n\n${emoji} *${prompt}*${F}`}, {quoted:msg});
      } catch { reply(`${H(label.toUpperCase())}\n\n❌ Failed!${F}`); }
    }
  }
});

module.exports = [
  ai, gpt5, copilot, deepseek, zai, logical, creative, summarize, dream, story, codeai, detectbugs, imagine,

  // Name-style image cmds
  makeNameCmd("hacker","hackr","dark hacker cyberpunk neon green","💚"),
  makeNameCmd("cyber","cyberx","neon cyberpunk blue electric","💙"),
  makeNameCmd("warrior","warr","epic battle warrior armor flames","⚔️"),
  makeNameCmd("demon","demonx","dark demon hellfire evil","😈"),
  makeNameCmd("ghost","ghostx","ghost white ethereal glowing fog","👻"),
  makeNameCmd("shadow","shadowx","shadow ninja black dark stealth","🖤"),
  makeNameCmd("fire","firex","fire flames burning phoenix red orange","🔥"),
  makeNameCmd("king","kingx","royal king golden crown majestic","👑"),
  makeNameCmd("wolf","wolfx","wolf howling moonlit forest","🐺"),
  makeNameCmd("dragon","dragonx","dragon fire scales fantasy epic","🐉"),
  makeNameCmd("anime","animex","anime character manga colorful","🎌"),
  makeNameCmd("galaxy","galaxyx","galaxy stars nebula cosmic","🌌"),
  makeNameCmd("robot","robotx","futuristic robot metallic chrome","🤖"),
  makeNameCmd("ninja","ninjax","ninja stealth black katana","🥷"),
  makeNameCmd("god","godx","divine god golden light celestial","⚡"),

  // Style image cmds
  makeStyleCmd("realistic","realimg","realistic","Realistic","📸"),
  makeStyleCmd("cartoon","cartoonimg","cartoon","Cartoon","🎠"),
  makeStyleCmd("sketch","sketchimg","sketch","Sketch","✏️"),
  makeStyleCmd("pixelart","pixelimg","pixel-art","Pixel Art","🎮"),
  makeStyleCmd("horror","horrorimg","horror","Horror","👁️"),
  makeStyleCmd("scifi","scifiimg","sci-fi","Sci-Fi","🚀"),
  makeStyleCmd("fantasy","fantasyimg","fantasy","Fantasy","🧙"),
  makeStyleCmd("watercolor","waterimg","watercolor","Watercolor","🎨"),
  makeStyleCmd("vintage","vintageimg","vintage","Vintage","📷"),
  makeStyleCmd("oilpaint","oilimg","oil-painting","Oil Paint","🖼️"),
  makeStyleCmd("abstract","abstractimg","abstract","Abstract","🌀"),
  makeStyleCmd("popart","popimg","pop-art","Pop Art","🎭"),
  makeStyleCmd("steampunk","steamimg","steampunk","Steampunk","⚙️"),
];
