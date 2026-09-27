const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const api = require('../components/site-content.js');
const source = fs.readFileSync(path.join(__dirname, '../components/site-content.js'), 'utf8');

function item(overrides = {}) {
  return { id: 'cms-public-1', kind: 'PROJECT', title: 'Seguidor de linha', titleEn: '', summary: 'Controle e sensores.', summaryEn: '',
    imageUrl: 'https://artrobots.tech/assets/seguidordelinha.jpg', imageAlt: 'Robô do clube',
    url: 'https://github.com/Artrobots-Inteli/seguidor', featured: false, order: 0, status: 'ACTIVE',
    startsAt: null, endsAt: null, allDay: false, location: '', ...overrides };
}
function feed(items = []) { return { schemaVersion: 1, initialized: true, updatedAt: '2026-09-27T07:03:17.305Z', items }; }
function handlers() { return { events: new Map(), addEventListener(name, fn) { this.events.set(name, fn); }, removeEventListener(name, fn) { if (this.events.get(name) === fn) this.events.delete(name); } }; }
class Node {
  constructor(tag, doc) { this.tagName = tag.toUpperCase(); this.ownerDocument = doc; this.children = []; this.attributes = {}; this.events = new Map(); this.ownText = ''; }
  set textContent(value) { this.ownText = String(value); this.children = []; }
  get textContent() { return this.ownText + this.children.map(child => child.textContent).join(' '); }
  set innerHTML(_value) { throw new Error('Rendering must not interpret HTML'); }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key] ?? null; }
  removeAttribute(key) { delete this.attributes[key]; }
  append(...children) { for (const child of children) { child.parentNode = this; this.children.push(child); } }
  insertBefore(node, before) { if (node.parentNode) node.remove(); const index = before ? this.children.indexOf(before) : this.children.length; this.children.splice(index, 0, node); node.parentNode = this; }
  contains(node) { return inside(node, this); }
  focus() { this.ownerDocument.activeElement = this; }
  querySelector(selector) { const selectors = selector.split(','); const matches = node => selectors.some(value => value.startsWith('.') ? (node.className || '').split(/\s+/).includes(value.slice(1)) : value === '[tabindex]' ? node.tabIndex !== undefined : node.tagName.toLowerCase() === value); const visit = node => { for (const child of node.children) { if (matches(child)) return child; const nested = visit(child); if (nested) return nested; } return null; }; return visit(this); }
  replaceChildren(...children) { this.children.forEach(child => { child.parentNode = null; }); this.children = []; this.ownText = ''; this.append(...children); }
  addEventListener(name, fn) { this.events.set(name, fn); }
  remove() { if (this.contains(this.ownerDocument.activeElement)) this.ownerDocument.activeElement = null; if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(node => node !== this); this.parentNode = null; }
}
function descendants(node, className) { return node.children.flatMap(child => [...((child.className || '').split(/\s+/).includes(className) ? [child] : []), ...descendants(child, className)]); }
function inside(node, ancestor) { while (node) { if (node === ancestor) return true; node = node.parentNode; } return false; }
function response(value, ok = true) { return { ok, json: async () => value }; }
function harness(responses = [], options = {}) {
  const doc = { ...handlers(), hidden: false, createElement(tag) { return new Node(tag, this); } };
  const intervals = new Map(), deadlines = new Map(), requests = [], effects = [];
  let id = 0, now = options.now === undefined ? Date.now() : Date.parse(options.now);
  class Clock extends Date {
    constructor(...values) { super(...(values.length ? values : [now])); }
    static now() { return now; }
  }
  const scope = { ...handlers(), document: doc, ArtrobotsSiteEffects: { mount(root) { effects.push([...root.children]); } }, setInterval(fn, delay) { const next = ++id; intervals.set(next, { fn, delay }); return next; },
    clearInterval(key) { intervals.delete(key); }, setTimeout(fn, delay) { const next = ++id; deadlines.set(next, { fn, delay }); return next; },
    clearTimeout(key) { deadlines.delete(key); }, fetch: async (url, options) => { requests.push({ url, options }); const next = responses.shift(); if (!next) throw new Error('Unexpected request'); return typeof next === 'function' ? next(options) : next; } };
  vm.runInNewContext(source, { window: scope, URL, AbortController, Date: Clock, module: { exports: {} } });
  return { api: scope.ArtrobotsSiteContent, doc, scope, intervals, deadlines, requests, responses, effects,
    setNow(value) { now = Date.parse(value); }, root: () => new Node('section', doc) };
}

