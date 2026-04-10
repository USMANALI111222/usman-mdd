const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const http = require("http");

// Fix crypto for older Node versions
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = require("crypto").webcrypto;
}

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
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

    const sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      auth: state,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      connectTimeoutMs: 30000,
    });

    sock.ev.on("creds.update", saveCreds);
    await new Promise(r => setTimeout(r, 3000));

    const code = await sock.requestPairingCode(num);
    const formatted = code?.match(/.{1,4}/g)?.join("-") || code;

    sessions.set(sessionId, { sock, status: "pending" });

    sock.ev.on("connection.update", ({ connection }) => {
      const s = sessions.get(sessionId);
      if (!s) return;
      if (connection === "open") s.status = "connected";
      if (connection === "close") s.status = "closed";
    });

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
        
