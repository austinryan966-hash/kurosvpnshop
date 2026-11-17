// Runs automatically on every Netlify form submission and sends it to your Telegram admin chat.
exports.handler = async (event) => {
  const { payload } = JSON.parse(event.body);
  if (payload.form_name !== "orders") return { statusCode: 200 };
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return { statusCode: 200, body: "Telegram not configured" };
  const d = payload.data || {};
  const shot = d.screenshot && d.screenshot.url ? d.screenshot.url : "see Netlify > Forms > orders";
  const text = `🛒 New order\n\n${d.summary}\n\nScreenshot: ${shot}\n(Open the link while logged in to Netlify)`;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true })
  });
  return { statusCode: 200 };
};
