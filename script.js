/* ============ EDIT YOUR BUSINESS INFO HERE ============ */
const CONFIG = {
  brand: "GreenShield VPN",
  telegram: "usaginokitsune",   // main contact, without @
  team: ["usaginokitsune", "austin3930", "lilia3930"],
  currency: "MMK",
  payments: [                                  // update account details
    { name: "KBZPay",  number: "09966433216", holder: "Shan Htet Naing" },
    { name: "WavePay", number: "09966433216", holder: "Shan Htet Naing" },
    { name: "AYA Pay", number: "09786092566", holder: "Kyaw Swar Win" }
  ],
  unlimited: [
    { id: "monthly", name: "Monthly Unlimited", price: 3000,  duration: "30 Days",  data: "Unlimited", best: false },
    { id: "yearly",  name: "Yearly Unlimited",  price: 30000, duration: "365 Days", data: "Unlimited", best: true, badge: "Best value" }
  ],
  limited: [
    { id: "starter",  name: "Starter",  price: 1000, data: "10 GB" },
    { id: "basic",    name: "Basic",    price: 2000, data: "30 GB" },
    { id: "standard", name: "Standard", price: 3000, data: "50 GB" },
    { id: "premium",  name: "Premium",  price: 5000, data: "100 GB", best: true, badge: "Popular" },
    { id: "ultimate", name: "Ultimate", price: 9000, data: "200 GB" }
  ],
  faq: [
    ["What is Outline?", "Outline is a free VPN app. After payment we send you an access key, you paste it into the app, and you're connected."],
    ["Which devices can I use?", "Android, iPhone, iPad, Windows, macOS and Linux. Every plan supports multiple devices."],
    ["Do data packs expire?", "No. Data packs have no calendar expiry. They stay valid until all the purchased data is used."],
    ["How do I pay?", "Use KBZPay, WavePay or AYA Pay. Transfer the exact total, then send your screenshot on Telegram."],
    ["How long until I get my key?", "Our admin verifies each payment manually, then sends your Outline key on Telegram."],
    ["Are there any hidden fees?", "No. The total shown in the order form is the total you pay."]
  ]
};
/* ======================================================== */

const $ = (s, r = document) => r.querySelector(s);
const fmt = n => n.toLocaleString("en-US") + " " + CONFIG.currency;
const tgUser = CONFIG.telegram.replace("@", "");
const allPlans = [...CONFIG.unlimited.map(p => ({ ...p, type: "Unlimited" })), ...CONFIG.limited.map(p => ({ ...p, type: "Data pack" }))];
const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2200); };
const copy = async txt => { try { await navigator.clipboard.writeText(txt); toast("Copied"); } catch { toast("Copy failed. Select the text manually."); } };

document.querySelectorAll("[data-brand]").forEach(e => e.textContent = CONFIG.brand);
document.querySelectorAll("[data-telegram]").forEach(a => { a.href = `https://t.me/${tgUser}`; a.target = "_blank"; a.rel = "noopener"; });
$("#yr").textContent = new Date().getFullYear();
window.addEventListener("load", () => setTimeout(() => $("#loader").classList.add("done"), 350));

/* Pricing cards */
const planCard = (p, limited) => `
  <article class="card plan reveal ${p.best ? "best" : ""}">
    ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
    <h3>${p.name}</h3>
    <div class="price">${p.price.toLocaleString("en-US")} <small>${CONFIG.currency}</small></div>
    <ul>
      <li>Data: ${p.data}</li>
      <li>${limited ? "Valid until all data is used" : "Duration: " + p.duration}</li>
      <li>Multiple devices</li><li>Outline access key</li>
    </ul>
    <button class="btn" data-buy="${p.id}">Buy now</button>
  </article>`;
$("#grid-unlimited").innerHTML = CONFIG.unlimited.map(p => planCard(p, false)).join("");
$("#grid-limited").innerHTML = CONFIG.limited.map(p => planCard(p, true)).join("");
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.toggle("on", x === t));
  $("#grid-unlimited").hidden = t.dataset.tab !== "unlimited";
  $("#grid-limited").hidden = t.dataset.tab !== "limited";
  document.querySelectorAll(".plans:not([hidden]) .reveal").forEach(e => e.classList.add("in"));
}));

/* Payment cards */
$("#pay-grid").innerHTML = CONFIG.payments.map((p, i) => `
  <article class="card pay reveal">
    <h3>${p.name}</h3>
    <div class="acct"><b>${p.number}</b><button class="copy" data-copy="${i}">Copy</button></div>
    <p>Account name: ${p.holder}</p>
  </article>`).join("");
$("#pay-grid").addEventListener("click", e => {
  const b = e.target.closest("[data-copy]"); if (b) copy(CONFIG.payments[b.dataset.copy].number.replace(/\s/g, ""));
});