test('public URLs reject scripts, credentials and private destinations', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,x', 'http://artrobots.tech', 'https://name:secret@example.com',
    'https://127.0.0.1/x', 'https://2130706433/x', 'https://10.0.0.8/x', 'https://192.168.1.5/x', 'https://172.17.0.1/x',
    'https://[::1]/x', 'https://[fd00::1]/x', 'https://printer.local/x', 'https://internal/x', 'https://example.com/\nsecret']) assert.equal(api.publicUrl(value), null, value);
  assert.equal(api.publicUrl('https://github.com/Artrobots-Inteli/artrolove#readme'), 'https://github.com/Artrobots-Inteli/artrolove#readme');
});

test('images are restricted to controlled assets and explicitly public editorial photos', () => {
  for (const value of ['https://example.com/photo.jpg', 'https://artrolove.artrobots.tech/api/institution-photos/private-id',
    'https://artrobots.tech/assets/unsafe.svg', 'https://artrobots.tech/assets/%2e%2e/private.jpg',
    'https://artrobots.tech/assets/%5cprivate.jpg', 'https://artrobots.tech/assets/picture.jpg?token=secret']) assert.equal(api.publicImage(value), null, value);
  assert.equal(api.publicImage('https://artrobots.tech/assets/solidoworks.svg'), 'https://artrobots.tech/assets/solidoworks.svg');
  assert.equal(api.publicImage('https://artrolove.artrobots.tech/api/public/site-content/photos/editorial-123'), 'https://artrolove.artrobots.tech/api/public/site-content/photos/editorial-123');
});

test('validation strips private properties, unsafe URLs and refuses malformed envelopes', () => {
  const normalized = api.validate(feed([item({ sourceId: 'private-project', notes: 'private note', draft: { secret: true }, imageUrl: 'https://example.com/track.png', url: 'javascript:alert(1)' })]));
  assert.equal(normalized.items[0].sourceId, undefined); assert.equal(normalized.items[0].notes, undefined); assert.equal(normalized.items[0].draft, undefined);
  assert.equal(normalized.items[0].imageUrl, null); assert.equal(normalized.items[0].url, null);
  for (const payload of [{ ...feed(), schemaVersion: 2 }, { ...feed(), initialized: 'true' }, feed([item(), item()]), feed([item({ status: 'DRAFT' })]), feed([item({ startsAt: '2026-02-30T10:00:00Z' })])]) assert.throws(() => api.validate(payload), TypeError);
  assert.deepEqual(api.validate({ ...feed([item()]), initialized: false }).items, []);
});

test('selection preserves authoritative empty snapshots and sorts current featured content before history', () => {
  const value = feed([item({ id: 'completed', featured: true, status: 'COMPLETED' }), item({ id: 'ordered', order: 2 }), item({ id: 'featured', featured: true }), item({ id: 'other', kind: 'PARTNERSHIP' })]);
  assert.deepEqual(api.itemsFor(value, 'PROJECT').map(entry => entry.id), ['featured', 'ordered', 'completed']);
  assert.deepEqual(value.items.map(entry => entry.id), ['completed', 'ordered', 'featured', 'other']);
  assert.deepEqual(api.itemsFor(feed(), 'PROJECT'), []);
});

test('four mounts share one anonymous no-store request; rendering treats untrusted text literally', async () => {
  const unsafe = '<img src=x onerror=alert(1)>';
  const h = harness([response(feed([item({ title: unsafe, summary: '<script>run()</script>' })]))]);
  const mounts = ['PROJECT', 'COMPETITION', 'PARTNERSHIP', 'EVENT'].map(kind => { const root = h.root(); return { root, handle: h.api.mount({ root, kind }) }; });
  await mounts[0].handle.refresh();
  assert.equal(h.requests.length, 1); assert.equal(h.requests[0].options.cache, 'no-store'); assert.equal(h.requests[0].options.credentials, 'omit');
  assert.equal(h.requests[0].options.redirect, 'error'); assert.equal(h.requests[0].options.headers.Authorization, undefined);
  const root = mounts[0].root;
  assert.equal(descendants(root, 'site-entry-title')[0].textContent, unsafe); assert.equal(descendants(root, 'site-entry-summary')[0].textContent, '<script>run()</script>');
  assert.equal(descendants(root, 'site-entry-media')[0].loading, 'lazy'); assert.equal(root.getAttribute('data-state'), 'ready');
  assert.equal(descendants(mounts[1].root, 'site-entry').length, 0); assert.equal(mounts[1].root.getAttribute('data-state'), 'empty');
  mounts.forEach(({ handle }) => handle.destroy()); assert.equal(h.intervals.size, 0); assert.equal(h.doc.events.size, 0); assert.equal(h.scope.events.size, 0);
});

