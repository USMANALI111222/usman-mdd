const express  = require("express");
const cors     = require("cors");
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino     = require("pino");
const { Boom } = require("@hapi/boom");
const fs       = require("fs");
const path     = require("path");
const http     = require("http");

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3000;

// ✅ CORS — Vercel frontend ko allow karo
app.use(cors({
  origin: "*", // Deploy ke baad apna Vercel URL lagao
  methods: ["GET", "POST"],
}));
app.use(express.json());

// Sessions store
const sessions = new Map();

// ── Health check ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "USMAN-MD Pair Server Online ✅", sessions: sessions.size });
});

// ── Generate Pair Code ────────────────────────────────────
app.post("/pair", async (req, res) => {
  const { phone } = req.body;
  const num = (phone || "").replace(/\D/g, "");

  if (!num || num.length < 10 || num.length > 15) {
    return res.json({ success: false, error: "Invalid phone number" });
  }

  // Agar already session chal raha hai to rok do
  if (sessions.has(num)) {
    const old = sessions.get(num);
    try { old.sock.end(); } catch {}
    sessions.delete(num);
  }

  const sessionId = num + "_" + Date.now();
  const authDir   = path.join("/tmp", "sessions", sessionId);

  try {
    fs.mkdirSync(authDir, { recursive: true });

    const { state, saveCreds }  = await useMultiFileAuthState(authDir);
    const { version }           = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      auth: state,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    sock.ev.on("creds.update", saveCreds);

    // 2 second wait phir code lo
    await new Promise(r => setTimeout(r, 2000));
    const code      = await sock.requestPairingCode(num);
    const formatted = code?.match(/.{1,4}/g)?.join("-") || code;

    sessions.set(sessionId, { sock, status: "pending", num });

    sock.ev.on("connection.update", ({ connection }) => {
      const s = sessions.get(sessionId);
      if (!s) return;
      if (connection === "open")  s.status = "connected";
      if (connection === "close") s.status = "closed";
    });

    // 5 min baad cleanup
    setTimeout(() => {
      try { sessions.get(sessionId)?.sock?.end(); } catch {}
      try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
      sessions.delete(sessionId);
    }, 5 * 60 * 1000);

    res.json({ success: true, code: formatted, sessionId });

  } catch (e) {
    try { fs.rmSync(authDir, { recursive: true, force: true }); } catch {}
    res.json({ success: false, error: e.message || "Failed to generate code" });
  }
});

// ── Session Status ────────────────────────────────────────
app.get("/status/:id", (req, res) => {
  const s = sessions.get(req.params.id);
  res.json({ status: s?.status || "unknown" });
});

server.listen(PORT, () => {
  console.log(`✅ USMAN-MD Pair Server running on port ${PORT}`);
});
