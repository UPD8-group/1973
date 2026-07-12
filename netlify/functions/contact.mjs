// Contact form handler for the television set.
// With RESEND_API_KEY set, delivers via Resend; otherwise logs the
// submission and reports { ok: true, delivered: false } so the site
// works safely without any configuration.

const MAX_NAME = 120
const MAX_EMAIL = 200
const MAX_MESSAGE = 5000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json(405, { ok: false, error: 'method not allowed' })
  }

  let data
  try {
    data = await req.json()
  } catch {
    return json(400, { ok: false, error: 'invalid json' })
  }

  const name = typeof data?.name === 'string' ? data.name.trim() : ''
  const email = typeof data?.email === 'string' ? data.email.trim() : ''
  const message = typeof data?.message === 'string' ? data.message.trim() : ''

  if (!name || name.length > MAX_NAME) {
    return json(400, { ok: false, error: 'invalid name' })
  }
  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return json(400, { ok: false, error: 'invalid email' })
  }
  if (!message || message.length > MAX_MESSAGE) {
    return json(400, { ok: false, error: 'invalid message' })
  }

  const key = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO || 'hello@1973.ai'
  const from = process.env.CONTACT_FROM || '1973.ai <hello@1973.ai>'

  if (!key) {
    console.log('contact submission (RESEND_API_KEY unset, not delivered):', {
      name,
      email,
      message,
    })
    return json(200, { ok: true, delivered: false })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `1973.ai — message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>`,
    }),
  })

  if (!res.ok) {
    console.error('resend delivery failed:', res.status, await res.text())
    return json(502, { ok: false, error: 'delivery failed' })
  }

  return json(200, { ok: true, delivered: true })
}

export const config = { path: '/api/contact' }
