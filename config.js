/* ============ EDIT YOUR BUSINESS INFO HERE ============ */
const CONFIG = {
  brand: "Outline VPN",
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
    ["Where is the server located?", "Our VPN server is based in Germany."],
    ["What is Outline?", "Outline is a free VPN app. After payment we send you an access key, you paste it into the app, and you're connected."],
    ["Which devices can I use?", "Android, iPhone, iPad, Windows, macOS and Linux. Every plan supports multiple devices."],
    ["Do data packs expire?", "No. Data packs have no calendar expiry. They stay valid until all the purchased data is used."],
    ["How do I pay?", "Use KBZPay, WavePay or AYA Pay. Transfer the exact total, then send your screenshot on Telegram."],
    ["How long until I get my key?", "Our admin verifies each payment manually, then sends your Outline key on Telegram."],
    ["Are there any hidden fees?", "No. The total shown in the order form is the total you pay."]
  ]
};
/* ======================================================== */