/* FAQ accordion */
$("#faq-list").innerHTML = CONFIG.faq.map(([q, a]) => `
  <div class="faq-i"><button class="faq-q" aria-expanded="false">${q}</button><div class="faq-a"><p>${a}</p></div></div>`).join("");
$("#faq-list").addEventListener("click", e => {
  const q = e.target.closest(".faq-q"); if (!q) return;
  const item = q.parentElement, open = !item.classList.contains("open");
  document.querySelectorAll(".faq-i").forEach(i => { i.classList.remove("open"); i.querySelector(".faq-a").style.maxHeight = 0; i.firstElementChild.setAttribute("aria-expanded", "false"); });
  if (open) { item.classList.add("open"); const a = item.querySelector(".faq-a"); a.style.maxHeight = a.scrollHeight + "px"; q.setAttribute("aria-expanded", "true"); }
});

/* Order form */
const modal = $("#modal"), fPlan = $("#f-plan"), fPay = $("#f-pay");
fPlan.innerHTML = allPlans.map(p => `<option value="${p.id}">${p.name} · ${p.data}${p.duration ? " · " + p.duration : " · until used"} · ${fmt(p.price)}</option>`).join("");
fPay.innerHTML = CONFIG.payments.map(p => `<option>${p.name}</option>`).join("");
const cur = () => allPlans.find(p => p.id === fPlan.value);

function buildSummary() {
  const p = cur(), name = $("#f-name").value.trim() || "-", tg = $("#f-tg").value.trim() || "-";
  return [`New order – ${CONFIG.brand}`, `VPN: Outline`, `Package: ${p.name} (${p.data}${p.duration ? ", " + p.duration : ", valid until data is used"})`,
    `Name: ${name}`, `Telegram: ${tg}`, `Payment: ${fPay.value}`, `Total: ${fmt(p.price)}`].join("\n");
}
function refresh() { $("#f-total").textContent = fmt(cur().price); $("#summary").textContent = buildSummary(); $("#h-total").value = fmt(cur().price); $("#h-summary").value = buildSummary(); }
const openModal = id => { $("#order").hidden = false; $("#ok").hidden = true; if (id) fPlan.value = id; refresh(); modal.hidden = false; document.body.style.overflow = "hidden"; $("#f-name").focus(); };
const closeModal = () => { modal.hidden = true; document.body.style.overflow = ""; };

document.addEventListener("click", e => { const b = e.target.closest("[data-buy]"); if (b) openModal(b.dataset.buy); });
$("#m-close").onclick = closeModal;
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
$("#order").addEventListener("input", refresh);
$("#f-file").addEventListener("change", e => {
  const f = e.target.files[0], img = $("#preview");
  if (f) { img.src = URL.createObjectURL(f); img.hidden = false; } else img.hidden = true;
});
function valid(needFile = true) {
  const err = $("#err");
  if (!$("#f-name").value.trim()) return err.textContent = "Enter your name.", false;
  if (!/^@?[A-Za-z0-9_]{5,32}$/.test($("#f-tg").value.trim())) return err.textContent = "Enter a valid Telegram username (5–32 letters, numbers or _).", false;
  const f = $("#f-file").files[0];
  if (needFile && !f) return err.textContent = "Upload your payment screenshot.", false;
  if (f && f.size > 8 * 1024 * 1024) return err.textContent = "Screenshot is too big. Max 8 MB.", false;
  err.textContent = ""; return true;
}
$("#f-copy").onclick = () => valid(false) && window.open(`https://t.me/${tgUser}?text=${encodeURIComponent(buildSummary() + "\nI will send my payment screenshot in this chat.")}`, "_blank", "noopener");
$("#order").addEventListener("submit", async e => {
  e.preventDefault(); if (!valid()) return;
  const btn = $("#f-submit"); btn.disabled = true; btn.textContent = "Sending...";
  try {
    const r = await fetch("/", { method: "POST", body: new FormData(e.target) });
    if (!r.ok) throw new Error(r.status);
    $("#order").hidden = true; $("#ok").hidden = false; e.target.reset(); $("#preview").hidden = true;
  } catch { $("#err").textContent = "Could not send the order. Try again or use Order on Telegram instead."; }
  btn.disabled = false; btn.textContent = "Submit order";
});
$("#ok-close").onclick = closeModal;
$("#team").innerHTML = CONFIG.team.map(u => `<a class="btn ghost sm" href="https://t.me/${u}" target="_blank" rel="noopener">@${u}</a>`).join("");

/* Nav + reveal */
const nav = $("#nav"), menu = $("#menu"), burger = $("#burger");
addEventListener("scroll", () => nav.classList.toggle("solid", scrollY > 20), { passive: true });
burger.onclick = () => { const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); };
menu.addEventListener("click", e => { if (e.target.closest("a")) { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); } });
document.querySelectorAll(".card").forEach(c => c.classList.add("reveal"));
const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { threshold: .1 });
document.querySelectorAll(".reveal").forEach(e => io.observe(e));
