export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact' && request.method === 'POST') {
      return handleContact(request, env);
    }

    // Everything else: serve the static site as before
    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  const name = (data.name || '').trim();
  const email = (data.email || '').trim();
  const subjectLabel = (data.subjectLabel || '').trim();
  const message = (data.message || '').trim();

  if (!name) return json({ ok: false, error: 'Please enter your name.' }, 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }
  if (!subjectLabel) return json({ ok: false, error: 'Please select a topic.' }, 400);
  if (!message) return json({ ok: false, error: 'Please enter a message.' }, 400);

  const submittedAt = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });

  const emailBody = `
    <h2>New Contact Form Message</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subjectLabel)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    <hr>
    <p style="color:#888;font-size:12px;">Submitted: ${submittedAt}<br>Source: there4u.app/#contact</p>
  `;

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'There4U Contact Form <hello@there4u.app>',
        to: ['hello@there4u.app'],
        reply_to: email,
        subject: `There4U Contact Form: ${subjectLabel}`,
        html: emailBody,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend error:', errText);
      return json({ ok: false, error: 'Failed to send message. Please try again later.' }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return json({ ok: false, error: 'Failed to send message. Please try again later.' }, 500);
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
