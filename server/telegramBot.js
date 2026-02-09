// botManager.js
// Multiple-bot polling manager (หนึ่ง Token ต่อหนึ่งหอ)
// Node 18+ แนะนำ (มี fetch ในตัวแล้ว)

import http from "node:http";
import crypto from "node:crypto";

// ====== (ถ้าใช้ Node < 18 ให้เปิดบรรทัดนี้) ======
// import fetch from "node-fetch";
// global.fetch = fetch;
// ===============================================

/* ================== CONFIG ================== *
 * ตั้งค่าบอทแต่ละหอผ่าน ENV (แนะนำ) หรือจะแข็งในไฟล์นี้ก็ได้
 * ตัวอย่าง ENV:
 *   DORM_BOTS='[{"dormId":"DORM_A","token":"xxxxx:yyyy"}, {"dormId":"DORM_B","token":"zzzz:tttt"}]'
 * หรือจะตั้ง ENV แยก:
 *   BOT_TOKEN_A=xxxxx:yyyy
 *   BOT_TOKEN_B=zzzz:tttt
 * แล้วแปลงมาสร้างอ็อบเจ็กต์ bots ด้านล่างเอาเอง
 * ============================================ */

function loadBotsFromEnv() {
  // รูปแบบที่ 1: JSON เดียว
  if (process.env.DORM_BOTS) {
    try {
      const arr = JSON.parse(process.env.DORM_BOTS);
      return arr.filter(b => b?.dormId && b?.token);
    } catch (e) {
      console.error("❌ DORM_BOTS parse error:", e.message);
    }
  }

  // รูปแบบที่ 2: ตัวอย่าง simple จาก ENV แยก (แก้ตามจริงของคุณ)
  const bots = [];
  if (process.env.BOT_TOKEN_A) bots.push({ dormId: "DORM_A", token: process.env.BOT_TOKEN_A });
  if (process.env.BOT_TOKEN_B) bots.push({ dormId: "DORM_B", token: process.env.BOT_TOKEN_B });
  return bots;
}

const BOTS_CONFIG = loadBotsFromEnv();
if (!BOTS_CONFIG.length) {
  console.error("❌ No bot tokens configured. Set DORM_BOTS or BOT_TOKEN_* envs.");
  process.exit(1);
}

/* ============= In-memory stores (ตัวอย่าง) =============
 * mappingTenant[dormId][tenantId] = telegram_user_id
 * ในโปรดักชัน: เปลี่ยนจุดนี้ให้คุยกับ DB จริง (Mongo/Postgres ฯลฯ)
 * ======================================================= */
const mappingTenant = {}; // { [dormId]: { [tenantId]: "telegram_user_id" } }

