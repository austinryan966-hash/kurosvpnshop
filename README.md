# Outline VPN site – setup
Deploy from GitHub with index.html at the repo root (package.json must be committed so Netlify installs @netlify/blobs).
Netlify > Site configuration > Environment variables:
- ADMIN_PASSWORD  (required: password for /admin.html)
- TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID  (optional: Telegram alert for each new order)
Orders and payment screenshots are stored with Netlify Blobs. View them at https://YOUR-SITE/admin.html.
Business info (brand, prices, payments, Telegram) is in config.js.
