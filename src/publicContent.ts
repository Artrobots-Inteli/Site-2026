import type { ContentKind, Entry, Snapshot } from './model';
export const origin = 'https://artrolove.artrobots.tech';
export const kinds: ContentKind[] = ['PROJECT', 'COMPETITION', 'PARTNERSHIP', 'EVENT'];
export type FeedState = { state: 'loading' | 'ready' | 'stale' | 'unavailable' | 'uninitialized'; snapshot: Snapshot | null };
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const date = (value: unknown) => value === null || typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
const nullableString = (value: unknown) => value === null || typeof value === 'string';

export function publicUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value), host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password || url.port && url.port !== '443'
      || !host.includes('.') || host.endsWith('.localhost') || host.endsWith('.local')
      || host.endsWith('.internal') || host === 'localhost' || host.includes(':')
      || /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) return null;
    return url.href;
  } catch { return null; }
}
export function publicImage(value: unknown): string | null {
  const safe = publicUrl(value);
  if (!safe) return null;
  const url = new URL(safe);
  if (url.origin === origin && /^\/api\/public\/site-content\/photos\/[a-zA-Z0-9-]{1,100}$/.test(url.pathname) && !url.search) return safe;
  if (url.origin === 'https://artrobots.tech' && /^\/assets\/[a-zA-Z0-9%()._ /-]+$/.test(url.pathname) && !url.search) return safe;
  return null;
}
export function validate(data: unknown): Snapshot {
  if (!object(data) || data.schemaVersion !== 1 || typeof data.initialized !== 'boolean' || !date(data.updatedAt)
    || !Array.isArray(data.items) || data.items.length > 500) throw new Error('Invalid public content');
  const ids = new Set<string>();
  for (const entry of data.items) {
    if (!object(entry) || typeof entry.id !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(entry.id) || ids.has(entry.id)
      || !kinds.includes(entry.kind as ContentKind)
      || typeof entry.title !== 'string' || !entry.title.trim() || entry.title.length > 160
      || typeof entry.summary !== 'string' || entry.summary.length > 5000
      || typeof entry.imageAlt !== 'string' || typeof entry.location !== 'string' || entry.location.length > 300
      || !nullableString(entry.imageUrl) || !nullableString(entry.url)
      || typeof entry.featured !== 'boolean' || typeof entry.order !== 'number' || !Number.isFinite(entry.order)
      || !['ACTIVE', 'COMPLETED'].includes(entry.status as string) || !date(entry.startsAt) || !date(entry.endsAt)
      || entry.titleEn != null && (typeof entry.titleEn !== 'string' || entry.titleEn.length > 160)
      || entry.summaryEn != null && (typeof entry.summaryEn !== 'string' || entry.summaryEn.length > 5000)
      || entry.allDay != null && typeof entry.allDay !== 'boolean') throw new Error('Invalid public item');
    ids.add(entry.id);
  }
  return { schemaVersion: 1, initialized: data.initialized, updatedAt: data.updatedAt as string | null, items: data.items as Entry[] };
}
export function itemsFor(snapshot: Snapshot, kind: ContentKind): Entry[] {
  return snapshot.items.filter((entry) => entry.kind === kind).sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order || a.title.localeCompare(b.title));
}
export function transition(previous: FeedState, data: unknown, failed = false): FeedState {
  if (failed) return { ...previous, state: previous.snapshot ? 'stale' : 'unavailable' };
  const snapshot = validate(data);
  if (!snapshot.initialized) return { ...previous, state: previous.snapshot ? 'stale' : 'uninitialized' };
  return { state: 'ready', snapshot };
}