test('withdrawal removes cards; a later failure cannot resurrect either a seed or withdrawn entries', async () => {
  const h = harness([response(feed([item()])), response(feed()), () => { throw Error('offline'); }]);
  const root = h.root(); root.append(new Node('article', h.doc));
  const handle = h.api.mount({ root, kind: 'PROJECT' }); assert.equal(descendants(root, 'site-entry').length, 0);
  await handle.refresh(); assert.equal(descendants(root, 'site-entry').length, 1);
  await handle.refresh(); assert.equal(descendants(root, 'site-entry').length, 0); assert.equal(root.getAttribute('data-state'), 'empty');
  await handle.refresh(); assert.equal(descendants(root, 'site-entry').length, 0); assert.equal(root.getAttribute('data-state'), 'error');
  assert.equal(descendants(root, 'site-content-retry').length, 1); handle.destroy();
});

test('failure preserves only the last in-memory publication and retry replaces it with the new snapshot', async () => {
  const h = harness([response(feed([item()])), response({}, false), response(feed([item({ id: 'next', title: 'Novo projeto' })]))]);
  const root = h.root(), handle = h.api.mount({ root, kind: 'PROJECT' }); await handle.refresh(); await handle.refresh();
  assert.equal(descendants(root, 'site-entry').length, 1); assert.match(root.textContent, /última publicação recebida/);
  descendants(root, 'site-content-retry')[0].events.get('click')(); await handle.refresh();
  assert.match(root.textContent, /Novo projeto/); assert.doesNotMatch(root.textContent, /Seguidor de linha/); handle.destroy();
});

test('first-load failure and uninitialized feed never display locally supplied content', async () => {
  const h = harness([() => { throw Error('offline'); }, response({ ...feed([item()]), initialized: false })]);
  const root = h.root(), handle = h.api.mount({ root, kind: 'PROJECT' }); await handle.refresh();
  assert.equal(root.getAttribute('data-state'), 'error'); assert.equal(descendants(root, 'site-entry').length, 0);
  await handle.refresh(); assert.equal(root.getAttribute('data-state'), 'uninitialized'); assert.equal(descendants(root, 'site-entry').length, 0); handle.destroy();
});

test('all-day dates retain the civil date and show the last included day, with English fallback', async () => {
  const h = harness([response(feed([item({ kind: 'EVENT', startsAt: '2026-06-18T00:00:00Z', endsAt: '2026-06-19T00:00:00Z', allDay: true })]))]);
  const pt = h.root(), en = h.root(); const one = h.api.mount({ root: pt, kind: 'EVENT' }), two = h.api.mount({ root: en, kind: 'EVENT', english: true });
  await one.refresh();
  assert.match(descendants(pt, 'site-entry-time')[0].textContent, /18/); assert.doesNotMatch(descendants(pt, 'site-entry-time')[0].textContent, /17|até/);
  assert.match(descendants(en, 'site-entry-time')[0].textContent, /All day/); assert.equal(descendants(en, 'site-entry-title')[0].textContent, 'Seguidor de linha');
  one.destroy(); two.destroy();
});

