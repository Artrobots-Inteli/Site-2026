import { normalizePublicHttpsUrl } from './public-https-url';

/** Public, allowlisted editorial contract. Private source IDs never enter the UI. */
export const SITE_CONTENT_URL = 'https://artrolove.artrobots.tech/api/public/site-content';
export const CONTENT_KINDS = ['PROJECT', 'COMPETITION', 'PARTNERSHIP', 'EVENT'] as const;
export type ContentKind = typeof CONTENT_KINDS[number];
export interface SiteEntry {
  id: string; kind: ContentKind; title: string; titleEn: string; summary: string; summaryEn: string;
  imageUrl: string | null; imageAlt: string; url: string | null; featured: boolean; order: number;
  status: 'ACTIVE' | 'COMPLETED'; startsAt: string | null; endsAt: string | null; allDay: boolean; location: string;
}
export interface SiteFeed { schemaVersion: 1; initialized: boolean; updatedAt: string | null; items: SiteEntry[] }
const APP_ORIGINS = ['https://artrolove.artrobots.tech', 'https://artrolove.onrender.com'];

export function publicUrl(value: unknown): string | null {
  return normalizePublicHttpsUrl(value);
}
export function publicImage(value: unknown): string | null {
  const safe = publicUrl(value); if (!safe) return null;
  const url = new URL(safe); if (url.search || url.hash) return null;
  let path: string; try { path = decodeURIComponent(url.pathname); } catch { return null; }
  if (path.includes('..') || path.includes('\\') || /[\u0000-\u001f\u007f]/.test(path)) return null;
  const asset = url.origin === 'https://artrobots.tech' && path.startsWith('/assets/')
    && (/\.(?:png|jpe?g|webp|avif|gif)$/i.test(path) || path === '/assets/solidoworks.svg');
  const photo = APP_ORIGINS.includes(url.origin) && /^\/api\/public\/site-content\/photos\/[A-Za-z0-9_-]{8,100}$/.test(path);
  return asset || photo ? safe : null;
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Invalid public object');
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number, required = false): string {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string' || value.length > max || required && !value.trim()) throw new TypeError('Invalid public content');
  return value.trim();
}
function date(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)) throw new TypeError('Invalid public date');
  const [year, month, day] = value.slice(0, 10).split('-').map(Number), calendar = new Date(Date.UTC(year, month - 1, day));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day || !Number.isFinite(Date.parse(value))) throw new TypeError('Invalid public date');
  return new Date(value).toISOString();
}
export function validateSiteFeed(value: unknown): SiteFeed {
  const feed = record(value);
  if (feed.schemaVersion !== 1 || typeof feed.initialized !== 'boolean' || !Array.isArray(feed.items) || feed.items.length > 500) throw new TypeError('Invalid public feed');
  const seen = new Set<string>();
  const items: SiteEntry[] = feed.items.map(raw => {
    const item = record(raw);
    if (!CONTENT_KINDS.includes(item.kind as ContentKind) || typeof item.id !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(item.id) || seen.has(item.id)
      || !['ACTIVE', 'COMPLETED'].includes(item.status as string) || typeof item.featured !== 'boolean'
      || typeof item.order !== 'number' || !Number.isInteger(item.order) || item.order < 0 || item.order > 9999) throw new TypeError('Invalid public entry');
    seen.add(item.id);
    const kind = item.kind as ContentKind, startsAt = date(item.startsAt), allDay = item.allDay === undefined ? false : item.allDay;
    let endsAt = date(item.endsAt);
    if (allDay && startsAt && !endsAt) endsAt = new Date(Date.parse(startsAt) + 86400000).toISOString();
    if (typeof allDay !== 'boolean' || kind === 'EVENT' && !startsAt || endsAt && (!startsAt || endsAt <= startsAt)
      || allDay && (!['EVENT', 'COMPETITION'].includes(kind) || !startsAt || !startsAt.endsWith('T00:00:00.000Z') || endsAt && !endsAt.endsWith('T00:00:00.000Z'))) throw new TypeError('Invalid public date range');
    const imageAlt = text(item.imageAlt, 300);
    return { id: item.id, kind, title: text(item.title, 160, true), titleEn: text(item.titleEn, 160), summary: text(item.summary, 1600, true), summaryEn: text(item.summaryEn, 1600),
      imageUrl: imageAlt ? publicImage(item.imageUrl) : null, imageAlt, url: publicUrl(item.url), featured: item.featured, order: item.order,
      status: item.status as SiteEntry['status'], startsAt, endsAt, allDay, location: text(item.location, 300) };
  });
  return { schemaVersion: 1, initialized: feed.initialized, updatedAt: date(feed.updatedAt), items: feed.initialized ? items : [] };
}
function civilToday(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}
export function ended(item: SiteEntry, now = new Date()): boolean {
  const end = item.endsAt || (item.kind === 'EVENT' ? item.startsAt : null);
  return item.status === 'COMPLETED' || (item.kind === 'EVENT' || item.kind === 'COMPETITION') && !!end
    && (item.allDay ? civilToday(now) >= end.slice(0, 10) : Date.parse(end) <= now.getTime());
}
export function stateLabel(item: SiteEntry, english: boolean, now = new Date()): string {
  if (item.kind === 'PARTNERSHIP') return ended(item, now) ? (english ? 'Past partnership' : 'Parceria encerrada') : (english ? 'Active partnership' : 'Parceria ativa');
  if (item.kind === 'COMPETITION') return ended(item, now) ? (english ? 'Past competition' : 'Histórico') : (english ? 'Active competition' : 'Competição ativa');
  if (item.kind === 'EVENT') return ended(item, now) ? (english ? 'Past event' : 'Evento encerrado')
    : (item.allDay ? civilToday(now) < item.startsAt!.slice(0, 10) : Date.parse(item.startsAt!) > now.getTime()) ? (english ? 'Scheduled' : 'Programado') : (english ? 'In progress' : 'Em andamento');
  return ended(item, now) ? (english ? 'Completed' : 'Encerrado') : (english ? 'Active' : 'Em andamento');
}
export function itemsFor(feed: SiteFeed, kind: ContentKind, now = new Date()): SiteEntry[] {
  return feed.items.filter(item => item.kind === kind).sort((a, b) => Number(ended(a, now)) - Number(ended(b, now)) || Number(b.featured) - Number(a.featured)
    || a.order - b.order || (kind === 'EVENT' ? (a.startsAt || '').localeCompare(b.startsAt || '') : 0) || a.title.localeCompare(b.title, 'pt-BR') || a.id.localeCompare(b.id));
}
export function formattedDate(value: string, allDay: boolean, english: boolean): string {
  return new Intl.DateTimeFormat(english ? 'en-GB' : 'pt-BR', { timeZone: allDay ? 'UTC' : 'America/Sao_Paulo', day: '2-digit', month: 'short', year: 'numeric',
    ...(allDay ? {} : { hour: '2-digit', minute: '2-digit' }) }).format(new Date(value));
}

