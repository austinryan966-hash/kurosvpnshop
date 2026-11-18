// Orders API. Stores orders + screenshots in Netlify Blobs (no database needed).
import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

export const config = { path: "/api/*" };

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const hash = s => createHash("sha256").update(String(s)).digest("hex");
const isAdmin = req => !!process.env.ADMIN_PASSWORD && hash(req.headers.get("x-admin-key") || "") === hash(process.env.ADMIN_PASSWORD);
const clip = (v, n) => String(v || "").trim().slice(0, n);
const STATUSES = ["new", "paid", "delivered", "rejected"];

async function notify(o) {
  const t = process.env.TELEGRAM_BOT_TOKEN, c = process.env.TELEGRAM_CHAT_ID;
  if (!t || !c) return;
  try {
    await fetch(`https://api.telegram.org/bot${t}/sendMessage`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: c, text: `🛒 New order from ${o.name} (@${o.telegram})\nPackage: ${o.package}\nPayment: ${o.payment}\nOpen the admin page to check the screenshot.` })
    });
  } catch {}
}

export default async (req) => {
  const { pathname, searchParams } = new URL(req.url);
  const orders = getStore("orders"), shots = getStore("shots");

  if (pathname === "/api/order" && req.method === "POST") {
    const f = await req.formData();
    if (f.get("bot-field")) return json({ ok: true });
    const file = f.get("screenshot");
    const o = { package: clip(f.get("package"), 40), name: clip(f.get("customer_name"), 80), telegram: clip(f.get("telegram"), 40).replace(/^@/, ""), payment: clip(f.get("payment_method"), 30) };
    if (!o.package || !o.name || !/^[A-Za-z0-9_]{5,32}$/.test(o.telegram)) return json({ error: "Invalid details" }, 400);
    if (!file || typeof file === "string" || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return json({ error: "Invalid screenshot" }, 400);
    const id = `o_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await shots.set(id, await file.arrayBuffer(), { metadata: { type: file.type } });
    await orders.setJSON(id, { id, ...o, status: "new", createdAt: new Date().toISOString() });
    await notify(o);
    return json({ ok: true, id });
  }

  if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401);

  if (pathname === "/api/orders") {
    const { blobs } = await orders.list();
    const all = await Promise.all(blobs.map(b => orders.get(b.key, { type: "json" })));
    return json(all.filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }
  if (pathname === "/api/screenshot") {
    const id = searchParams.get("id") || "";
    if (!/^o_\w+$/.test(id)) return json({ error: "Bad id" }, 400);
    const r = await shots.getWithMetadata(id, { type: "arrayBuffer" });
    if (!r) return json({ error: "Not found" }, 404);
    return new Response(r.data, { headers: { "content-type": r.metadata?.type || "image/jpeg" } });
  }
  if (pathname === "/api/status" && req.method === "POST") {
    const { id, status, remove } = await req.json();
    if (!/^o_\w+$/.test(id || "")) return json({ error: "Bad id" }, 400);
    if (remove) { await orders.delete(id); await shots.delete(id); return json({ ok: true }); }
    if (!STATUSES.includes(status)) return json({ error: "Bad status" }, 400);
    const o = await orders.get(id, { type: "json" });
    if (!o) return json({ error: "Not found" }, 404);
    o.status = status; await orders.setJSON(id, o);
    return json(o);
  }
  return json({ error: "Not found" }, 404);
};