test('polling stops when hidden, refreshes on visibility and cannot overlap a pending request', async () => {
  let resolve;
  const h = harness([new Promise(done => { resolve = done; }), response(feed())]);
  const root = h.root(), handle = h.api.mount({ root, kind: 'PROJECT' });
  const first = handle.refresh(); assert.equal(first, handle.refresh());
  await Promise.resolve(); assert.equal(h.requests.length, 1); assert.equal([...h.intervals.values()][0].delay, 60000);
  resolve(response(feed([item()]))); await first;
  h.doc.hidden = true; h.doc.events.get('visibilitychange')(); assert.equal(h.intervals.size, 0);
  await handle.refresh(); assert.equal(h.requests.length, 1);
  h.doc.hidden = false; h.doc.events.get('visibilitychange')(); await handle.refresh(); assert.equal(h.requests.length, 2); assert.equal(h.intervals.size, 1);
  handle.destroy();
});

test('cleanup aborts a pending request and a late response cannot populate a new mount', async () => {
  let resolve;
  const h = harness([new Promise(done => { resolve = done; }), response(feed())]);
  const oldRoot = h.root(), old = h.api.mount({ root: oldRoot, kind: 'PROJECT' }); const pending = old.refresh(); await Promise.resolve();
  const signal = h.requests[0].options.signal; old.destroy(); assert.equal(signal.aborted, true);
  const root = h.root(), next = h.api.mount({ root, kind: 'PROJECT' }); await next.refresh();
  resolve(response(feed([item()]))); await pending;
  assert.equal(descendants(oldRoot, 'site-entry').length, 0); assert.equal(descendants(root, 'site-entry').length, 0); next.destroy();
});

