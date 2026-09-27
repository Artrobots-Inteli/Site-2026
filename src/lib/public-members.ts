export const directoryGroups = ['leadership', 'projects', 'community'] as const;
export type DirectoryGroup = typeof directoryGroups[number];
export interface PublicMemberProject {
  id: string; title: string; titleEn: string; url: string;
  status: 'ACTIVE' | 'COMPLETED'; membership: 'CURRENT' | 'PAST';
}
export interface PublicMember {
  id: string; name: string; position: string; description: string;
  photoPath: string; profilePath: string; siteKey: string | null;
  directoryGroup: DirectoryGroup; projects: PublicMemberProject[];
}
export interface PublicMembersFeed { members: PublicMember[]; linkedSiteKeys: string[] }
const idPattern = /^[a-zA-Z0-9-]{1,100}$/;
export const validSiteKey = (value: unknown): value is string => typeof value === 'string' && value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid public record');
  return value as Record<string, unknown>;
};
const string = (value: unknown, max: number): string => {
  if (typeof value !== 'string' || value.length > max) throw new Error('Invalid public text');
  return value;
};
const identifier = (value: unknown): string => {
  const id = string(value, 100);
  if (!idPattern.test(id)) throw new Error('Invalid public id');
  return id;
};
function publicUrl(value: unknown): string {
  const text = string(value, 2048);
  if (!text) return '';
  if (!text.startsWith('https://') || /[\s\\\u0000-\u001f]/.test(text)) throw new Error('Invalid public link');
  const url = new URL(text);
  if (url.protocol !== 'https:' || url.username || url.password || /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)
    || url.hostname.startsWith('[') || !url.hostname.includes('.')) throw new Error('Invalid public link');
  return text;
}
function parseProject(input: unknown): PublicMemberProject {
  const data = record(input);
  if (!['ACTIVE', 'COMPLETED'].includes(String(data.status)) || !['CURRENT', 'PAST'].includes(String(data.membership))
    || typeof data.status !== 'string' || typeof data.membership !== 'string') throw new Error('Invalid project relation');
  return { id: identifier(data.id), title: string(data.title, 500), titleEn: string(data.titleEn, 500), url: publicUrl(data.url),
    status: data.status as PublicMemberProject['status'], membership: data.membership as PublicMemberProject['membership'] };
}
/** Public allowlist, never forward arbitrary fields from an ingestion response to UI. */
export function validateMembersFeed(input: unknown): PublicMembersFeed {
  const data = record(input);
  if (!Array.isArray(data.members) || !Array.isArray(data.linkedSiteKeys) || data.members.length > 2000 || data.linkedSiteKeys.length > 2000) throw new Error('Invalid public feed');
  const linkedSiteKeys: string[] = [];
  const linked = new Set<string>();
  for (const key of data.linkedSiteKeys) {
    if (!validSiteKey(key) || linked.has(key)) throw new Error('Invalid linked key');
    linked.add(key); linkedSiteKeys.push(key);
  }
  const ids = new Set<string>(), assigned = new Set<string>();
  const members = data.members.map(inputMember => {
    const member = record(inputMember), id = identifier(member.id);
    if (ids.has(id) || member.photoPath !== `/api/public/members/${id}/photo` || member.profilePath !== `/membros/${id}`
      || !directoryGroups.includes(member.directoryGroup as DirectoryGroup) || !(member.siteKey === null || validSiteKey(member.siteKey))) throw new Error('Invalid public member');
    if (member.siteKey !== null) {
      if (!linked.has(member.siteKey as string) || assigned.has(member.siteKey as string)) throw new Error('Ambiguous site association');
      assigned.add(member.siteKey as string);
    }
    ids.add(id);
    // Additive compatibility with the original feed before project relations existed.
    const projectValues = member.projects === undefined ? [] : member.projects;
    if (!Array.isArray(projectValues) || projectValues.length > 500) throw new Error('Invalid projects');
    const projects = projectValues.map(parseProject);
    if (new Set(projects.map(project => project.id)).size !== projects.length) throw new Error('Duplicate project');
    return { id, name: string(member.name, 200), position: string(member.position, 500), description: string(member.description, 10000),
      photoPath: member.photoPath as string, profilePath: member.profilePath as string, siteKey: member.siteKey as string | null,
      directoryGroup: member.directoryGroup as DirectoryGroup, projects };
  });
  return { members, linkedSiteKeys };
}
export const DEFAULT_ARTROLOVE_ORIGIN = 'https://artrolove.artrobots.tech';
export function configuredMembersOrigin(): string {
  const configured = typeof document === 'undefined' ? '' : document.querySelector<HTMLMetaElement>('meta[name="artrolove-public-origin"]')?.content.trim();
  const origin = configured || DEFAULT_ARTROLOVE_ORIGIN;
  const url = new URL(origin);
  const local = typeof location !== 'undefined' && ['localhost', '127.0.0.1'].includes(location.hostname);
  if (url.origin !== origin || url.username || url.password || !(url.protocol === 'https:' || local && origin === 'http://127.0.0.1:3107')) throw new Error('Invalid member origin');
  return origin;
}
export async function loadMembersFeed(origin: string, signal: AbortSignal): Promise<PublicMembersFeed> {
  const response = await fetch(`${origin}/api/public/members`, { credentials: 'omit', cache: 'no-store', signal });
  if (!response.ok) throw new Error('Public feed unavailable');
  return validateMembersFeed(await response.json());
}
export function profileState(feed: PublicMembersFeed, key: string) {
  const member = feed.members.find(item => item.siteKey === key);
  return member ? { kind: 'connected' as const, member } : { kind: feed.linkedSiteKeys.includes(key) ? 'withdrawn' as const : 'legacy' as const };
}
