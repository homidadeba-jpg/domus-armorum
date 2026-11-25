import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handleApi, passwordHash, randomToken } from '../server/admin-api.js';

class TestDatabase {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:');
    this.sqlite.exec(readFileSync(new URL('../migrations/0001_admin.sql', import.meta.url), 'utf8'));
  }
  prepare(sql) {
    const statement = this.sqlite.prepare(sql);
    let params = [];
    const wrapped = {
      bind(...values) { params = values; return wrapped; },
      async first() { return statement.get(...params) || null; },
      async run() { return { meta: { changes: Number(statement.run(...params).changes) } }; },
      async all() { return { results: statement.all(...params) }; },
      execute() {
        if (statement.columns().length) return { results: statement.all(...params) };
        return { meta: { changes: Number(statement.run(...params).changes) } };
      },
    };
    return wrapped;
  }
  async batch(statements) {
    this.sqlite.exec('BEGIN');
    try {
      const result = statements.map(statement => statement.execute());
      this.sqlite.exec('COMMIT');
      return result;
    } catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
  }
}

async function setup() {
  const db = new TestDatabase();
  const salt = randomToken();
  await db.prepare('INSERT INTO admin_user (id, username, password_hash, password_salt) VALUES (1, ?, ?, ?)')
    .bind('admin', await passwordHash('admin123', salt), salt).run();
  await db.prepare("INSERT INTO settings VALUES ('rate_salt', ?)").bind(randomToken()).run();
  await db.prepare("INSERT INTO settings VALUES ('tracking_started', ?)").bind(new Date().toISOString()).run();
  return db;
}

function call(db, path, body, cookie = '', origin = 'https://example.com') {
  return handleApi({ env: { ADMIN_DB: db }, request: new Request('https://example.com/api/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json', 'User-Agent': 'Browser', 'CF-Connecting-IP': '192.0.2.1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }) });
}

function sessionCookie(response) { return response.headers.get('Set-Cookie').split(';')[0]; }

test('first login allows viewing statistics, flags the initial password, and rotates sessions on password change', async () => {
  const db = await setup();
  const first = await call(db, 'admin/login', { username: 'admin', password: 'admin123' });
  assert.equal(first.status, 200);
  assert.equal((await first.json()).mustChangePassword, true);
  assert.match(first.headers.get('Set-Cookie'), /HttpOnly; Secure; SameSite=Strict/);
  const oldCookie = sessionCookie(first);
  assert.equal((await call(db, 'admin/stats', undefined, oldCookie)).status, 200);
  assert.equal((await call(db, 'admin/password', { password: 'short' }, oldCookie)).status, 400);
  const changed = await call(db, 'admin/password', { password: 'a-strong-test-password' }, oldCookie);
  assert.equal(changed.status, 200);
  const activeCookie = sessionCookie(changed);
  assert.notEqual(activeCookie, oldCookie);
  assert.equal((await call(db, 'admin/session', undefined, oldCookie)).status, 401);
  assert.equal((await call(db, 'admin/stats', undefined, activeCookie)).status, 200);
  assert.equal((await call(db, 'admin/password', { currentPassword: 'wrong', password: 'another-good-password' }, activeCookie)).status, 400);
  assert.equal((await call(db, 'admin/login', { username: 'admin', password: 'admin123' })).status, 401);
  assert.equal((await call(db, 'admin/login', { username: 'admin', password: 'a-strong-test-password' })).status, 200);
  assert.equal((await call(db, 'admin/logout', {}, activeCookie)).status, 200);
  assert.equal((await call(db, 'admin/stats', undefined, activeCookie)).status, 401);
  db.sqlite.close();
});

test('dashboard is private, POSTs enforce the origin, and login attempts are limited', async () => {
  const db = await setup();
  assert.equal((await call(db, 'admin/stats')).status, 401);
  assert.equal((await call(db, 'admin/login', { username: 'admin', password: 'admin123' }, '', 'https://attacker.example')).status, 403);
  for (let index = 0; index < 5; index++) assert.equal((await call(db, 'admin/login', { username: 'admin', password: 'wrong' })).status, 401);
  const blocked = await call(db, 'admin/login', { username: 'admin', password: 'admin123' });
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get('Retry-After'), '900');
  db.sqlite.close();
});

test('analytics deduplicates retries, distinguishes views from visits and handles each period', async () => {
  const db = await setup();
  const login = await call(db, 'admin/login', { username: 'admin', password: 'admin123' });
  const changed = await call(db, 'admin/password', { password: 'a-strong-test-password' }, sessionCookie(login));
  const cookie = sessionCookie(changed);
  const event = { eventId: crypto.randomUUID(), visitId: crypto.randomUUID() };
  assert.equal((await call(db, 'analytics/collect', event)).status, 204);
  assert.equal((await call(db, 'analytics/collect', event)).status, 204);
  const laterEventId = crypto.randomUUID();
  await call(db, 'analytics/collect', { eventId: laterEventId, visitId: event.visitId });
  // The same visit may span two hours and must stay one visit in the daily summary.
  await db.prepare('UPDATE page_view SET hour = (hour + 1) % 24 WHERE event_id = ?').bind(laterEventId).run();
  await call(db, 'analytics/collect', { eventId: crypto.randomUUID(), visitId: crypto.randomUUID() });
  await call(db, 'analytics/collect', { eventId: crypto.randomUUID(), visitId: crypto.randomUUID() }, cookie);
  assert.equal((await call(db, 'analytics/collect', { eventId: 'invalid', visitId: event.visitId })).status, 400);
  for (const period of ['today', 'week', 'month', 'all']) {
    const response = await call(db, 'admin/stats?period=' + period, undefined, cookie);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    const stats = await response.json();
    assert.equal(stats.views, 3);
    assert.equal(stats.visits, 2);
    assert.equal(stats.total.views, 3);
    if (period === 'today') assert.equal(stats.series.length, 24);
  }
  const yesterday = await (await call(db, 'admin/stats?period=yesterday', undefined, cookie)).json();
  assert.equal(yesterday.views, 0);
  assert.equal((await call(db, 'admin/stats?period=toString', undefined, cookie)).status, 400);
  db.sqlite.close();
});
