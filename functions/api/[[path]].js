// Order API for Cloudflare Pages Functions.
// Checks the order and sends it, with the payment screenshot, to your Telegram.
// Needs the variables TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (no database needed).
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const clip = (v, n) => String(v || "").trim().slice(0, n);
const tg = (token, method, body) => fetch(`https://api.telegram.org/bot${token}/${method}`, body instanceof FormData
  ? { method: "POST", body } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export async function onRequest({ request: req, env }) {
  const { pathname } = new URL(req.url);
  if (pathname !== "/api/order") return json({ error: "Not found" }, 404);
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const token = env.TELEGRAM_BOT_TOKEN, chat = env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return json({ error: "Telegram is not set up on the server" }, 503);

  let f; try { f = await req.formData(); } catch { return json({ error: "Bad form" }, 400); }
  if (f.get("bot-field")) return json({ ok: true });
  const file = f.get("screenshot");
  const name = clip(f.get("customer_name"), 80), user = clip(f.get("telegram"), 40).replace(/^@/, ""), pkg = clip(f.get("package"), 40);
  if (!name || !pkg || !/^[A-Za-z0-9_]{5,32}$/.test(user)) return json({ error: "Invalid details" }, 400);
  if (!file || typeof file === "string" || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return json({ error: "Invalid screenshot" }, 400);

  const text = ("🛒 " + (clip(f.get("summary"), 900) || `New order\nName: ${name}\nTelegram: @${user}\nPackage: ${pkg}\nPayment: ${clip(f.get("payment_method"), 30)}`)).slice(0, 1000);
  let ok = false;
  try { // payment screenshot with the order details as its caption
    const fd = new FormData(); fd.set("chat_id", chat); fd.set("caption", text); fd.set("photo", file, "payment-proof.jpg");
    ok = (await tg(token, "sendPhoto", fd)).ok;
  } catch {}
  if (!ok) try { // fallback: text only
    ok = (await tg(token, "sendMessage", { chat_id: chat, text: text + "\n(Screenshot could not be attached. Ask the customer to send it.)" })).ok;
  } catch {}
  return ok ? json({ ok: true }) : json({ error: "Could not reach Telegram" }, 502);
}
