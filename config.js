// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  USMAN-MD v3 — Config
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
module.exports = {
  botName: "USMAN-MD",
  ownerName: "Usman",
  ownerNumber: "923494730406",
  ownerNumber2: "",
  ownerNumber3: "",
  prefix: ".",
  mode: "public",       // public | private | groups | inbox
  version: "3.0.0",
  startupMessage: true,
  packName: "USMAN-MD",
  packPublish: "Usman",

  // ── Protection ──
  antiLink:   false,
  antiDelete: false,   // .antidelete to toggle
  antiCall:   false,   // .anticall to toggle
  antiBug:    true,    // .antibug to toggle

  // ── Auto Features ──
  autoRead:      false, // false = single tick (privacy). .autoread to toggle
  autoReact:     true,
  autoTyping:    false,
  autoRecording: false,
  statusView:    false,

  // ── Welcome/Goodbye ──
  welcome:    false,
  goodbye:    false,
  welcomeMsg: "🎉 Welcome to the group!",
  goodbyeMsg: "👋 Goodbye!",
  antiCallMsg: "❌ Calls not allowed!",

  // ── API Keys (optional) ──
  openrouterKey: "",   // https://openrouter.ai → free key
  geminiKey:     "",   // https://aistudio.google.com
  gptKey:        "",

  // ── Telegram Pairing Bot ──
  telegramToken: "",   // @BotFather → create bot → get token
  // Add your Telegram user ID to restrict pairing to owner only
  // Leave empty to allow anyone to pair
  telegramOwnerId: "",
};
