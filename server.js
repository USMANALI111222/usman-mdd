const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Fix crypto
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = require("crypto").webcrypto;
}

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  delay,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const express_app = express();
const PORT = process.env.PORT || 3000;

express_app.use(cors({ origin: "*" }));
express_app.use(express.json());

const sessions = new Map();

express_app.get("/", (req, res) => {
  res.json({ status: "online", sessions: sessions.size });
});

express_app.post("/pair", async (req, res) => {
  const num = (req.body.phone || "").replace(/\D/g, "");

  if (!num || num.length < 7 || num.length > 15) {
    return res.json({ success: false, error: "Invalid number" });
  }

  // Kill existing
  if (sessions.has(num)) {
    try { sessions.get(num).end(); } catch {}
    sessions.delete(num);
  }

  const authDir = path.join("/tmp", "s_" + num);
  try { fs.mkdirSync(authDir, { recursive: true }); } catch {}

  try {
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();
    const logger = pino({ level: "silent" });

    const sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      browser: ["WhatsApp", "Chrome", "121.0.0"],
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 15000,
      retryRequestDelayMs: 2000,
      maxMsgRetryCount: 2,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false,
    });

    sock.ev.on("creds.update", saveCreds);

    // Wait properly for WS open
    await new Promise((resolve) => {
      sock.ev.on("connection.update", ({ connection }) => {
        if (connection === "open" || connection === "connecting") resolve();
      });
      setTimeout(resolve, 5000);
    });

    await delay(2000);

    const code = await sock.requestPairingCode(num);
    const fmt = code?.match(/.{1,4}/g)?.join("-") || code;

    const sessionId = num + "_" + Date.now();
    sessions.set(sessionId, sock);

    sock.ev.on("connection.update", ({ connection }) => {
      if (connection === "close") {
        sessions.delete(sessionId);
        try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
      }
    });

    setTimeout(() => {
      try { sock.end(); } catch {}
      try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
      sessions.delete(sessionId);
    }, 5 * 60 * 1000);

    return res.json({ success: true, code: fmt, sessionId });

  } catch (e) {
    try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
    console.error("Pair error:", e.message);
    return res.json({ success: false, error: e.message });
  }
});

express_app.get("/status/:id", (req, res) => {
  res.json({ status: sessions.has(req.params.id) ? "pending" : "unknown" });
});

express_app.listen(PORT, () => console.log("Running on port " + PORT));
                
