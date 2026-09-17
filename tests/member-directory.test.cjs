const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const api = require('../components/public-members.js');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const member = (id, group = 'community', siteKey = null) => ({ id, name: '<img src=x> Name', position: 'Member', description: 'Public description', photoPath: `/api/public/members/${id}/photo`, profilePath: `/membros/${id}`, siteKey, directoryGroup: group });

// Small DOM adapter exercises our transitions without adding a package or emulating rendering.
class Element {
  constructor(tag = 'custom') { this.tagName = tag; this.children = []; this.dataset = {}; this.attributes = {}; this.style = { setProperty() {} }; this.hidden = false; this.textContent = ''; }
  append(...nodes) { for (const node of nodes) { if (node.tagName === 'fragment') this.append(...[...node.children]); else { node.parentNode = this; this.children.push(node); } } }
  prepend(node) { node.parentNode = this; this.children.unshift(node); }
  before(node) { node.parentNode = this.parentNode; this.parentNode.children.splice(this.parentNode.children.indexOf(this), 0, node); }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  setAttribute(key, value) { this.attributes[key] = value; }
  getAttribute(key) { return this.attributes[key]; }
  addEventListener() {}
  matches(selector) {
    const data = selector.match(/^\[data-([a-z-]+)\]$/);
    return data ? Object.hasOwn(this.dataset, data[1].replace(/-([a-z])/g, (_, char) => char.toUpperCase())) : this.tagName === selector;
  }
  querySelectorAll(selector) {
    const parts = selector.split(' '), result = [];
    const visit = (node) => { for (const child of node.children) { if (child.matches(parts.at(-1)) && (parts.length === 1 || child.closest(parts[0]))) result.push(child); visit(child); } };
    visit(this); return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  closest(selector) { let node = this; while (node) { if (node.matches(selector)) return node; node = node.parentNode; } return null; }
}

function environment(script, feedProvider) {
  const document = new Element('document');
  document.documentElement = { lang: 'pt-BR' };
  document.createElement = (tag) => new Element(tag);
  document.createDocumentFragment = () => new Element('fragment');
  const classes = {};
  const context = vm.createContext({ document, location: { hostname: 'example.org', origin: 'https://example.org', href: 'https://example.org/membro.html?perfil=old-person', search: '?perfil=old-person', replace(url) { this.redirected = url; } }, HTMLElement: Element, customElements: { define(name, cls) { classes[name] = cls; } }, ArtrobotsPublicMembers: { ...api, configuredOrigin: () => 'https://community.example.org', loadFeed: feedProvider }, URL, URLSearchParams, AbortSignal });
  vm.runInContext(read(script), context);
  return { document, context, classes };
}

test('contract rejects foreign paths, duplicate identities and ambiguous associations', () => {
  assert.equal(api.validSiteKey('a'.repeat(80)), true);
  assert.equal(api.validSiteKey('a'.repeat(81)), false);
  const good = { members: [member('one', 'projects', 'old-person')], linkedSiteKeys: ['old-person'] };
  assert.equal(api.validateFeed(good), good);
  for (const change of [ { profilePath: '//evil.test/member' }, { photoPath: '/private/photo' }, { siteKey: 'unknown' }, { directoryGroup: 'admin' } ]) assert.throws(() => api.validateFeed({ ...good, members: [{ ...good.members[0], ...change }] }));
  assert.throws(() => api.validateFeed({ ...good, members: [good.members[0], good.members[0]] }));
  assert.throws(() => api.validateFeed({ ...good, members: [good.members[0], member('two', 'projects', 'old-person')] }));
  assert.throws(() => api.validateFeed({ members: [], linkedSiteKeys: ['old-person', 'old-person'] }));
});

test('a withdrawn exact key stays withdrawn; names do not establish identity', () => {
  const feed = api.validateFeed({ members: [member('one', 'community', 'first-person')], linkedSiteKeys: ['first-person', 'withdrawn-person'] });
  assert.equal(api.profileState(feed, 'first-person').kind, 'connected');
  assert.equal(api.profileState(feed, 'withdrawn-person').kind, 'withdrawn');
  assert.equal(api.profileState(feed, 'person-with-the-same-name').kind, 'legacy');
});

test('configured origin is HTTPS only, apart from the explicit local preview', () => {
  const doc = (content) => ({ querySelector: () => ({ content }) });
  assert.equal(api.configuredOrigin(doc(''), { hostname: 'site.example.org' }), null);
  assert.equal(api.configuredOrigin(doc(''), { hostname: 'localhost' }), 'http://127.0.0.1:3107');
  assert.equal(api.configuredOrigin(doc('https://community.example.org'), { hostname: 'site.example.org' }), 'https://community.example.org');
  for (const value of ['http://community.example.org', 'https://user:pass@community.example.org', 'https://community.example.org/path', 'javascript:alert(1)']) assert.throws(() => api.configuredOrigin(doc(value), { hostname: 'site.example.org' }));
});

test('both directories preserve 27 public identities, exact photos and working profile links', () => {
  const extract = (file, profile) => {
    const text = read(file);
    const cards = [...text.matchAll(/<a href="([^"\n]+)" data-site-key="([a-z0-9-]+)"([^]*?)<\/a>/g)];
    assert.equal(cards.length, 27);
    assert.equal(new Set(cards.map((item) => item[2])).size, 27);
    for (const item of cards) assert.equal(item[1], `${profile}?perfil=${item[2]}`);
    assert.ok(text.lastIndexOf('<artrobots-member-directory>') > text.lastIndexOf('data-site-key='));
    assert.equal((text.match(/data-legacy-project/g) || []).length, 4);
    return cards.map((item) => ({ key: item[2], name: item[3].match(/<h3[^>]*>([^<]*)/)[1], photo: item[3].match(/<img src="([^"]+)"/)[1] }));
  };
  assert.deepEqual(extract('membros.html', 'membro.html'), extract('membros-en.html', 'membro-en.html'));
});

test('directory hides every linked legacy occurrence, keeps unlinked cards, and puts community last', async () => {
  const feed = api.validateFeed({ members: [member('president', 'leadership'), member('active', 'projects', 'old-person'), member('free', 'community')], linkedSiteKeys: ['old-person', 'withdrawn-person'] });
  const { document, classes } = environment('components/member-directory.js', async () => feed);
  const host = new Element('div'); host.dataset.legacyDirectory = ''; document.append(host);
  const sections = ['board', 'projects'].map((id) => { const section = new Element('section'); section.dataset.legacyTeam = ''; section.id = id; if (id === 'projects') section.dataset.legacyProject = ''; host.append(section); return section; });
  const cards = ['old-person', 'old-person', 'withdrawn-person', 'unlinked-person'].map((key, index) => { const card = new Element('a'); card.dataset.siteKey = key; sections[index < 2 ? 0 : 1].append(card); return card; });
  const directory = new classes['artrobots-member-directory'](); host.append(directory); directory.english = false; directory.render(); await directory.load();
  assert.deepEqual(cards.map((card) => card.hidden), [true, true, true, false]);
  assert.equal(sections[0].hidden, true); assert.equal(sections[1].hidden, false);
  assert.equal(host.children[0], directory.sections.leadership.section);
  assert.equal(host.children.at(-1), directory);
  assert.equal(directory.children.at(-1), directory.sections.community.section);
  for (const group of api.groups) assert.equal(directory.sections[group].grid.children.length, 1);
  const card = directory.sections.projects.grid.children[0];
  assert.equal(card.href, 'https://community.example.org/membros/active');
  assert.equal(card.querySelector('h3').textContent, '<img src=x> Name');
  assert.equal(card.querySelector('img').width, 96);
  directory.english = true;
  assert.equal(directory.card(feed.members[1], 'https://community.example.org').href, 'https://community.example.org/membros/active?lang=en');
});

test('individual profile redirects only to an approved canonical identity', async () => {
  const feed = api.validateFeed({ members: [member('approved', 'projects', 'old-person')], linkedSiteKeys: ['old-person'] });
  const { document, context, classes } = environment('components/member-profile.js', async () => feed);
  const profile = new classes['artrobots-member-profile'](); document.append(profile); profile.connectedCallback();
  await new Promise(setImmediate);
  assert.equal(context.location.redirected, 'https://community.example.org/membros/approved');
  assert.equal(profile.content.children.length, 0);
  profile.english = true;
  await profile.load();
  assert.equal(context.location.redirected, 'https://community.example.org/membros/approved?lang=en');
});

test('withdrawal and unavailable feed cannot resurrect an individual legacy profile', async () => {
  for (const fetchFeed of [async () => ({ members: [], linkedSiteKeys: ['old-person'] }), async () => { throw new Error('Unavailable'); }]) {
    const { document, context, classes } = environment('components/member-profile.js', fetchFeed);
    let fallbackRequested = false;
    context.fetch = async () => { fallbackRequested = true; throw new Error('Must not fetch legacy'); };
    const profile = new classes['artrobots-member-profile'](); document.append(profile); profile.connectedCallback();
    await new Promise(setImmediate);
    assert.equal(fallbackRequested, false);
    assert.equal(profile.content.children.length, 0);
    assert.ok(profile.status.textContent.length > 0);
  }
});

test('unassociated profile reads only the exact legacy key and does not invent a community account', async () => {
  const { document, context, classes } = environment('components/member-profile.js', async () => ({ members: [], linkedSiteKeys: [] }));
  const source = new Element('document');
  for (const key of ['old-person', 'other-person']) {
    const section = new Element('section'); section.dataset.legacyTeam = ''; section.id = 'hockey';
    const team = new Element('h2'); team.textContent = 'HOCKEY'; section.append(team);
    const card = new Element('a'); card.dataset.siteKey = key;
    const name = new Element('h3'); name.textContent = key === 'old-person' ? 'Public Name' : 'Another Name';
    const photo = new Element('img'); photo.setAttribute('src', 'assets/already-public.jpg');
    const position = new Element('p'); position.textContent = 'Membro de Computação';
    card.append(name, photo, position); section.append(card); source.append(section);
  }
  context.DOMParser = class { parseFromString() { return source; } };
  const requests = [];
  context.fetch = async (url) => { requests.push(url); return { ok: true, text: async () => '<public directory fixture>' }; };
  const profile = new classes['artrobots-member-profile'](); document.append(profile); profile.connectedCallback();
  await new Promise(setImmediate);
  assert.deepEqual(requests, ['membros.html']);
  assert.equal(profile.content.querySelector('h1').textContent, 'Public Name');
  assert.equal(profile.content.querySelectorAll('li').length, 1);
  assert.equal(profile.content.querySelector('a').href, 'membros.html#hockey');
  assert.equal(profile.content.querySelector('img').src, 'https://example.org/assets/already-public.jpg');
  assert.equal(context.location.redirected, undefined);
  assert.equal(profile.status.textContent, '');
});

test('language switching preserves the public profile key', () => {
  const location = { pathname: '/clube/membro.html', search: '?perfil=carlos-icaro', hash: '', replace(url) { this.redirected = url; } };
  vm.runInNewContext(read('i18n.js'), { window: { location }, document: { documentElement: { getAttribute: () => 'pt-BR' } }, localStorage: { getItem: () => 'en' }, navigator: { language: 'en' } });
  assert.equal(location.redirected, 'membro-en.html?perfil=carlos-icaro');
});
