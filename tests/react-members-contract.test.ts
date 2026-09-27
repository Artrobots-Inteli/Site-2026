import { describe, expect, it } from 'vitest';
import { validateMembersFeed, profileState } from '../src/lib/public-members';
import { legacyTeamsEn, legacyTeamsPt } from '../src/data/legacy-members';
import { profileCardPointer } from '../src/components/MemberCard';

const member = () => ({ id: 'public-1', name: 'Pessoa aprovada', position: 'Engenharia', description: 'Robótica',
  photoPath: '/api/public/members/public-1/photo', profilePath: '/membros/public-1', siteKey: 'kaian-moura', directoryGroup: 'projects',
  projects: [{ id: 'published-project', title: 'Robô', titleEn: 'Robot', url: 'https://artrobots.tech/#projects', status: 'ACTIVE', membership: 'CURRENT' }] });
const feed = () => ({ members: [member()], linkedSiteKeys: ['kaian-moura'] });
describe('public member contract and privacy', () => {
  it('projects only the public allowlist, including explicit public project relations', () => {
    const input = feed();
    Object.assign(input.members[0], { email: 'private@example.test', userId: 'private-user', notes: 'private note', roster: { matricula: 'private' } });
    Object.assign(input.members[0].projects[0], { sourceId: 'private-project', role: 'private-role', notes: 'private-note' });
    const result = validateMembersFeed(input);
    expect(result.members[0].projects[0].id).toBe('published-project');
    expect(JSON.stringify(result)).not.toContain('private');
    expect(profileState(result, 'kaian-moura').kind).toBe('connected');
  });
  it('accepts the original additive feed without projects', () => {
    const value: Record<string, unknown> = member(); delete value.projects;
    expect(validateMembersFeed({ members: [value], linkedSiteKeys: ['kaian-moura'] }).members[0].projects).toEqual([]);
  });
  it('retains tombstones independently from visible members', () => {
    const result = validateMembersFeed({ members: [], linkedSiteKeys: ['kaian-moura'] });
    expect(profileState(result, 'kaian-moura').kind).toBe('withdrawn');
    expect(profileState(result, 'mell-aguiar').kind).toBe('legacy');
  });
  it.each([
    (value: ReturnType<typeof feed>) => { value.members.push(member()); },
    (value: ReturnType<typeof feed>) => { value.linkedSiteKeys = []; },
    (value: ReturnType<typeof feed>) => { value.linkedSiteKeys.push('kaian-moura'); },
    (value: ReturnType<typeof feed>) => { value.members[0].profilePath = 'https://evil.example/profile'; },
    (value: ReturnType<typeof feed>) => { value.members[0].photoPath = '/api/private/1/photo'; },
    (value: ReturnType<typeof feed>) => { value.members[0].directoryGroup = 'private'; },
    (value: ReturnType<typeof feed>) => { value.members[0].projects[0].url = 'javascript:alert(1)'; },
    (value: ReturnType<typeof feed>) => { value.members[0].projects[0].url = 'https://user:password@public.example/'; },
    (value: ReturnType<typeof feed>) => { value.members[0].projects[0].url = 'https://127.0.0.1/private'; },
    (value: ReturnType<typeof feed>) => { value.members[0].projects.push(value.members[0].projects[0]); },
    (value: ReturnType<typeof feed>) => { value.members[0].projects[0].membership = 'PENDING'; },
  ])('rejects malformed or ambiguous records (%#)', mutate => {
    const input = feed(); mutate(input); expect(() => validateMembersFeed(input)).toThrow();
  });
  it('preserves all 27 existing public cards in both languages', () => {
    expect(legacyTeamsPt.flatMap(team => team.members)).toHaveLength(27);
    expect(legacyTeamsEn.flatMap(team => team.members)).toHaveLength(27);
    expect(legacyTeamsPt.flatMap(team => team.members.map(m => m.siteKey))).toEqual(legacyTeamsEn.flatMap(team => team.members.map(m => m.siteKey)));
    for (const team of legacyTeamsPt) for (const m of team.members) expect(m.photo.startsWith('assets/')).toBe(true);
  });
  it('bounds profile card motion even when pointer is outside the card', () => {
    expect(profileCardPointer(-100, 300, { left: 0, top: 0, width: 100, height: 100 })).toEqual({ x: 0, y: 1, rx: -6, ry: -6 });
  });
});