export interface FeedState { feed: SiteFeed | null; error: boolean; pending: boolean }
const INITIAL: FeedState = { feed: null, error: false, pending: false };
/** One subscription lifecycle for all four slots. No persistence can revive a withdrawal. */
export function createSiteContentStore(fetcher: typeof fetch = (...args) => fetch(...args)) {
  let state = INITIAL, generation = 0, timer: ReturnType<typeof setInterval> | null = null;
  let controller: AbortController | null = null, pending: Promise<boolean> | null = null;
  const listeners = new Set<() => void>();
  const visible = () => !document.hidden;
  const emit = (next: FeedState) => { state = next; listeners.forEach(notify => notify()); };
  const refresh = (): Promise<boolean> => {
    if (pending) return pending;
    if (!listeners.size || !visible()) return Promise.resolve(false);
    const current = generation, request = new AbortController(); controller = request;
    const deadline = setTimeout(() => request.abort(), 15000);
    pending = Promise.resolve().then(async () => {
      try {
        const response = await fetcher(SITE_CONTENT_URL, { cache: 'no-store', credentials: 'omit', mode: 'cors', redirect: 'error', referrerPolicy: 'no-referrer', headers: { Accept: 'application/json' }, signal: request.signal });
        if (!response.ok) throw new Error('Public feed unavailable');
        const feed = validateSiteFeed(await response.json());
        if (current !== generation || !listeners.size || request.signal.aborted) return false;
        emit({ feed, error: false, pending: false }); return true;
      } catch {
        if (current === generation && listeners.size) emit({ ...state, error: true, pending: false });
        return false;
      } finally {
        clearTimeout(deadline);
        if (current === generation) { pending = null; controller = null; }
      }
    });
    emit({ ...state, pending: true });
    return pending;
  };
  const poll = () => { if (timer !== null) clearInterval(timer); timer = visible() && listeners.size ? setInterval(() => { if (visible()) void refresh(); }, 60000) : null; };
  const onVisibility = () => { poll(); if (visible()) void refresh(); };
  const onFocus = () => { if (visible()) void refresh(); };
  const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) onVisibility(); };
  const onPageHide = () => {
    generation++; controller?.abort(); controller = null; pending = null;
    if (timer !== null) clearInterval(timer); timer = null;
    if (state.pending) emit({ ...state, pending: false });
  };
  return {
    getSnapshot: () => state,
    getServerSnapshot: () => INITIAL,
    refresh,
    subscribe(listener: () => void) {
      const first = listeners.size === 0; listeners.add(listener);
      if (first) {
        document.addEventListener('visibilitychange', onVisibility); window.addEventListener('focus', onFocus);
        window.addEventListener('pageshow', onPageShow); window.addEventListener('pagehide', onPageHide);
        poll(); void refresh();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size) return;
        onPageHide(); state = INITIAL;
        document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('focus', onFocus);
        window.removeEventListener('pageshow', onPageShow); window.removeEventListener('pagehide', onPageHide);
      };
    },
  };
}
export type SiteContentStore = ReturnType<typeof createSiteContentStore>;
export const siteContentStore = createSiteContentStore();
