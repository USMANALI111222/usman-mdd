const antidelete = {
  name: "antidelete", alias: ["antidel"],
  category: "protection", ownerOnly: true,
  async execute({ reply }) {
    global.config.antiDelete = !global.config.antiDelete;
    reply(`Anti Delete: ${global.config.antiDelete ? "ON" : "OFF"}`);
  },
};

const antibug = {
  name: "antibug", alias: ["antib"],
  category: "protection", ownerOnly: true,
  async execute({ reply }) {
    global.config.antiBug = !global.config.antiBug;
    reply(`Anti Bug: ${global.config.antiBug ? "ON" : "OFF"}`);
  },
};

const antilink = {
  name: "antilink", alias: ["antil"],
  category: "protection", groupOnly: true, adminOnly: true,
  async execute({ reply }) {
    global.config.antiLink = !global.config.antiLink;
    reply(`Anti Link: ${global.config.antiLink ? "ON" : "OFF"}`);
  },
};

const anticall = {
  name: "anticall",
  category: "protection", ownerOnly: true,
  async execute({ reply }) {
    global.config.antiCall = !global.config.antiCall;
    reply(`Anti Call: ${global.config.antiCall ? "ON" : "OFF"}`);
  },
};

const autoreact = {
  name: "autoreact", alias: ["ar"],
  category: "protection", ownerOnly: true,
  async execute({ reply }) {
    global.config.autoReact = !global.config.autoReact;
    reply(`Auto React: ${global.config.autoReact ? "ON" : "OFF"}`);
  },
};

const autoviewstatus = {
  name: "autoviewstatus", alias: ["statusview","avstatus"],
  category: "protection", ownerOnly: true,
  async execute({ reply }) {
    global.config.statusView = !global.config.statusView;
    reply(`Auto View Status: ${global.config.statusView ? "ON" : "OFF"}`);
  },
};

module.exports = [antidelete, antibug, antilink, anticall, autoreact, autoviewstatus];
