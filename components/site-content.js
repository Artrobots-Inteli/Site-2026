(function (scope) {
  'use strict';

  const FEED = 'https://artrolove.artrobots.tech/api/public/site-content';
  const KINDS = ['PROJECT', 'COMPETITION', 'PARTNERSHIP', 'EVENT'];
  const APP_ORIGINS = ['https://artrolove.artrobots.tech', 'https://artrolove.onrender.com'];
  const listeners = new Set();
  const roots = new WeakMap();
  let snapshot = null, failure = false, pending = null, controller = null, timer = null, generation = 0;

  function publicUrl(value) {
    if (typeof value !== 'string' || !value || value.length > 2000 || /[\u0000-\u001f\u007f]/.test(value)) return null;
    try {
      const url = new URL(value);
      const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
      if (url.protocol !== 'https:' || url.username || url.password || !host || host === 'localhost'
        || /\.(?:localhost|local|internal)$/.test(host) || !host.includes('.') && !host.includes(':')) return null;
      if (/^(?:0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(host)
        || host === '::' || host === '::1' || /^(?:fc|fd|fe[89ab])/.test(host) && host.includes(':')
        || host.startsWith('::ffff:')) return null;
      return url.href;
    } catch { return null; }
  }

  function publicImage(value) {
    const safe = publicUrl(value);
    if (!safe) return null;
    const url = new URL(safe);
    if (url.search || url.hash) return null;
    let path;
    try { path = decodeURIComponent(url.pathname); } catch { return null; }
    if (path.includes('..') || path.includes('\\') || /[\u0000-\u001f\u007f]/.test(path)) return null;
    const asset = url.origin === 'https://artrobots.tech' && path.startsWith('/assets/')
      && (/\.(?:png|jpe?g|webp|avif|gif)$/i.test(path) || path === '/assets/solidoworks.svg');
    const photo = APP_ORIGINS.includes(url.origin) && /^\/api\/public\/site-content\/photos\/[A-Za-z0-9_-]{8,100}$/.test(path);
    return asset || photo ? safe : null;
  }

  function text(value, max, required) {
    if (value === undefined || value === null) value = '';
    if (typeof value !== 'string' || value.length > max || required && !value.trim()) throw new TypeError('Invalid public content');
    return value.trim();
  }
  function date(value) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)) throw new TypeError('Invalid public date');
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    const calendar = new Date(Date.UTC(year, month - 1, day));
    if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day || !Number.isFinite(Date.parse(value))) throw new TypeError('Invalid public date');
    return new Date(value).toISOString();
  }

  function validate(value) {
    if (!value || typeof value !== 'object' || value.schemaVersion !== 1 || typeof value.initialized !== 'boolean'
      || !Array.isArray(value.items) || value.items.length > 500) throw new TypeError('Invalid public feed');
    const seen = new Set();
    const items = value.items.map(item => {
      if (!item || typeof item !== 'object' || !KINDS.includes(item.kind) || typeof item.id !== 'string'
        || !/^[A-Za-z0-9_-]{1,100}$/.test(item.id) || seen.has(item.id)
        || !['ACTIVE', 'COMPLETED'].includes(item.status) || typeof item.featured !== 'boolean'
        || !Number.isInteger(item.order) || item.order < 0 || item.order > 9999) throw new TypeError('Invalid public entry');
      seen.add(item.id);
      const startsAt = date(item.startsAt), allDay = item.allDay === undefined ? false : item.allDay;
      let endsAt = date(item.endsAt);
      if (allDay && startsAt && !endsAt) endsAt = new Date(Date.parse(startsAt) + 86400000).toISOString();
      if (typeof allDay !== 'boolean' || item.kind === 'EVENT' && !startsAt
        || endsAt && (!startsAt || endsAt <= startsAt)
        || allDay && (!['EVENT', 'COMPETITION'].includes(item.kind) || !startsAt || !startsAt.endsWith('T00:00:00.000Z')
          || endsAt && !endsAt.endsWith('T00:00:00.000Z'))) throw new TypeError('Invalid public date range');
      const imageAlt = text(item.imageAlt, 300), image = publicImage(item.imageUrl);
      // Explicit allowlist. Source IDs, notes, draft fields and future JSON
      // properties never enter the browser's rendering contract accidentally.
      return { id: item.id, kind: item.kind, title: text(item.title, 160, true), titleEn: text(item.titleEn, 160),
        summary: text(item.summary, 1600, true), summaryEn: text(item.summaryEn, 1600),
        imageUrl: imageAlt ? image : null, imageAlt, url: publicUrl(item.url), featured: item.featured,
        order: item.order, status: item.status, startsAt, endsAt, allDay, location: text(item.location, 300) };
    });
    return { schemaVersion: 1, initialized: value.initialized, updatedAt: date(value.updatedAt), items: value.initialized ? items : [] };
  }

  function civilToday() {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${value.year}-${value.month}-${value.day}`;
  }
  function ended(item) {
    const calendarKind = item.kind === 'EVENT' || item.kind === 'COMPETITION';
    // Dated competitions leave the active list after their published end.
    // A competition without an end retains its editorial status.
    const end = item.endsAt || (item.kind === 'EVENT' ? item.startsAt : null);
    return item.status === 'COMPLETED' || calendarKind && end && (item.allDay
      ? civilToday() >= end.slice(0, 10) : Date.parse(end) <= Date.now());
  }
  function stateLabel(item, english) {
    if (item.kind === 'PARTNERSHIP') return ended(item) ? (english ? 'Past partnership' : 'Parceria encerrada') : (english ? 'Active partnership' : 'Parceria ativa');
    if (item.kind === 'COMPETITION') return ended(item) ? (english ? 'Past competition' : 'Histórico') : (english ? 'Active competition' : 'Competição ativa');
    if (item.kind === 'EVENT') return ended(item) ? (english ? 'Past event' : 'Evento encerrado')
      : (item.allDay ? civilToday() < item.startsAt.slice(0, 10) : Date.parse(item.startsAt) > Date.now()) ? (english ? 'Scheduled' : 'Programado') : (english ? 'In progress' : 'Em andamento');
    return ended(item) ? (english ? 'Completed' : 'Encerrado') : (english ? 'Active' : 'Em andamento');
  }
  function itemsFor(value, kind) {
    if (!KINDS.includes(kind)) throw new TypeError('Unknown public content kind');
    return validate(value).items.filter(item => item.kind === kind).sort((a, b) =>
      Number(ended(a)) - Number(ended(b)) || Number(b.featured) - Number(a.featured)
      || a.order - b.order || (kind === 'EVENT' ? (a.startsAt || '').localeCompare(b.startsAt || '') : 0)
      || a.title.localeCompare(b.title, 'pt-BR') || a.id.localeCompare(b.id));
  }

  function formattedDate(value, allDay, english) {
    return new Intl.DateTimeFormat(english ? 'en-GB' : 'pt-BR', { timeZone: allDay ? 'UTC' : 'America/Sao_Paulo',
      day: '2-digit', month: 'short', year: 'numeric', ...(allDay ? {} : { hour: '2-digit', minute: '2-digit' }) }).format(new Date(value));
  }
  function element(doc, tag, className, value) {
    const node = doc.createElement(tag); node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function entry(doc, item, english) {
    const classes = { PROJECT: 'bg-dark p-8 rounded-xl shadow-2xl border', COMPETITION: 'bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl border border-secondary', PARTNERSHIP: 'sponsor-item min-w-[300px] rounded-lg border border-secondary p-5 text-center', EVENT: 'bg-gray-700 p-4 rounded-lg border-l-4 border-secondary' };
    const article = element(doc, 'article', `site-entry ${classes[item.kind]}`); article.setAttribute('data-kind', item.kind); article.setAttribute('data-entry-id', item.id);
    const body = element(doc, 'div', 'site-entry-body');
    if (item.kind === 'EVENT') {
      const badge = element(doc, 'div', 'site-entry-date-badge'); badge.setAttribute('aria-hidden', 'true');
      const day = new Date(item.startsAt), timeZone = item.allDay ? 'UTC' : 'America/Sao_Paulo';
      badge.append(element(doc, 'span', 'site-entry-day', new Intl.DateTimeFormat(english ? 'en-GB' : 'pt-BR', { timeZone, day: '2-digit' }).format(day)),
        element(doc, 'span', 'site-entry-month', new Intl.DateTimeFormat(english ? 'en-GB' : 'pt-BR', { timeZone, month: 'short' }).format(day)));
      article.append(badge);
    }
    if (item.imageUrl) {
      const image = element(doc, 'img', 'site-entry-media'); image.src = item.imageUrl; image.alt = item.imageAlt;
      image.loading = 'lazy'; image.decoding = 'async'; image.referrerPolicy = 'no-referrer'; image.width = 640; image.height = 360;
      image.addEventListener('error', () => image.remove(), { once: true }); (item.kind === 'EVENT' ? body : article).append(image);
    }
    const meta = element(doc, 'p', 'site-entry-meta');
    meta.textContent = stateLabel(item, english) + (item.featured ? (english ? ' · Featured' : ' · Destaque') : '');
    body.append(element(doc, 'h3', 'site-entry-title', english && item.titleEn || item.title),
      element(doc, 'p', 'site-entry-summary', english && item.summaryEn || item.summary), meta);
    const details = element(doc, 'div', 'site-entry-details');
    if (item.startsAt) {
      const first = formattedDate(item.startsAt, item.allDay, english);
      // All-day end dates are exclusive in the API. Present the last included
      // civil day, retaining UTC so Brazil does not shift it to the previous day.
      const finalDate = item.endsAt && (item.allDay ? new Date(Date.parse(item.endsAt) - 1000).toISOString() : item.endsAt);
      const last = finalDate && formattedDate(finalDate, item.allDay, english);
      const time = element(doc, 'time', 'site-entry-time', first + (last && last !== first ? (english ? ' to ' : ' até ') + last : '')
        + (item.allDay ? (english ? ' · All day' : ' · Dia inteiro') : ''));
      time.dateTime = item.startsAt; details.append(time);
    }
    if (item.location) details.append(element(doc, 'p', 'site-entry-location', item.location));
    if (item.url) {
      const link = element(doc, 'a', 'site-entry-link', english ? 'View details' : 'Ver detalhes');
      link.href = item.url; link.rel = 'noopener noreferrer'; details.append(link);
    }
    body.append(details); article.append(body); return article;
  }

  const EMPTY = {
    PROJECT: ['Nenhum projeto publicado.', 'No published projects.'], COMPETITION: ['Nenhuma competição publicada.', 'No published competitions.'],
    PARTNERSHIP: ['Nenhuma parceria publicada.', 'No published partnerships.'], EVENT: ['Nenhum evento publicado.', 'No published events.']
  };
  function reconcile(mount, items) {
    const { root, doc, english } = mount;
    const previous = mount.entries || new Map(), next = new Map();
    const active = doc.activeElement;
    const hadFocus = !!active && root.contains(active);
    const oldCards = [...previous.entries()];
    const focusedIndex = hadFocus ? oldCards.findIndex(([, record]) => record.node.contains(active)) : -1;
    const focusedId = focusedIndex >= 0 ? oldCards[focusedIndex][0] : null;
    for (const item of items) {
      const signature = JSON.stringify([item, stateLabel(item, english)]);
      const cached = previous.get(item.id);
      next.set(item.id, cached?.signature === signature ? cached : { signature, node: entry(doc, item, english) });
    }
    const nodes = [...next.values()].map(record => record.node), keep = new Set(nodes);
    for (const child of [...root.children]) if (!keep.has(child)) child.remove();
    nodes.forEach((node, index) => { if (root.children[index] !== node) root.insertBefore(node, root.children[index] || null); });
    mount.entries = next;
    try { scope.ArtrobotsSiteEffects?.mount(root); } catch { /* Public text stays readable if decoration is unavailable. */ }
    if (!hadFocus) return;
    // insertBefore can reset focus when a surviving element is reordered.
    // Restore that exact control; changed/withdrawn cards use a nearby control.
    let target = root.contains(active) ? active : null;
    if (!target) {
      const card = next.get(focusedId)?.node || nodes[Math.min(Math.max(focusedIndex, 0), nodes.length - 1)];
      target = card?.querySelector('.rb-flip-toggle') || card?.querySelector('a,button,[tabindex]') || card || root;
      if (target === card || target === root) target.tabIndex = -1;
    }
    if (doc.activeElement !== target) target.focus({ preventScroll: true });
  }
  function render(mount) {
    const { root, kind, english, doc } = mount;
    const items = snapshot ? itemsFor(snapshot, kind) : [];
    const state = failure ? 'error' : !snapshot ? 'loading' : !snapshot.initialized ? 'uninitialized' : items.length ? 'ready' : 'empty';
    root.setAttribute('data-state', state); root.setAttribute('aria-busy', pending ? 'true' : 'false');
    // Starting a poll only updates aria-busy. Unchanged publications retain
    // their DOM nodes, keyboard focus and image state, even after a feed error.
    const contentSignature = JSON.stringify([snapshot && snapshot.initialized, items.map(item => [item, stateLabel(item, english)])]);
    if (mount.contentSignature !== contentSignature) {
      reconcile(mount, items);
      mount.contentSignature = contentSignature; mount.statusNode = null; mount.stateSignature = null;
    }
    const stateSignature = JSON.stringify([state, !!snapshot]);
    if (mount.stateSignature === stateSignature) return;
    mount.statusNode?.remove(); mount.statusNode = null; mount.stateSignature = stateSignature;
    if (state !== 'ready') {
      const status = element(doc, 'div', 'site-content-state'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
      const message = failure ? (snapshot ? (english ? 'Connection unavailable. Displaying the last received publication.' : 'Conexão indisponível. Exibindo a última publicação recebida.')
        : (english ? 'Published content is unavailable.' : 'Não foi possível carregar o conteúdo publicado.'))
        : state === 'loading' ? (english ? 'Loading published content…' : 'Carregando conteúdo publicado…')
        : state === 'uninitialized' ? (english ? 'Content is awaiting publication.' : 'Conteúdo aguardando publicação.') : EMPTY[kind][english ? 1 : 0];
      status.append(element(doc, 'p', 'site-content-message', message));
      if (failure) {
        const retry = element(doc, 'button', 'site-content-retry', english ? 'Try again' : 'Tentar novamente'); retry.type = 'button';
        retry.addEventListener('click', () => { void refresh(); }); status.append(retry);
      }
      root.append(status); mount.statusNode = status;
    }
  }
  function notify() { listeners.forEach(render); }
  function visible() { return !scope.document.hidden; }
  function poll() {
    if (timer !== null) scope.clearInterval(timer);
    timer = visible() && listeners.size ? scope.setInterval(() => { if (visible()) void refresh(); }, 60000) : null;
  }
  function onVisibility() { poll(); if (visible()) void refresh(); }
  function onFocus() { if (visible()) void refresh(); }

  function refresh() {
    if (pending) return pending;
    if (!listeners.size || !visible()) return Promise.resolve(false);
    const current = generation;
    const requestController = new AbortController(); controller = requestController;
    const deadline = scope.setTimeout(() => requestController.abort(), 15000);
    pending = (async () => {
      try {
        const response = await Promise.resolve().then(() => scope.fetch(FEED, { cache: 'no-store', credentials: 'omit', mode: 'cors', redirect: 'error',
          referrerPolicy: 'no-referrer', headers: { Accept: 'application/json' }, signal: requestController.signal }));
        if (!response.ok) throw new Error('Public feed unavailable');
        const received = validate(await response.json());
        if (generation !== current || !listeners.size) return false;
        snapshot = received; failure = false; return true;
      } catch {
        if (generation === current && listeners.size) failure = true;
        return false;
      } finally {
        scope.clearTimeout(deadline);
        if (generation === current) { pending = null; controller = null; notify(); }
      }
    })();
    notify(); return pending;
  }

  function mount(options) {
    const root = options && options.root, kind = options && options.kind;
    if (!root || typeof root.replaceChildren !== 'function' || !KINDS.includes(kind) || !scope.document) throw new TypeError('Provide a root element and public content kind');
    roots.get(root)?.destroy();
    const subscription = { root, kind, english: !!options.english, doc: root.ownerDocument || scope.document };
    const first = !listeners.size;
    listeners.add(subscription);
    const handle = { refresh, destroy() {
      if (!listeners.delete(subscription)) return;
      if (roots.get(root) === handle) roots.delete(root);
      root.replaceChildren(); root.removeAttribute('aria-busy'); root.removeAttribute('data-state');
      if (!listeners.size) {
        generation++; controller?.abort(); controller = pending = null; snapshot = null; failure = false;
        if (timer !== null) scope.clearInterval(timer); timer = null;
        scope.document.removeEventListener('visibilitychange', onVisibility); scope.removeEventListener('focus', onFocus);
      }
    } };
    roots.set(root, handle);
    if (first) {
      scope.document.addEventListener('visibilitychange', onVisibility); scope.addEventListener('focus', onFocus); poll();
    }
    render(subscription); if (first) void refresh(); return handle;
  }

  const api = Object.freeze({ validate, publicUrl, publicImage, itemsFor, mount });
  scope.ArtrobotsSiteContent = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
  // The published page retains its section wrappers and layout. Only these
  // explicit slots are owned by the public feed; no private API is requested.
  if (scope.document?.querySelectorAll) {
    const start = () => {
      const handles = [...scope.document.querySelectorAll('[data-public-content]')].map(root =>
        mount({ root, kind: root.getAttribute('data-public-content'), english: scope.document.documentElement.lang.startsWith('en') }));
      scope.addEventListener('pagehide', event => { if (!event.persisted) handles.forEach(handle => handle.destroy()); });
      scope.addEventListener('pageshow', event => { if (event.persisted && visible()) void refresh(); });
    };
    if (scope.document.readyState === 'loading') scope.document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  }
})(typeof window === 'undefined' ? globalThis : window);
