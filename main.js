const { getRuntime } = require("./helpers");

const ping = {
  name: "ping",
  alias: ["speed"],
  description: "Check bot speed",
  category: "main",
  async execute({ reply }) {
    const start = Date.now();
    await reply("Pinging...");
    const end = Date.now();
    reply(`Pong! ${end - start}ms`);
  },
};

const alive = {
  name: "alive",
  alias: ["active"],
  description: "Check if bot is alive",
  category: "main",
  async execute({ reply }) {
    const config = global.config;
    reply(
      `*${config.botName}* is alive!\n\n` +
      `Owner: ${config.ownerName}\n` +
      `Runtime: ${getRuntime()}\n` +
      `Prefix: ${config.prefix}\n` +
      `Mode: ${config.mode}\n` +
      `Powered by Usman Tech`
    );
  },
};

const uptime = {
  name: "uptime",
  alias: ["runtime"],
  description: "Get bot uptime",
  category: "main",
  async execute({ reply }) {
    reply(`Bot Uptime: ${getRuntime()}`);
  },
};

const owner = {
  name: "owner",
  description: "Get owner info",
  category: "main",
  async execute({ sock, jid, msg }) {
    const config = global.config;
    const ownerJid = config.ownerNumber + "@s.whatsapp.net";
    await sock.sendMessage(jid, {
      contacts: {
        displayName: config.ownerName,
        contacts: [{ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${config.ownerName}\nTEL;type=CELL;type=VOICE;waid=${config.ownerNumber}:+${config.ownerNumber}\nEND:VCARD` }],
      },
    }, { quoted: msg });
  },
};

const repo = {
  name: "repo",
  alias: ["github"],
  description: "Get bot repository",
  category: "main",
  async execute({ reply }) {
    reply("USMAN-MD WhatsApp Bot\nPowered by Usman Tech\nPrefix: " + global.config.prefix);
  },
};

module.exports = [ping, alive, uptime, owner, repo];
