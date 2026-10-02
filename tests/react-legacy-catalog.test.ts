import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { legacyTeamsEn, legacyTeamsPt } from '../src/data/legacy-members';

// Baseline: published 6fb7253. Every public value and relation is included;
// the unused gridClass field is deliberately outside the content contract.
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).filter(key => key !== 'gridClass').sort().map(key => [key, canonical(record[key])]));
  }
  return value;
}

describe('published historical content compatibility', () => {
  it.each([
    ['PT', legacyTeamsPt, '51e03fabc6996729521e8ec41a96d1f83cc47dab139a0e1bbe390b8c4c239313'],
    ['EN', legacyTeamsEn, '43bce2c837213ae3fb73d9a42299e24586760d4d85346b63839e830b3395ea86'],
  ] as const)('preserves every localized public value, relation and order in %s', (_language, teams, expected) => {
    expect(createHash('sha256').update(JSON.stringify(canonical(teams))).digest('hex')).toBe(expected);
  });

  it('preserves the 27 relationships and their invariant identity fields across languages', () => {
    const rows = [legacyTeamsPt, legacyTeamsEn].map(teams => teams.flatMap(team => team.members));
    expect(rows[0]).toHaveLength(27);
    expect(rows[1]).toHaveLength(27);
    const identities = rows.map(members => members.map(({ siteKey, name, photo, icon, captain }) => ({ siteKey, name, photo, icon, captain })));
    expect(identities[0]).toEqual(identities[1]);
    expect(legacyTeamsPt.map(team => team.id)).toEqual(['diretoria', 'marketing', 'lugo-bots', 'hockey', 'seguidor-de-linha', 'estoura-balao']);
    expect(legacyTeamsEn.map(team => team.id)).toEqual(['board', 'marketing', 'lugo-bots', 'hockey', 'line-follower', 'balloon-buster']);
  });
});
