// functions/auth.js — Cloudflare Pages Function
// Credenciales en variables de entorno de Cloudflare:
//   AUTH_USER     → nombre de usuario
//   AUTH_PASS     → contraseña
//   AUTH_SECRET   → clave para firmar el token (cualquier string largo aleatorio)

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'Bad request' }, 400); }

  const { user, pass } = body;

  if (!user || !pass || user !== env.AUTH_USER || pass !== env.AUTH_PASS) {
    // Pequeño delay para dificultar brute-force
    await new Promise(r => setTimeout(r, 400));
    return json({ ok: false, error: 'Credenciales incorrectas' }, 401);
  }

  // Token simple: base64(payload) + "." + HMAC-SHA256
  const payload = JSON.stringify({ user, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 }); // 30 días
  const token   = await sign(payload, env.AUTH_SECRET);

  return json({ ok: true, token });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '').trim();

  if (!token) return json({ ok: false }, 401);

  const valid = await verify(token, env.AUTH_SECRET);
  return json({ ok: valid });
}

// ── Helpers ──────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function sign(payload, secret) {
  const enc  = new TextEncoder();
  const key  = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig  = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const b64p = btoa(payload);
  const b64s = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${b64p}.${b64s}`;
}

async function verify(token, secret) {
  try {
    const [b64p, b64s] = token.split('.');
    if (!b64p || !b64s) return false;
    const payload = atob(b64p);
    const data    = JSON.parse(payload);
    if (Date.now() > data.exp) return false;          // expirado

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBytes = Uint8Array.from(atob(b64s), c => c.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payload));
  } catch {
    return false;
  }
}
