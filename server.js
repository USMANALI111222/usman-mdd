const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const http = require("http");

// Fix crypto
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = require("crypto").webcrypto;
}

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");

const pino = require("pino");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

const sessions = new Map();

app.get("/", (req, res) => {
  res.json({ status: "USMAN-MD Online", sessions: sessions.size });
});

app.post("/pair", async (req, res) => {
  const num = (req.body.phone || "").replace(/\D/g, "");
  if (!num || num.length < 10 || num.length > 15) {
    return res.json({ success: false, error: "Invalid phone number" });
  }

  // Kill old session
  if (sessions.has(num)) {
    try { sessions.get(num).sock.end(); } catch {}
    sessions.delete(num);
  }

  const sessionId = num + "_" + Date.now();
  const authDir = path.join("/tmp", "wa_sessions", sessionId);

  try {
    fs.mkdirSync(authDir, { recursive: true });

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
      // ✅ Yeh browser setting WhatsApp ko properly recognize karta hai
      browser: ["USMAN-MD", "Safari", "3.0"],
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 30000,
      keepAliveIntervalMs: 10000,
      generateHighQualityLinkPreview: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
    });

    sock.ev.on("creds.update", saveCreds);

    // Wait for connection ready
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Connection timeout")), 15000);
      sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "open" || connection === "connecting") {
          clearTimeout(timeout);
          resolve();
        }
      });
      // Also resolve after 4 seconds regardless
      setTimeout(() => { clearTimeout(timeout); resolve(); }, 4000);
    });

    // Request pairing code
    const code = await sock.requestPairingCode(num);
    const formatted = code?.match(/.{1,4}/g)?.join("-") || code;

    sessions.set(sessionId, { sock, status: "pending" });

    sock.ev.on("connection.update", ({ connection }) => {
      const s = sessions.get(sessionId);
      if (!s) return;
      if (connection === "open") s.status = "connected";
      if (connection === "close") s.status = "closed";
    });

    // Cleanup after 5 min
    setTimeout(() => {
      try { sessions.get(sessionId)?.sock?.end(); } catch {}
      try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
      sessions.delete(sessionId);
    }, 5 * 60 * 1000);

    return res.json({ success: true, code: formatted, sessionId });

  } catch (e) {
    try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
    return res.json({ success: false, error: e.message || "Failed" });
  }
});

app.get("/status/:id", (req, res) => {
  const s = sessions.get(req.params.id);
  res.json({ status: s?.status || "unknown" });
});

server.listen(PORT, () => {
  console.log("USMAN-MD running on port " + PORT);
});
      
