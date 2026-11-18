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
const opt = p => `<option value="${p.id}">${p.name} · ${p.data}${p.duration ? " · " + p.duration : " · until used"} · ${fmt(p.price)}</option>`;
fPlan.innerHTML = `<optgroup label="Unlimited plans">${allPlans.filter(p => p.type === "Unlimited").map(opt).join("")}</optgroup><optgroup label="Data packs (valid until used)">${allPlans.filter(p => p.type !== "Unlimited").map(opt).join("")}</optgroup>`;
fPay.innerHTML = CONFIG.payments.map(p => `<option>${p.name}</option>`).join("");
const cur = () => allPlans.find(p => p.id === fPlan.value);

function buildSummary() {
  const p = cur(), name = $("#f-name").value.trim() || "-", tg = $("#f-tg").value.trim() || "-";
  return [`New order – ${CONFIG.brand}`, `VPN: Outline`, `Package: ${p.name} (${p.data}${p.duration ? ", " + p.duration : ", valid until data is used"})`,
    `Name: ${name}`, `Telegram: ${tg}`, `Payment: ${fPay.value}`, `Total: ${fmt(p.price)}`].join("\n");
}
function refresh() { $("#f-total").textContent = fmt(cur().price); $("#summary").textContent = buildSummary(); }
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
    const fd = new FormData(e.target); fd.set("screenshot", await shrink($("#f-file").files[0]), "proof.jpg");
    const r = await fetch("/api/order", { method: "POST", body: fd });
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || "Server error " + r.status); }
    $("#order").hidden = true; $("#ok").hidden = false; e.target.reset(); $("#preview").hidden = true;
  } catch (x) { $("#err").textContent = (x.message || "Could not send the order") + ". Try again or use Order on Telegram instead."; }
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

/* Shrink screenshots before upload (keeps requests small and fast) */
const shrink = file => new Promise(res => {
  const img = new Image(), u = URL.createObjectURL(file);
  img.onload = () => {
    const k = Math.min(1, 1400 / Math.max(img.width, img.height)), c = document.createElement("canvas");
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    c.toBlob(b => res(b || file), "image/jpeg", .82); URL.revokeObjectURL(u);
  };
  img.onerror = () => res(file); img.src = u;
});
