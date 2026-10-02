import { describe, expect, it } from 'vitest';
import corpus from '../contracts/public-https-url.cases.json';
import { normalizePublicHttpsUrl } from '../src/lib/public-https-url';
import { validateMembersFeed } from '../src/lib/public-members';
import { publicImage, publicUrl, validateSiteFeed } from '../src/lib/site-content';

function membersWithUrl(url: unknown) {
  return { members: [{ id: 'public-one', name: 'Pessoa sintética', position: 'Engenharia', description: '',
    photoPath: '/api/public/members/public-one/photo', profilePath: '/membros/public-one', siteKey: null, directoryGroup: 'projects',
    projects: [{ id: 'project-one', title: 'Projeto sintético', titleEn: 'Synthetic project', url, status: 'ACTIVE', membership: 'CURRENT' }] }], linkedSiteKeys: [] };
}
function editorialWithUrl(url: unknown) {
  return { schemaVersion: 1, initialized: true, updatedAt: null, items: [{ id: 'project-one', kind: 'PROJECT', title: 'Projeto sintético', titleEn: '',
    summary: 'Resumo público', summaryEn: '', imageUrl: null, imageAlt: '', url, featured: false, order: 0, status: 'ACTIVE', startsAt: null, endsAt: null, allDay: false, location: '' }] };
}

describe('portable public HTTPS policy', () => {
  it.each(corpus.cases)('$name', ({ input, expected }) => {
    expect(normalizePublicHttpsUrl(input)).toBe(expected);
    expect(normalizePublicHttpsUrl(normalizePublicHttpsUrl(input))).toBe(expected);
  });

  it.each(corpus.cases)('public DTO adapters preserve policy and error semantics: $name', ({ input, expected }) => {
    expect(publicUrl(input)).toBe(expected);
    expect(validateSiteFeed(editorialWithUrl(input)).items[0].url).toBe(expected);
    if (input === '') {
      expect(validateMembersFeed(membersWithUrl(input)).members[0].projects[0].url).toBe('');
    } else if (expected === null) {
      expect(() => validateMembersFeed(membersWithUrl(input))).toThrow('Invalid public link');
    } else {
      expect(validateMembersFeed(membersWithUrl(input)).members[0].projects[0].url).toBe(expected);
      // A normalized URL arriving through JSON must survive the next boundary.
      const serialized = JSON.parse(JSON.stringify(expected));
      expect(validateMembersFeed(membersWithUrl(serialized)).members[0].projects[0].url).toBe(expected);
      expect(validateSiteFeed(editorialWithUrl(serialized)).items[0].url).toBe(expected);
    }
  });

  it('preserves the image origin/path allowlist independently of navigation links', () => {
    expect(publicImage('https://artrobots.tech/assets/hockey.jpg')).toBe('https://artrobots.tech/assets/hockey.jpg');
    expect(publicImage('https://artrobots.tech/assets/solidoworks.svg')).toBe('https://artrobots.tech/assets/solidoworks.svg');
    expect(publicImage('https://artrolove.artrobots.tech/api/public/site-content/photos/photo123')).toBe('https://artrolove.artrobots.tech/api/public/site-content/photos/photo123');
    for (const input of ['https://example.com/photo.jpg', 'https://artrobots.tech:8443/assets/hockey.jpg', 'https://artrobots.tech/assets/photo.jpg?token=x',
      'https://artrobots.tech/assets/photo.jpg#section', 'https://artrolove.artrobots.tech/api/site-content/photos/photo123', 'https://artrobots.tech/assets/%00photo.jpg']) {
      expect(publicImage(input)).toBeNull();
    }
  });
});
