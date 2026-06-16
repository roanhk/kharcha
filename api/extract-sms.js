export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { sms } = req.body
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Extract the transaction amount and payment method from this Nepali payment SMS. Return ONLY JSON: {"amount": 500, "method": "esewa"}. Method must be one of: cash, esewa, fonepay, card. SMS: "${sms}"`
        }],
      }),
    })
    const data = await response.json()
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
    const s = text.indexOf('{'), e = text.lastIndexOf('}')
    if (s > -1 && e > -1) return res.json(JSON.parse(text.slice(s, e + 1)))
    res.json({ error: 'Could not parse' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
