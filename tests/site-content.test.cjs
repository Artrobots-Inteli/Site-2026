const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const theme = require('../components/site-theme.js');
const item = (kind = 'PROJECT', changes = {}) => ({ id: 'entry-1', kind, title: '<img src=x onerror=alert(1)>', summary: '<script>bad()</script>', imageUrl: 'https://artrolove.artrobots.tech/api/public/site-content/photos/entry-1', imageAlt: 'Approved image', url: 'https://github.com/Artrobots-Inteli', featured: true, order: 0, status: 'ACTIVE', startsAt: null, endsAt: null, location: '', ...changes });
const feed = (items = [], initialized = true) => ({ schemaVersion: 1, initialized, updatedAt: '2026-09-27T15:00:00.000Z', items });
let server, ContentPanel, model, api;
test.before(async () => {
  const { createServer } = await import('vite');
  server = await createServer({ root: path.join(__dirname, '..'), server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'silent' });
  api = await server.ssrLoadModule('/src/publicContent.ts');
  ContentPanel = (await server.ssrLoadModule('/src/ContentPanel.tsx')).default;
  model = await server.ssrLoadModule('/src/model.ts');
});
test.after(async () => { await server?.close(); });
const render = (snapshot, kind = 'PROJECT', english = false, loading = false) => renderToStaticMarkup(React.createElement(ContentPanel, { snapshot, kind, english, loading }));

test('public URL policy blocks scripts, credentials, private and IP hosts', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,bad', 'http://example.org', 'https://user:secret@example.org', 'https://localhost/x', 'https://10.0.0.1/x', 'https://[::1]/x', 'https://server.internal/x', 'https://example.org:8443']) assert.equal(api.publicUrl(value), null);
  assert.equal(api.publicUrl('https://competition.example.org/details'), 'https://competition.example.org/details');
});
test('images only request controlled public photos or already public site assets', () => {
  assert.ok(api.publicImage(item().imageUrl));
  assert.ok(api.publicImage('https://artrobots.tech/assets/solidoworks.svg'));
  for (const value of ['https://artrolove.artrobots.tech/api/files/secret', 'https://evil.example.org/image.png', 'https://artrolove.artrobots.tech/api/public/site-content/photos/entry-1?token=secret', 'https://artrobots.tech/private/photo.jpg']) assert.equal(api.publicImage(value), null);
});
test('snapshot validates identifiers, kinds, duplicates and malformed dates', () => {
  assert.equal(api.validate(feed([item()])).items.length, 1);
  for (const data of [feed([item(), item()]), feed([item('DRAFT')]), feed([item('EVENT', { startsAt: 'not-a-date' })]), feed([item('PROJECT', { id: undefined })]), { ...feed(), schemaVersion: 2 }]) assert.throws(() => api.validate(data));
});
test('location contract accepts backend maximum of 300 characters and rejects 301', () => {
  for (const length of [241, 299, 300]) assert.equal(api.validate(feed([item('EVENT', { location: 'A'.repeat(length) })])).items[0].location.length, length);
  assert.throws(() => api.validate(feed([item('EVENT', { location: 'A'.repeat(301) })])));
});
test('first connection failure has no fallback; empty publication stays empty after failure', () => {
  const initial = api.transition({ state: 'loading', snapshot: null }, null, true);
  assert.equal(initial.state, 'unavailable'); assert.equal(initial.snapshot, null);
  const empty = api.transition({ state: 'ready', snapshot: feed([item()]) }, feed());
  assert.equal(empty.snapshot.items.length, 0);
  const failed = api.transition(empty, null, true);
  assert.equal(failed.state, 'stale'); assert.equal(failed.snapshot.items.length, 0);
  assert.equal(api.transition(failed, feed([], false)).snapshot.items.length, 0);
});
test('React panel escapes authored HTML and only emits validated links and public media', () => {
  const html = render(feed([item()]));
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>|<img src=x/);
  assert.match(html, /href="https:\/\/github.com\/Artrobots-Inteli"/);
  assert.match(html, /src="https:\/\/artrolove.artrobots.tech\/api\/public\/site-content\/photos\/entry-1"/);
  const unsafe = render(feed([item('PROJECT', { url: 'javascript:alert(1)', imageUrl: 'https://artrolove.artrobots.tech/api/files/private' })]));
  assert.doesNotMatch(unsafe, /href=|<img |site-entry-media|\/api\/files\/private/);
});
test('React panel renders definitive empty, unavailable and slow-start loading states', () => {
  assert.match(render(feed()), /Nenhum item publicado/);
  assert.doesNotMatch(render(feed()), /<article/);
  assert.match(render(null), /indisponível/);
  assert.match(render(null, 'PROJECT', false, true), /role="status"/);
  assert.match(render(null, 'PROJECT', false, true), /primeiro acesso pode demorar/);
});
test('React all-day events preserve civil dates and exclusive ends; timed events use São Paulo', () => {
  const html = render(feed([item('EVENT', { allDay: true, startsAt: '2026-06-18T00:00:00.000Z', endsAt: '2026-06-19T00:00:00.000Z' })]), 'EVENT');
  assert.match(html, />18 de jun/); assert.doesNotMatch(html, />17 de jun|até 19 de jun/);
  assert.match(render(feed([item('EVENT', { allDay: false, startsAt: '2026-06-18T18:00:00.000Z' })]), 'EVENT'), /15:00/);
});
test('legacy navigation hashes preserve their corresponding areas', () => {
  for (const [hash, area] of Object.entries({ projects: 'PROJECT', competitions: 'COMPETITION', sponsors: 'PARTNERSHIP', calendar: 'EVENT', leadership: 'MEMBERS', contact: 'MEMBERS' })) assert.deepEqual(model.viewForHash(`#${hash}`), { page: 'area', area });
  assert.deepEqual(model.viewForHash('#areas'), { page: 'hub', area: null });
  assert.deepEqual(model.viewForHash('#about'), { page: 'portal', area: null });
  assert.deepEqual(model.viewForHash('#calendario'), { page: 'area', area: 'EVENT' });
});
test('theme defaults to dark, preserves choice and follows system only when requested', () => {
  assert.equal(theme.read({ getItem: () => null }), 'dark');
  assert.equal(theme.read({ getItem: () => 'light' }), 'light');
  assert.equal(theme.read({ getItem: () => { throw new Error('Blocked'); } }), 'dark');
  assert.equal(theme.resolve('system', true), 'dark'); assert.equal(theme.resolve('system', false), 'light');
  assert.equal(theme.resolve('dark', false), 'dark'); assert.equal(theme.resolve('light', true), 'light');
});
