/* ============ EDIT YOUR BUSINESS INFO HERE ============ */
// Tutorial images: put files in assets/tutorial/ named android-1.png ... android-4.png, iphone-1.png ..., pc-1.png ... (or change the paths)
const guide = (d, first) => [
  { ...first, img: `assets/tutorial/${d}-1.png` },
  { title: "Copy your key", text: "Copy the access key we sent you on Telegram. It starts with ss://.", img: `assets/tutorial/${d}-2.png` },
  { title: "Add your key", text: "Open Outline, tap + or Add server, paste your key and confirm.", img: `assets/tutorial/${d}-3.png` },
  { title: "Connect", text: "Tap the big Connect button. When it says Connected, you are protected.", img: `assets/tutorial/${d}-4.png` }
];
const CONFIG = {
  brand: "Outline VPN",
  telegram: "usaginokitsune",   // main contact, without @
  team: ["usaginokitsune", "austin3930", "lilia3930"],
  currency: "MMK",
  payments: [                                  // update account details
    { name: "KBZPay",  number: "09966433216", holder: "Shan Htet Naing", color: "#1e4fa3", qr: "assets/qr-kbzpay.png" },
    { name: "WavePay", number: "09966433216", holder: "Shan Htet Naing", color: "#d19a00", qr: "assets/qr-wavepay.png" },
    { name: "AYA Pay", number: "09786092566", holder: "Kyaw Swar Win", color: "#a21d2f", qr: "assets/qr-ayapay.png" }
  ],
  unlimited: [
    { id: "monthly", name: "Monthly Unlimited", price: 3000,  duration: "30 Days",  data: "Unlimited", best: false },
    { id: "yearly",  name: "Yearly Unlimited",  price: 30000, duration: "365 Days", data: "Unlimited", best: true, badge: "Best value" },
    { id: "lifetime", name: "Lifetime Unlimited", price: 75000, duration: "Lifetime", data: "Unlimited" }
  ],
  limited: [
    { id: "starter",  name: "Starter",  price: 1000, data: "10 GB" },
    { id: "basic",    name: "Basic",    price: 2000, data: "30 GB" },
    { id: "standard", name: "Standard", price: 3000, data: "50 GB" },
    { id: "premium",  name: "Premium",  price: 5000, data: "100 GB", best: true, badge: "Popular" },
    { id: "ultimate", name: "Ultimate", price: 9000, data: "200 GB" }
  ],
  tutorials: [   // add more groups here (name + steps) if you offer other apps or protocols
    { name: "Android", steps: guide("android", { title: "Install Outline", text: "Open Google Play Store, search for “Outline” and install the app." }) },
    { name: "iPhone", steps: guide("iphone", { title: "Install Outline", text: "Open the App Store, search for “Outline” and install the app." }) },
    { name: "Windows / Mac", steps: guide("pc", { title: "Download Outline", text: "Download Outline Client from the official website getoutline.org and install it." }) }
  ],
  faq: [
    ["Where is the server located?", "Our VPN server is based in Germany."],
    ["What is Outline?", "Outline is a free VPN app. After payment we send you an access key, you paste it into the app, and you're connected."],
    ["Which devices can I use?", "Android, iPhone, iPad, Windows, macOS and Linux. Every plan supports multiple devices."],
    ["Do data packs expire?", "No. Data packs have no calendar expiry. They stay valid until all the purchased data is used."],
    ["How do I pay?", "Use KBZPay, WavePay or AYA Pay. Transfer the exact total, then upload your screenshot in the order form."],
    ["How long until I get my key?", "Our admin verifies each payment manually, then sends your Outline key on Telegram."],
    ["Are there any hidden fees?", "No. The total shown in the order form is the total you pay."]
  ]
};
/* ======================================================== */
