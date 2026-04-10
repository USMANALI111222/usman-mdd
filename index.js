// Fix crypto
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = require("crypto").webcrypto;
}

const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  proto,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const config = require("./config");
const { handleMessage, handleMessageDelete } = require("./messageHandler");
const { handleGroupUpdate } = require("./groupHandler");
const logger = require("./logger");

global.config = config;
global.startTime = Date.now();
global.viewOnceStore = new Map();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WEB PAIR SERVER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const webApp = express();
const WEB_PORT = process.env.PORT || 3000;

webApp.use(cors({ origin: "*" }));
webApp.use(express.json());

// Serve frontend
webApp.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const pairSessions = new Map();

webApp.post("/pair", async (req, res) => {
  const num = (req.body.phone || "").replace(/\D/g, "");
  if (!num || num.length < 7) {
    return res.json({ success: false, error: "Invalid number" });
  }

  if (pairSessions.has(num)) {
    try { pairSessions.get(num).end(); } catch {}
    pairSessions.delete(num);
  }

  const authDir = path.join("/tmp", "pair_" + num);
  try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
  fs.mkdirSync(authDir, { recursive: true });

  try {
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();
    const silentLogger = pino({ level: "silent" });

    const sock = makeWASocket({
      version,
      logger: silentLogger,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, silentLogger),
      },
      browser: ["USMAN-MD", "Safari", "3.0"],
      keepAliveIntervalMs: 25000,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 30000,
      getMessage: async () => proto.Message.fromObject({}),
    });

    sock.ev.on("creds.update", saveCreds);
    await new Promise(r => setTimeout(r, 5000));

    const code = await sock.requestPairingCode(num);
    const fmt = code?.match(/.{1,4}/g)?.join("-") || code;

    const sessionId = num + "_" + Date.now();
    pairSessions.set(sessionId, sock);

    sock.ev.on("connection.update", ({ connection }) => {
      if (connection === "open") {
        // ✅ Paired! Now start main bot with this auth
        logger.info("Paired via web! Starting bot...");
        // Copy auth to main bot folder
        try {
          if (!fs.existsSync("./auth_info_baileys")) fs.mkdirSync("./auth_info_baileys");
          const files = fs.readdirSync(authDir);
          files.forEach(f => {
            fs.copyFileSync(path.join(authDir, f), path.join("./auth_info_baileys", f));
          });
        } catch {}
        startBot();
      }
      if (connection === "close") {
        pairSessions.delete(sessionId);
      }
    });

    setTimeout(() => {
      try { sock.end(); } catch {}
      try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
      pairSessions.delete(sessionId);
    }, 5 * 60 * 1000);

    return res.json({ success: true, code: fmt, sessionId });

  } catch (e) {
    try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
    return res.json({ success: false, error: e.message });
  }
});

webApp.get("/status/:id", (req, res) => {
  const s = pairSessions.get(req.params.id);
  res.json({ status: s ? "pending" : "unknown" });
});

webApp.listen(WEB_PORT, () => {
  logger.info("USMAN-MD Pair Web running on port " + WEB_PORT);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN BOT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const sleep = ms => new Promise(r => setTimeout(r, ms));
let retryCount = 0;
let botStarted = false;

async function startBot() {
  if (botStarted) return;

  // Check if auth exists
  if (!fs.existsSync("./auth_info_baileys/creds.json")) {
    logger.info("No auth found — waiting for web pairing...");
    return;
  }

  botStarted = true;

  const { state, saveCreds } = await useMultiFileAuthState("./auth_info_baileys");
  const { version } = await fetchLatestBaileysVersion();
  const silentLogger = pino({ level: "silent" });

  const sock = makeWASocket({
    version,
    logger: silentLogger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, silentLogger),
    },
    browser: ["USMAN-MD", "Safari", "3.0"],
    keepAliveIntervalMs: 25000,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 30000,
    getMessage: async (key) => proto.Message.fromObject({}),
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      botStarted = false;
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        logger.info("Logged out! Delete auth_info_baileys and re-pair.");
        try { fs.rmSync("./auth_info_baileys", { recursive: true }); } catch {}
      } else {
        retryCount++;
        const delay = Math.min(5000 * retryCount, 30000);
        logger.info(`Reconnecting in ${delay/1000}s...`);
        setTimeout(startBot, delay);
      }
    } else if (connection === "open") {
      retryCount = 0;
      logger.info("BOT CONNECTED!");
      if (config.startupMessage) {
        try {
          await sock.sendMessage(config.ownerNumber + "@s.whatsapp.net", {
            text: `*${config.botName} v3* Online! ✅\n\nPrefix: ${config.prefix} | Mode: ${config.mode}`,
          });
        } catch {}
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (!msg.message) continue;
      const raw = msg.message;
      const vo = raw?.viewOnceMessage?.message || raw?.viewOnceMessageV2?.message
               || raw?.viewOnceMessageV2Extension?.message;
      if (vo && msg.key?.id) {
        const jid = msg.key.remoteJid;
        const sender = jid?.endsWith("@g.us") ? msg.key.participant : jid;
        global.viewOnceStore.set(msg.key.id, {
          jid, sender,
          senderNum: sender?.replace("@s.whatsapp.net","").replace(/\D/g,""),
          message: vo,
          time: Date.now(),
        });
      }
      try { await handleMessage(sock, msg); } catch (e) { logger.error("Msg error: " + e.message); }
    }
  });

  sock.ev.on("messages.delete", async (update) => {
    if (!config.antiDelete) return;
    try { await handleMessageDelete(sock, update); } catch {}
  });

  sock.ev.on("call", async (calls) => {
    if (!config.antiCall) return;
    for (const call of calls) {
      if (call.status === "offer") {
        try {
          await sock.rejectCall(call.id, call.from);
          await sock.sendMessage(call.from, { text: `*${config.antiCallMsg}*` });
        } catch {}
      }
    }
  });

  sock.ev.on("group-participants.update", async (update) => {
    try { await handleGroupUpdate(sock, update); } catch {}
  });

  global.sock = sock;
}

// Cleanup viewOnce every 30min
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of global.viewOnceStore.entries()) {
    if (now - v.time > 30 * 60 * 1000) global.viewOnceStore.delete(k);
  }
}, 30 * 60 * 1000);

// Start bot if already paired
startBot().catch(e => logger.error("Fatal: " + e.message));
          
