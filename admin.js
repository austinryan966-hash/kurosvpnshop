const $ = s => document.querySelector(s);
const plans = [...CONFIG.unlimited, ...CONFIG.limited];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const money = n => n.toLocaleString("en-US") + " " + CONFIG.currency;
let key = sessionStorage.getItem("ak") || "", orders = [], filter = "all";
const shots = {};
document.querySelectorAll("[data-brand]").forEach(e => e.textContent = CONFIG.brand);
const api = (path, body) => fetch(path, { method: body ? "POST" : "GET", headers: { "x-admin-key": key, "content-type": "application/json" }, body: body && JSON.stringify(body) });
const show = on => { $("#login").hidden = on; $("#panel").hidden = !on; };
function logout(msg) { key = ""; sessionStorage.removeItem("ak"); show(false); $("#msg").textContent = msg || ""; }

async function load() {
  try {
    const r = await api("/api/orders");
    if (r.status === 401) return logout("Wrong password, or ADMIN_PASSWORD is not set in Cloudflare.");
    if (!r.ok) throw 0;
    orders = await r.json(); show(true); draw();
  } catch { $("#msg").textContent = "Could not load orders. Check that the KV binding ORDERS and ADMIN_PASSWORD are set in Cloudflare, then redeploy."; }
}
const card = o => {
  const p = plans.find(x => x.id === o.package), b = a => `data-act="${a}" data-id="${o.id}"`;
  return `<article class="card ord"><div class="ord-top"><b>${esc(o.name)}</b><span class="st ${o.status}">${o.status}</span></div>
    <p><a href="https://t.me/${esc(o.telegram)}" target="_blank" rel="noopener">@${esc(o.telegram)}</a> · ${new Date(o.createdAt).toLocaleString()}</p>
    <p>${p ? esc(p.name) + " · " + p.data : "Unknown plan: " + esc(o.package)} · <b>${p ? money(p.price) : "?"}</b> · ${esc(o.payment)}</p>
    <img data-shot="${o.id}" alt="Payment screenshot">
    <div class="row"><button class="btn sm" ${b("paid")}>Paid</button><button class="btn sm" ${b("delivered")}>Delivered</button><button class="btn ghost sm" ${b("rejected")}>Reject</button><button class="btn ghost sm" ${b("remove")}>Delete</button></div></article>`;
};
async function loadShot(img) {
  const id = img.dataset.shot;
  if (!shots[id]) { const r = await fetch("/api/screenshot?id=" + id, { headers: { "x-admin-key": key } }); if (!r.ok) return; shots[id] = URL.createObjectURL(await r.blob()); }
  img.src = shots[id];
}
function draw() {
  const n = s => orders.filter(o => o.status === s).length;
  document.querySelectorAll(".flt").forEach(b => { const f = b.dataset.f; b.classList.toggle("on", f === filter); b.querySelector("i").textContent = f === "all" ? orders.length : n(f); });
  document.title = (n("new") ? `(${n("new")}) ` : "") + "Orders";
  const list = orders.filter(o => filter === "all" || o.status === filter);
  $("#list").innerHTML = list.length ? list.map(card).join("") : '<p class="sub">No orders here yet.</p>';
  document.querySelectorAll("img[data-shot]").forEach(loadShot);
}
$("#list").addEventListener("click", async e => {
  const img = e.target.closest("img[data-shot]"); if (img && img.src) return window.open(img.src, "_blank");
  const b = e.target.closest("[data-act]"); if (!b) return;
  const rm = b.dataset.act === "remove";
  if (rm && !confirm("Delete this order and its screenshot?")) return;
  const r = await api("/api/status", rm ? { id: b.dataset.id, remove: true } : { id: b.dataset.id, status: b.dataset.act });
  if (r.ok) load();
});
$(".fbar").addEventListener("click", e => { const b = e.target.closest(".flt"); if (b) { filter = b.dataset.f; draw(); } });
$("#login").addEventListener("submit", e => { e.preventDefault(); key = $("#pw").value; sessionStorage.setItem("ak", key); $("#msg").textContent = ""; load(); });
$("#refresh").onclick = load; $("#logout").onclick = () => logout();
if (key) load();
setInterval(() => key && !document.hidden && load(), 60000);
