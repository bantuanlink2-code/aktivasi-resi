export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { resi, kode1, kode2, email } = req.body || {}
  if (![resi, kode1, kode2, email].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'Data formulir belum lengkap' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    return res.status(500).json({ error: 'Konfigurasi Telegram belum tersedia' })
  }

  const message = [
    '<b>Pesanan baru dari formulir aktivasi resi</b>',
    '',
    `<b>Kode resi:</b> ${escapeHtml(resi)}`,
    `<b>Kode referensi 1:</b> ${escapeHtml(kode1)}`,
    `<b>Kode referensi 2:</b> ${escapeHtml(kode2)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
  ].join('\n')

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
  })

  if (!telegramResponse.ok) {
    return res.status(502).json({ error: 'Pesan Telegram gagal dikirim' })
  }

  return res.status(200).json({ ok: true })
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}
