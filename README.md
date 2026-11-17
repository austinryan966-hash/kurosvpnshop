# Setup
1. Deploy this folder to Netlify (the Forms tab will show an "orders" form after deploy).
2. Orders and payment screenshots appear in Netlify > Forms > orders.
3. Telegram alerts: create a bot with @BotFather, add it to your admin group, then in Netlify > Site configuration > Environment variables add
   TELEGRAM_BOT_TOKEN (from BotFather) and TELEGRAM_CHAT_ID (your group or user id). Redeploy.
4. Edit business info in the CONFIG block at the top of script.js.
