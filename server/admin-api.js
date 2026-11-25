const encoder = new TextEncoder();
const SESSION_SECONDS = 12 * 60 * 60;
const COOKIE = '__Host-domus-admin';
const TIME_ZONE = 'America/Sao_Paulo';
const idPattern = /^[a-f0-9-]{36}$/i;

function hex(bytes) {
  return Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, '0')).join('');
}

export function randomToken() {
  return hex(crypto.getRandomValues(new Uint8Array(32)));
}

export async function digest(value) {
  return hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

export async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 100000 }, key, 256));
}

function equal(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

function json(body, status = 200, headers = {}) {
  return Response.json(body, { status, headers: {
    'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow',
    'X-Content-Type-Options': 'nosniff', ...headers,
  } });
}

function cookie(token, maxAge = SESSION_SECONDS) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

function localParts(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return { day: `${values.year}-${values.month}-${values.day}`, hour: Number(values.hour) };
}

function shiftDay(day, offset) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

async function sessionUser(request, db) {
  const token = request.headers.get('Cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return db.prepare(`SELECT u.*, s.token_hash FROM admin_user u JOIN admin_session s
    ON s.password_version = u.password_version WHERE s.token_hash = ? AND s.expires_at > ? AND u.id = 1`)
    .bind(await digest(token), Math.floor(Date.now() / 1000)).first();
}

async function newSession(db, version) {
  const token = randomToken();
  const now = Math.floor(Date.now() / 1000);
  await db.batch([
    db.prepare('DELETE FROM admin_session WHERE expires_at <= ?').bind(now),
    db.prepare('INSERT INTO admin_session (token_hash, password_version, expires_at) VALUES (?, ?, ?)')
      .bind(await digest(token), version, now + SESSION_SECONDS),
  ]);
  return token;
}

async function login(request, db, body) {
  const now = Math.floor(Date.now() / 1000);
  const user = await db.prepare('SELECT * FROM admin_user WHERE id = 1').first();
  const secret = await db.prepare("SELECT value FROM settings WHERE key = 'rate_salt'").first();
  if (!user || !secret) return json({ error: 'O painel ainda está sendo configurado.' }, 503);
  const ipHash = await digest(secret.value + ':' + (request.headers.get('CF-Connecting-IP') || 'local'));
  // The conditional insert reserves an attempt atomically, including concurrent requests.
  const attempts = await db.batch([
    db.prepare('DELETE FROM login_attempt WHERE created_at < ?').bind(now - 900),
    db.prepare(`INSERT INTO login_attempt (ip_hash, created_at) SELECT ?, ?
      WHERE (SELECT COUNT(*) FROM login_attempt WHERE ip_hash = ?) < 5
      AND (SELECT COUNT(*) FROM login_attempt) < 30`).bind(ipHash, now, ipHash),
  ]);
  if (!attempts[1].meta.changes) return json({ error: 'Muitas tentativas. Tente novamente em 15 minutos.' }, 429, { 'Retry-After': '900' });
  const candidate = await passwordHash(typeof body.password === 'string' ? body.password : '', user.password_salt);
  if (body.username !== user.username || !equal(candidate, user.password_hash)) {
    return json({ error: 'Login ou senha incorretos.' }, 401);
  }
  const token = await newSession(db, user.password_version);
  return json({ username: user.username, mustChangePassword: Boolean(user.must_change_password) }, 200, { 'Set-Cookie': cookie(token) });
}

async function changePassword(db, user, body) {
  if (typeof body.password !== 'string' || body.password.length < 10 || body.password.length > 128) {
    return json({ error: 'Use uma senha com 10 a 128 caracteres.' }, 400);
  }
  if (!user.must_change_password) {
    const current = await passwordHash(typeof body.currentPassword === 'string' ? body.currentPassword : '', user.password_salt);
    if (!equal(current, user.password_hash)) return json({ error: 'A senha atual está incorreta.' }, 400);
  }
  if (equal(await passwordHash(body.password, user.password_salt), user.password_hash)) {
    return json({ error: 'Escolha uma senha diferente da atual.' }, 400);
  }
  const salt = randomToken();
  const hash = await passwordHash(body.password, salt);
  const result = await db.prepare(`UPDATE admin_user SET password_hash = ?, password_salt = ?,
    password_version = password_version + 1, must_change_password = 0 WHERE id = 1 AND password_version = ?`)
    .bind(hash, salt, user.password_version).run();
  if (!result.meta.changes) return json({ error: 'Sua sessão mudou. Entre novamente.' }, 401);
  // Old sessions become invalid immediately because their password version no longer matches.
  await db.prepare('DELETE FROM admin_session WHERE password_version <= ?').bind(user.password_version).run();
  const token = await newSession(db, user.password_version + 1);
  return json({ username: user.username, mustChangePassword: false }, 200, { 'Set-Cookie': cookie(token) });
}

async function collect(request, db, body) {
  if (!idPattern.test(body.eventId) || !idPattern.test(body.visitId)) return json({ error: 'Registro inválido.' }, 400);
  if (/bot|crawler|spider|headless|preview|lighthouse/i.test(request.headers.get('User-Agent') || '')) return new Response(null, { status: 204 });
  const user = await sessionUser(request, db);
  if (user) return new Response(null, { status: 204 });
  const { day, hour } = localParts(new Date());
  // Random tab identifiers are hashed per day. No IP, URL parameters or personal data are stored.
  await db.prepare('INSERT OR IGNORE INTO page_view (event_id, visit_hash, day, hour, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(body.eventId, await digest(day + ':' + body.visitId), day, hour, Math.floor(Date.now() / 1000)).run();
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

async function statistics(db, period) {
  const today = localParts(new Date()).day;
  const starts = { today, yesterday: shiftDay(today, -1), week: shiftDay(today, -6), month: shiftDay(today, -29), all: '0000-01-01' };
  if (!Object.hasOwn(starts, period)) return json({ error: 'Período inválido.' }, 400);
  const end = period === 'yesterday' ? today : shiftDay(today, 1);
  const hourly = period === 'today' || period === 'yesterday';
  const bucket = hourly ? "printf('%02d', hour)" : period === 'all' ? 'substr(day, 1, 7)' : 'day';
  const result = await db.batch([
    db.prepare(`SELECT ${bucket} AS bucket, COUNT(*) AS views,
      COUNT(DISTINCT day || ':' || visit_hash) AS visits FROM page_view
      WHERE day >= ? AND day < ? GROUP BY bucket ORDER BY bucket`).bind(starts[period], end),
    db.prepare(`SELECT COUNT(*) AS views, COUNT(DISTINCT day || ':' || visit_hash) AS visits,
      MIN(day) AS firstDay FROM page_view`),
    db.prepare("SELECT value FROM settings WHERE key = 'tracking_started'"),
    db.prepare(`SELECT COUNT(*) AS views, COUNT(DISTINCT day || ':' || visit_hash) AS visits
      FROM page_view WHERE day >= ? AND day < ?`).bind(starts[period], end),
  ]);
  const rows = result[0].results;
  let keys;
  if (hourly) keys = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
  else if (period === 'all') {
    const first = result[1].results[0].firstDay || today;
    keys = [];
    let month = first.slice(0, 7);
    while (month <= today.slice(0, 7)) {
      keys.push(month);
      const date = new Date(month + '-01T12:00:00Z');
      date.setUTCMonth(date.getUTCMonth() + 1);
      month = date.toISOString().slice(0, 7);
    }
  } else {
    keys = Array.from({ length: period === 'week' ? 7 : 30 }, (_, index) => shiftDay(starts[period], index));
  }
  const byBucket = new Map(rows.map(row => [row.bucket, row]));
  const series = keys.map(key => byBucket.get(key) || { bucket: key, views: 0, visits: 0 });
  return json({ period, hourly, monthly: period === 'all', timeZone: TIME_ZONE, series,
    views: result[3].results[0].views,
    visits: result[3].results[0].visits,
    total: result[1].results[0], trackingStarted: result[2].results[0]?.value || null,
    start: period === 'all' ? result[1].results[0].firstDay || today : starts[period],
    end: shiftDay(end, -1),
  });
}

export async function handleApi({ request, env }) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '');
    if (!env.ADMIN_DB) return json({ error: 'O painel ainda está sendo configurado.' }, 503);
    let body = {};
    if (request.method === 'POST') {
      if (request.headers.get('Origin') !== url.origin) return json({ error: 'Origem inválida.' }, 403);
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'Formato inválido.' }, 415);
      const text = await request.text();
      if (text.length > 2048) return json({ error: 'Solicitação muito grande.' }, 413);
      try { body = JSON.parse(text); } catch { return json({ error: 'Formato inválido.' }, 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Formato inválido.' }, 400);
    }
    const db = env.ADMIN_DB;
    if (path === '/api/analytics/collect' && request.method === 'POST') return await collect(request, db, body);
    if (path === '/api/admin/login' && request.method === 'POST') return await login(request, db, body);
    const user = await sessionUser(request, db);
    if (!user) return json({ error: 'Entre para acessar o painel.' }, 401);
    if (path === '/api/admin/session' && request.method === 'GET') return json({ username: user.username, mustChangePassword: Boolean(user.must_change_password) });
    if (path === '/api/admin/logout' && request.method === 'POST') {
      await db.prepare('DELETE FROM admin_session WHERE token_hash = ?').bind(user.token_hash).run();
      return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
    }
    if (path === '/api/admin/password' && request.method === 'POST') return await changePassword(db, user, body);
    if (user.must_change_password) return json({ error: 'Troque sua senha para acessar os gráficos.' }, 403);
    if (path === '/api/admin/stats' && request.method === 'GET') return await statistics(db, url.searchParams.get('period') || 'week');
    return json({ error: 'Página não encontrada.' }, 404);
  } catch {
    return json({ error: 'Não foi possível concluir. Tente novamente em instantes.' }, 503);
  }
}
