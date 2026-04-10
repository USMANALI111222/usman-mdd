const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = require("crypto").webcrypto;
}

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  proto,
} = require("@whiskeysockets/baileys");

const pino = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());

const sessions = new Map();

app.get("/", (req, res) => {
  res.json({ status: "online" });
});

app.post("/pair", async (req, res) => {
  const num = (req.body.phone || "").replace(/\D/g, "");
  if (!num || num.length < 7) {
    return res.json({ success: false, error: "Invalid number" });
  }

  // Kill old session same number
  if (sessions.has(num)) {
    try { sessions.get(num).sock.end(); } catch {}
    sessions.delete(num);
  }

  const authDir = path.join("/tmp", "auth_" + num);
  try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
  fs.mkdirSync(authDir, { recursive: true });

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
      // Exactly same as USMAN-MD bot
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      keepAliveIntervalMs: 25000,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 30000,
      getMessage: async () => proto.Message.fromObject({}),
    });

    sock.ev.on("creds.update", saveCreds);

    // Wait 3 seconds for WS to connect
    await new Promise(r => setTimeout(r, 3000));

    // Request pairing code
    const code = await sock.requestPairingCode(num);
    const fmt = code?.match(/.{1,4}/g)?.join("-") || code;

    const sessionId = num + "_" + Date.now();
    sessions.set(num, { sock, sessionId, status: "pending" });
    sessions.set(sessionId, { sock, status: "pending" });

    sock.ev.on("connection.update", ({ connection }) => {
      if (connection === "open") {
        if (sessions.has(sessionId)) sessions.get(sessionId).status = "connected";
        if (sessions.has(num)) sessions.get(num).status = "connected";
      }
      if (connection === "close") {
        if (sessions.has(sessionId)) sessions.get(sessionId).status = "closed";
        sessions.delete(num);
      }
    });

    // Cleanup after 5 min
    setTimeout(() => {
      try { sock.end(); } catch {}
      try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
      sessions.delete(sessionId);
      sessions.delete(num);
    }, 5 * 60 * 1000);

    return res.json({ success: true, code: fmt, sessionId });

  } catch (e) {
    try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
    console.error("ERROR:", e.message);
    return res.json({ success: false, error: e.message });
  }
});

app.get("/status/:id", (req, res) => {
  const s = sessions.get(req.params.id);
  res.json({ status: s?.status || "unknown" });
});

app.listen(PORT, () => console.log("USMAN-MD Pair running on port " + PORT));
