export type ContentKind = 'PROJECT' | 'COMPETITION' | 'PARTNERSHIP' | 'EVENT';
export type Area = ContentKind | 'KNOWLEDGE' | 'MEMBERS';
export type Entry = {
  id: string; kind: ContentKind; title: string; summary: string; titleEn?: string; summaryEn?: string;
  imageUrl: string | null; imageAlt: string; url: string | null; featured: boolean; order: number;
  status: 'ACTIVE' | 'COMPLETED'; startsAt: string | null; endsAt: string | null; location: string; allDay?: boolean;
};
export type Snapshot = { schemaVersion: 1; initialized: boolean; updatedAt: string | null; items: Entry[] };
export const routes: Record<Area, string> = { PROJECT: 'projetos', COMPETITION: 'competicoes', KNOWLEDGE: 'conhecimento', MEMBERS: 'membros', PARTNERSHIP: 'parcerias', EVENT: 'calendario' };
export type View = { page: 'portal' | 'hub' | 'area'; area: Area | null };
const legacyAreas: Record<string, Area> = { projects: 'PROJECT', competitions: 'COMPETITION', sponsors: 'PARTNERSHIP', calendar: 'EVENT', leadership: 'MEMBERS', contact: 'MEMBERS' };
export function viewForHash(hash: string): View {
  const value = hash.replace(/^#/, '');
  const area = legacyAreas[value] || (Object.keys(routes) as Area[]).find((key) => routes[key] === value);
  return area ? { page: 'area', area } : value === 'liga' || value === 'areas' ? { page: 'hub', area: null } : { page: 'portal', area: null };
}
export function formatDate(value: string | null, allDay: boolean, english: boolean) {
  if (!value) return english ? 'Date to be confirmed' : 'Data a confirmar';
  return new Intl.DateTimeFormat(english ? 'en-GB' : 'pt-BR', { timeZone: allDay ? 'UTC' : 'America/Sao_Paulo', day: '2-digit', month: 'short', year: 'numeric', ...(allDay ? {} : { hour: '2-digit', minute: '2-digit' }) }).format(new Date(value));
}
export function rangeLabel(entry: Entry, english: boolean) {
  const first = formatDate(entry.startsAt, !!entry.allDay, english);
  const end = entry.endsAt ? formatDate(entry.allDay ? new Date(Date.parse(entry.endsAt) - 1000).toISOString() : entry.endsAt, !!entry.allDay, english) : null;
  return end && end !== first ? `${first} ${english ? 'to' : 'até'} ${end}` : first;
}