test('a timed-out initial request offers retry without inventing content', async () => {
  const h = harness([options => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted'))))]);
  const root = h.root(), handle = h.api.mount({ root, kind: 'PROJECT' }); const pending = handle.refresh(); await Promise.resolve();
  const deadline = [...h.deadlines.values()].find(timer => timer.delay === 15000); deadline.fn(); await pending;
  assert.equal(root.getAttribute('data-state'), 'error'); assert.equal(descendants(root, 'site-entry').length, 0);
  assert.equal(descendants(root, 'site-content-retry').length, 1); assert.equal(root.getAttribute('aria-busy'), 'false'); handle.destroy();
});

test('an unavailable image is removed while public text and translated details remain readable', async () => {
  const h = harness([response(feed([item({ titleEn: 'Line follower', summaryEn: 'Control and sensors.' })]))]);
  const root = h.root(), handle = h.api.mount({ root, kind: 'PROJECT', english: true }); await handle.refresh();
  const image = descendants(root, 'site-entry-media')[0]; image.events.get('error')();
  assert.equal(descendants(root, 'site-entry-media').length, 0); assert.match(root.textContent, /Line follower/);
  assert.match(root.textContent, /Control and sensors/); assert.equal(descendants(root, 'site-entry-link')[0].textContent, 'View details'); handle.destroy();
});

test('partnerships, competition history and elapsed events have explicit status labels', async () => {
  const entries = [item({ id: 'active-partner', kind: 'PARTNERSHIP' }), item({ id: 'past-partner', kind: 'PARTNERSHIP', status: 'COMPLETED' }),
    item({ id: 'past-competition', kind: 'COMPETITION', status: 'COMPLETED' }),
    item({ id: 'elapsed-event', kind: 'EVENT', status: 'ACTIVE', startsAt: '2000-06-18T00:00:00Z', endsAt: '2000-06-19T00:00:00Z', allDay: true }),
    item({ id: 'scheduled-event', kind: 'EVENT', startsAt: '2099-06-18T00:00:00Z', endsAt: '2099-06-19T00:00:00Z', allDay: true })];
  const h = harness([response(feed(entries))]);
  const partnership = h.root(), competition = h.root(), events = h.root(), english = h.root();
  const handles = [h.api.mount({ root: partnership, kind: 'PARTNERSHIP' }), h.api.mount({ root: competition, kind: 'COMPETITION' }),
    h.api.mount({ root: events, kind: 'EVENT' }), h.api.mount({ root: english, kind: 'PARTNERSHIP', english: true })];
  await handles[0].refresh();
  assert.match(partnership.textContent, /Parceria ativa/); assert.match(partnership.textContent, /Parceria encerrada/);
  assert.match(competition.textContent, /Histórico/); assert.match(events.textContent, /Evento encerrado/); assert.match(events.textContent, /Programado/);
  assert.match(english.textContent, /Active partnership/); assert.match(english.textContent, /Past partnership/);
  assert.equal(descendants(events, 'site-entry')[0].getAttribute('data-entry-id'), 'scheduled-event');
  handles.forEach(handle => handle.destroy());
});

test('polls and failures retain unchanged articles and focused links, even when updatedAt changes', async () => {
  let resolve;
  const h = harness([response(feed([item()])), new Promise(done => { resolve = done; }), response({}, false), response(feed([item()]))]);
  const root = h.root(), handle = h.api.mount({ root, kind: 'PROJECT' }); await handle.refresh();
  const article = descendants(root, 'site-entry')[0], link = descendants(root, 'site-entry-link')[0];
  h.doc.activeElement = link;
  const pending = handle.refresh();
  assert.equal(root.getAttribute('aria-busy'), 'true'); assert.equal(descendants(root, 'site-entry')[0], article);
  resolve(response({ ...feed([item()]), updatedAt: '2026-09-27T08:00:00Z' })); await pending;
  assert.equal(root.getAttribute('aria-busy'), 'false'); assert.equal(descendants(root, 'site-entry-link')[0], link);
  await handle.refresh(); assert.equal(descendants(root, 'site-entry')[0], article); assert.ok(inside(link, article));
  await handle.refresh(); assert.equal(descendants(root, 'site-entry-link')[0], link); assert.equal(descendants(root, 'site-content-retry').length, 0);
  assert.equal(h.doc.activeElement, link); handle.destroy();
});

test('public dates require an explicit timezone and valid complete clock values', () => {
  for (const value of ['2026-06-18T10:00:00', '2026-06-18T10:00', '2026-06-18T24:00:00Z',
    '2026-06-18T10:60:00Z', '2026-06-18T10:00:60Z', '2026-06-18T10:00:00+25:00',
    '2025-02-29T10:00:00Z']) assert.throws(() => api.validate(feed([item({ startsAt: value })])), TypeError, value);
  const normalized = api.validate(feed([item({ startsAt: '2026-06-18T21:30:00-03:00', endsAt: '2026-06-18T22:30:00-03:00' })]));
  assert.equal(normalized.items[0].startsAt, '2026-06-19T00:30:00.000Z');
  assert.equal(normalized.items[0].endsAt, '2026-06-19T01:30:00.000Z');
});

test('all-day event status follows the club civil day, not UTC midnight', async () => {
  const value = feed([item({ kind: 'EVENT', startsAt: '2026-06-18T00:00:00Z', endsAt: '2026-06-19T00:00:00Z', allDay: true })]);
  const h = harness([response(value)], { now: '2026-06-18T02:59:59Z' });
  const root = h.root(), handle = h.api.mount({ root, kind: 'EVENT' }); await handle.refresh();
  assert.equal(descendants(root, 'site-entry-meta')[0].textContent, 'Programado');
  for (const [now, label] of [['2026-06-18T03:00:00Z', 'Em andamento'], ['2026-06-19T02:59:59Z', 'Em andamento'], ['2026-06-19T03:00:00Z', 'Evento encerrado']]) {
    h.setNow(now); h.responses.push(response(value)); await handle.refresh();
    assert.equal(descendants(root, 'site-entry-meta')[0].textContent, label, now);
  }
  const time = descendants(root, 'site-entry-time')[0];
  assert.match(time.textContent, /18/); assert.doesNotMatch(time.textContent, /17|até/);
  assert.equal(time.dateTime, '2026-06-18T00:00:00.000Z'); handle.destroy();
});

test('all-day end defaults to the following civil day, including leap day and year boundary', () => {
  for (const [startsAt, expected] of [['2024-02-29T00:00:00Z', '2024-03-01T00:00:00.000Z'], ['2026-12-31T00:00:00Z', '2027-01-01T00:00:00.000Z']]) {
    const normalized = api.validate(feed([item({ kind: 'EVENT', startsAt, allDay: true })]));
    assert.equal(normalized.items[0].endsAt, expected);
  }
  for (const change of [{ startsAt: '2026-06-18T03:00:00Z' }, { endsAt: '2026-06-19T03:00:00Z' },
    { endsAt: '2026-06-18T00:00:00Z' }, { endsAt: '2026-06-17T00:00:00Z' }]) {
    assert.throws(() => api.validate(feed([item({ kind: 'EVENT', startsAt: '2026-06-18T00:00:00Z', endsAt: '2026-06-19T00:00:00Z', allDay: true, ...change })])));
  }
});

test('all-day multi-day range presents only included dates; timed events retain their actual local hour', async () => {
  const h = harness([response(feed([
    item({ id: 'all-day', kind: 'EVENT', startsAt: '2026-12-31T00:00:00Z', endsAt: '2027-01-03T00:00:00Z', allDay: true }),
    item({ id: 'timed', kind: 'EVENT', startsAt: '2026-06-18T21:30:00-03:00', endsAt: '2026-06-18T22:30:00-03:00' }),
  ]))]);
  const root = h.root(), handle = h.api.mount({ root, kind: 'EVENT', english: true }); await handle.refresh();
  const entries = descendants(root, 'site-entry');
  const allDay = entries.find(entry => entry.getAttribute('data-entry-id') === 'all-day');
  const timed = entries.find(entry => entry.getAttribute('data-entry-id') === 'timed');
  assert.equal(descendants(allDay, 'site-entry-time')[0].textContent, '31 Dec 2026 to 02 Jan 2027 · All day');
  assert.equal(descendants(timed, 'site-entry-time')[0].textContent, '18 Jun 2026, 21:30 to 18 Jun 2026, 22:30');
  handle.destroy();
});

test('effects remount only after publication changes and removed entries stay detached', async () => {
  const first = item(), next = item({ id: 'cms-public-2', title: 'Hockey' });
  const h = harness([response(feed([first])), response(feed([first])), response(feed([next])), response(feed())]);
  const root = h.root(), handle = h.api.mount({ root, kind: 'PROJECT' });
  await handle.refresh();
  const old = descendants(root, 'site-entry')[0], initialMounts = h.effects.length;
  await handle.refresh(); assert.equal(h.effects.length, initialMounts); assert.equal(descendants(root, 'site-entry')[0], old);
  await handle.refresh(); assert.equal(h.effects.length, initialMounts + 1); assert.equal(old.parentNode, null);
  const current = descendants(root, 'site-entry')[0];
  assert.equal(current.getAttribute('data-entry-id'), 'cms-public-2');
  await handle.refresh(); assert.equal(h.effects.length, initialMounts + 2); assert.equal(current.parentNode, null);
  assert.equal(descendants(root, 'site-entry').length, 0); handle.destroy();
});

test('decoration failure cannot break the authoritative feed or its next refresh', async () => {
  const h = harness([response(feed([item()])), response(feed())]);
  h.scope.ArtrobotsSiteEffects.mount = () => { throw Error('No graphics support'); };
  const root = h.root(), handle = h.api.mount({ root, kind: 'PROJECT' });
  await handle.refresh(); assert.equal(root.getAttribute('data-state'), 'ready'); assert.match(root.textContent, /Seguidor de linha/);
  await handle.refresh(); assert.equal(root.getAttribute('data-state'), 'empty'); assert.doesNotMatch(root.textContent, /Seguidor de linha/);
  handle.destroy();
});

test('both published homepages connect the four existing sections without static entry fallbacks', () => {
  const sections = { PROJECT: 'projects', COMPETITION: 'competitions', PARTNERSHIP: 'sponsors', EVENT: 'calendar' };
  for (const filename of ['index.html', 'index-en.html']) {
    const html = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
    assert.equal((html.match(/data-public-content=/g) || []).length, 4);
    for (const [kind, id] of Object.entries(sections)) {
      const section = html.slice(html.indexOf(`id="${id}"`), html.indexOf('</section>', html.indexOf(`id="${id}"`)));
      assert.match(section, new RegExp(`data-public-content="${kind}"`));
      assert.doesNotMatch(section, /data-entry-id=|data-site-key=|<!-- Lugo Bots -->|<!-- Event 1:/);
    }
    assert.match(html, /src="components\/site-content.js" defer/);
    assert.match(html, /href="components\/site-content.css"/);
  }
});

test('an invalid subsequent feed cannot restore withdrawn entries or render private fields', async () => {
  const secret = 'private-source-and-note';
  const invalid = feed([item({ sourceId: secret, notes: secret, draft: { summary: secret }, startsAt: '2026-06-18T10:00:00' })]);
  const h = harness([response(feed([item()])), response(feed()), response(invalid)]);
  const root = h.root(), handle = h.api.mount({ root, kind: 'PROJECT' });
  await handle.refresh(); await handle.refresh(); await handle.refresh();
  assert.equal(root.getAttribute('data-state'), 'error');
  assert.equal(descendants(root, 'site-entry').length, 0); assert.doesNotMatch(root.textContent, /private-source-and-note|Seguidor de linha/);
  handle.destroy();
});

test('dated competitions become historical after their end, with the same civil-day boundary as events', async () => {
  const publication = feed([
    item({ id: 'dated', kind: 'COMPETITION', startsAt: '2026-06-18T00:00:00Z', endsAt: '2026-06-19T00:00:00Z', allDay: true }),
    item({ id: 'ongoing', kind: 'COMPETITION', startsAt: '2026-06-18T09:00:00-03:00' }),
  ]);
  const h = harness([response(publication)], { now: '2026-06-19T02:59:59Z' });
  const root = h.root(), handle = h.api.mount({ root, kind: 'COMPETITION' }); await handle.refresh();
  assert.equal(descendants(root, 'site-entry-meta')[0].textContent, 'Competição ativa');
  h.setNow('2026-06-19T03:00:00Z'); h.responses.push(response(publication)); await handle.refresh();
  const entries = descendants(root, 'site-entry');
  assert.equal(entries[0].getAttribute('data-entry-id'), 'ongoing');
  assert.equal(descendants(entries[1], 'site-entry-meta')[0].textContent, 'Histórico');
  handle.destroy();
});

test('changing or withdrawing B preserves focused A, its exact DOM and its open state', async () => {
  const a = item({ id: 'a', order: 1 }), b = item({ id: 'b', order: 2 });
  const h = harness([response(feed([a, b])), response(feed([a, { ...b, summary: 'Updated B' }])), response(feed([a]))]);
  const root = h.root(), handle = h.api.mount({ root, kind: 'PROJECT' }); await handle.refresh();
  const card = descendants(root, 'site-entry')[0], link = descendants(card, 'site-entry-link')[0];
  card.setAttribute('data-open-state', 'back'); link.focus();
  await handle.refresh(); assert.equal(descendants(root, 'site-entry')[0], card); assert.equal(h.doc.activeElement, link);
  assert.equal(card.getAttribute('data-open-state'), 'back');
  await handle.refresh(); assert.equal(descendants(root, 'site-entry')[0], card); assert.equal(h.doc.activeElement, link);
  handle.destroy();
});

test('reordering a surviving focused card restores the exact control after a DOM move', async () => {
  const a = item({ id: 'a', order: 2 }), b = item({ id: 'b', order: 3 });
  const h = harness([response(feed([a, b])), response(feed([a, { ...b, order: 1 }]))]);
  const root = h.root(), handle = h.api.mount({ root, kind: 'PROJECT' }); await handle.refresh();
  const card = descendants(root, 'site-entry')[0], link = descendants(card, 'site-entry-link')[0]; link.focus();
  await handle.refresh(); assert.equal(descendants(root, 'site-entry')[1], card); assert.equal(h.doc.activeElement, link);
  handle.destroy();
});

test('updating or withdrawing the focused item moves focus to an available control, then the empty section', async () => {
  const a = item({ id: 'a' }), b = item({ id: 'b', order: 1 });
  const h = harness([response(feed([a, b])), response(feed([{ ...a, title: 'Updated A' }, b])), response(feed([b])), response(feed())]);
  const root = h.root(), handle = h.api.mount({ root, kind: 'PROJECT' }); await handle.refresh();
  descendants(descendants(root, 'site-entry')[0], 'site-entry-link')[0].focus();
  await handle.refresh(); let cards = descendants(root, 'site-entry'); assert.equal(h.doc.activeElement, descendants(cards[0], 'site-entry-link')[0]);
  await handle.refresh(); cards = descendants(root, 'site-entry'); assert.equal(cards[0].getAttribute('data-entry-id'), 'b'); assert.equal(h.doc.activeElement, descendants(cards[0], 'site-entry-link')[0]);
  await handle.refresh(); assert.equal(h.doc.activeElement, root); assert.equal(root.tabIndex, -1); assert.equal(root.getAttribute('data-state'), 'empty');
  handle.destroy();
});
