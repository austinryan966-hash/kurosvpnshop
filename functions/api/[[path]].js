// Orders API for Cloudflare Pages Functions.
// Needs: a KV namespace bound as ORDERS, and the ADMIN_PASSWORD variable.
// Optional: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID for order alerts.
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const sha = async s => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(s))))].map(b => b.toString(16).padStart(2, "0")).join("");
const isAdmin = async (req, env) => !!env.ADMIN_PASSWORD && (await sha(req.headers.get("x-admin-key") || "")) === (await sha(env.ADMIN_PASSWORD));
const clip = (v, n) => String(v || "").trim().slice(0, n);
const STATUSES = ["new", "paid", "delivered", "rejected"];
const okId = id => /^o_\w+$/.test(id || "");

async function notify(env, o, file) {
  const t = env.TELEGRAM_BOT_TOKEN, c = env.TELEGRAM_CHAT_ID;
  if (!t || !c) return;
  const text = `🛒 New order from ${o.name} (@${o.telegram})\nPackage: ${o.package}\nPayment: ${o.payment}`;
  try { // send the payment screenshot with the order details as its caption
    const fd = new FormData(); fd.set("chat_id", c); fd.set("caption", text); fd.set("photo", file, "payment-proof.jpg");
    const r = await fetch(`https://api.telegram.org/bot${t}/sendPhoto`, { method: "POST", body: fd });
    if (r.ok) return;
  } catch {}
  try { // fallback: text only
    await fetch(`https://api.telegram.org/bot${t}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: c, text: text + "\nOpen the admin page to check the screenshot." }) });
  } catch {}
}

export async function onRequest({ request: req, env }) {
  const kv = env.ORDERS;
  if (!kv) return json({ error: "KV binding ORDERS is not set up in Cloudflare" }, 503);
  const { pathname, searchParams } = new URL(req.url);

  if (pathname === "/api/order" && req.method === "POST") {
    const f = await req.formData();
    if (f.get("bot-field")) return json({ ok: true });
    const file = f.get("screenshot");
    const o = { package: clip(f.get("package"), 40), name: clip(f.get("customer_name"), 80), telegram: clip(f.get("telegram"), 40).replace(/^@/, ""), payment: clip(f.get("payment_method"), 30) };
    if (!o.package || !o.name || !/^[A-Za-z0-9_]{5,32}$/.test(o.telegram)) return json({ error: "Invalid details" }, 400);
    if (!file || typeof file === "string" || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return json({ error: "Invalid screenshot" }, 400);
    const id = `o_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const order = { id, ...o, status: "new", createdAt: new Date().toISOString() };
    await kv.put("shot:" + id, await file.arrayBuffer(), { metadata: { type: file.type } });
    await kv.put("order:" + id, "1", { metadata: order }); // the order itself is kept in the key's metadata
    await notify(env, o, file);
    return json({ ok: true, id });
  }

  if (!(await isAdmin(req, env))) return json({ error: "Unauthorized" }, 401);

  if (pathname === "/api/orders") {
    const all = []; let cursor;
    do {
      const r = await kv.list({ prefix: "order:", cursor });
      all.push(...r.keys.map(k => k.metadata).filter(Boolean));
      cursor = r.list_complete ? undefined : r.cursor;
    } while (cursor);
    return json(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }
  if (pathname === "/api/screenshot") {
    const id = searchParams.get("id") || "";
    if (!okId(id)) return json({ error: "Bad id" }, 400);
    const r = await kv.getWithMetadata("shot:" + id, "arrayBuffer");
    if (!r.value) return json({ error: "Not found" }, 404);
    return new Response(r.value, { headers: { "content-type": r.metadata?.type || "image/jpeg" } });
  }
  if (pathname === "/api/status" && req.method === "POST") {
    const { id, status, remove } = await req.json();
    if (!okId(id)) return json({ error: "Bad id" }, 400);
    if (remove) { await kv.delete("order:" + id); await kv.delete("shot:" + id); return json({ ok: true }); }
    if (!STATUSES.includes(status)) return json({ error: "Bad status" }, 400);
    const { metadata: o } = await kv.getWithMetadata("order:" + id);
    if (!o) return json({ error: "Not found" }, 404);
    o.status = status; await kv.put("order:" + id, "1", { metadata: o });
    return json(o);
  }
  return json({ error: "Not found" }, 404);
}