/* ============= Utilities ============= */

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function encodeBase64Url(jsonObj) {
  return Buffer.from(JSON.stringify(jsonObj), "utf8")
    .toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(str) {
  try {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const buf = Buffer.from(b64 + pad, "base64");
    return JSON.parse(buf.toString("utf8"));
  } catch {
    return null;
  }
}

/* =========================================================
 *                 Multi-bot Poller Class
 * ========================================================= */
class BotPoller {
  constructor({ dormId, token }) {
    this.dormId = dormId;
    this.token = token;
    this.api = `https://api.telegram.org/bot${token}`;
    this.offset = 0;
    this.running = false;
    this.id = crypto.createHash("sha1").update(`${dormId}:${token}`).digest("hex").slice(0, 8);
  }

  log(...args) { console.log(`[${this.dormId}]`, ...args); }
  error(...args) { console.error(`[${this.dormId}]`, ...args); }

  async start() {
    if (this.running) return;
    this.running = true;
    this.log("🤖 Start polling...");
    await this._deleteWebhookIfAny();

    while (this.running) {
      try {
        const res = await fetch(`${this.api}/getUpdates`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            offset: this.offset + 1,
            timeout: 30,
            allowed_updates: ["message"]
          }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.description);

        for (const upd of data.result) {
          this.offset = upd.update_id;
          await this._handleUpdate(upd);
        }
      } catch (e) {
        this.error("Polling error:", e.message);
        await sleep(5000);
      }
    }
  }

  stop() { this.running = false; }

  async _deleteWebhookIfAny() {
    try {
      const res = await fetch(`${this.api}/deleteWebhook`, { method: "POST" });
      const j = await res.json();
      if (j.ok) this.log("Webhook cleared (if existed).");
    } catch (e) {
      this.error("deleteWebhook error:", e.message);
    }
  }

  async _handleUpdate(update) {
    const msg = update.message;
    if (!msg?.text) return;

    // /start <payload>
    if (msg.text.startsWith("/start")) {
      const payload = msg.text.split(" ").slice(1).join(" ").trim();
      const fromId = String(msg.from.id);

      // แกะ payload: รองรับ base64url JSON (เช่น {"dormId":"DORM_A","tenantId":"T001"})
      // คุณจะใช้ JWT ก็ได้ แต่เพื่อความง่าย demo ใช้ base64url
      const decoded = decodeBase64Url(payload) || {};
      const pDorm = decoded.dormId || this.dormId; // fallback = บอทนี้ของหอนี้
      const tenantId = decoded.tenantId;

      if (!tenantId) {
        await this.send(fromId, "❌ เชื่อมบัญชีไม่สำเร็จ: payload ไม่ถูกต้อง");
        return;
      }

      // บันทึก mapping (แทนที่ด้วย DB จริงในระบบคุณ)
      mappingTenant[pDorm] = mappingTenant[pDorm] || {};
      mappingTenant[pDorm][tenantId] = fromId;

      await this.send(fromId,
        `✅ เชื่อมบัญชีสำเร็จ!\nหอ: ${pDorm}\nผู้เช่า: ${tenantId}\nต่อไปจะได้รับแจ้งเตือนบิลที่นี่ครับ`);
      return;
    }

    // คำสั่งถอดเชื่อม (ตัวอย่าง)
    if (msg.text === "/unlink") {
      const fromId = String(msg.from.id);
      // ลบ mapping ของ user นี้ในหอนี้ (simple demo)
      const hall = mappingTenant[this.dormId] || {};
      for (const [tenantId, tgid] of Object.entries(hall)) {
        if (tgid === fromId) delete hall[tenantId];
      }
      await this.send(fromId, "✅ ยกเลิกการเชื่อมบัญชีเรียบร้อย");
      return;
    }

    // คำสั่งอื่น ๆ
    await this.send(msg.chat.id, `[${this.dormId}] บอทรับข้อความแล้วครับ!`);
  }

  async send(chatId, text, opts = {}) {
    try {
      const res = await fetch(`${this.api}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          ...opts,
        }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(`${j.error_code}: ${j.description}`);
      return j.result;
    } catch (e) {
      this.error("send error:", e.message);
      throw e;
    }
  }
}

/* =========================================================
 *            Create and Start all bot instances
 * ========================================================= */
const instances = BOTS_CONFIG.map(cfg => new BotPoller(cfg));
instances.forEach(bot => bot.start());

/* =========================================================
 *        Internal HTTP for your web app to call (/notify)
 *  POST /notify  { dormId, tenantId, text, payUrl? }
 *  - หา chat_id จาก mapping (เปลี่ยนให้ดึงจาก DB จริง)
 *  - ส่งข้อความด้วยบอทของหอนั้น
 * ========================================================= */
const PORT = process.env.BOT_HTTP_PORT || 4001;
const server = http.createServer(async (req, res) => {
  // health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({
      ok: true,
      bots: instances.map(b => ({ dormId: b.dormId, id: b.id }))
    }));
  }

  // ส่งแจ้งเตือนบิล
  if (req.method === "POST" && req.url === "/notify") {
    let body = "";
    for await (const chunk of req) body += chunk;
    try {
      const { dormId, tenantId, text, payUrl } = JSON.parse(body || "{}");
      if (!dormId || !tenantId || !text) {
        res.writeHead(400); return res.end("Missing dormId/tenantId/text");
      }

      const bot = instances.find(b => b.dormId === dormId);
      if (!bot) {
        res.writeHead(404); return res.end("Dorm bot not found");
      }

      // ในโปรดักชัน ดึงจาก DB แทน mappingTenant
      const chatId = mappingTenant?.[dormId]?.[tenantId];
      if (!chatId) {
        res.writeHead(404); return res.end("Tenant not linked to Telegram");
      }

      const opts = payUrl ? {
        reply_markup: {
          inline_keyboard: [[{ text: "ชำระเงิน", url: payUrl }]]
        }
      } : undefined;

      await bot.send(chatId, text, opts);
      res.writeHead(200); return res.end("OK");
    } catch (e) {
      console.error("notify error:", e.message);
      res.writeHead(500); return res.end("ERROR");
    }
  }

  res.writeHead(200); res.end("Bot manager running");
});
server.listen(PORT, () => {
  console.log(`🛰 Bot internal HTTP on :${PORT} (POST /notify, GET /health)`);
});

/* =========================================================
 *         Helper: สร้างลิงก์ /start สำหรับผู้เช่า
 *   ใช้ base64url JSON: { dormId, tenantId }
 *   ตัวอย่างการใช้งาน: สร้างในเว็บแล้วแปะปุ่ม
 * ========================================================= */
export function buildStartLink(botUsername, dormId, tenantId) {
  const payload = encodeBase64Url({ dormId, tenantId });
  return `https://t.me/${botUsername}?start=${payload}`;
}
