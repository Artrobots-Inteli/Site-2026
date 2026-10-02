import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import manifest from '../src/data/public-routes.json';
import { languageTarget, preferredRootTarget, routeForPath, routes } from '../src/routes';

describe('existing public addresses', () => {
  it('preserves all six direct entry points and the root home', () => {
    const expected = {
      'index.html': { page: 'home', english: false }, 'index-en.html': { page: 'home', english: true },
      'membros.html': { page: 'members', english: false }, 'membros-en.html': { page: 'members', english: true },
      'membro.html': { page: 'profile', english: false }, 'membro-en.html': { page: 'profile', english: true },
    };
    expect(routes).toEqual(expected);
    expect(routes).toEqual(manifest);
    for (const file of Object.keys(expected)) {
      const template = readFileSync(file, 'utf8');
      expect(template).toContain('<html lang="' + (file.endsWith('-en.html') ? 'en' : 'pt-BR') + '">');
      expect(template).toContain('src="/src/main.tsx"');
    }
    expect(routeForPath('/')).toEqual({ page: 'home', english: false });
    expect(routeForPath('/membros-en.html')).toEqual({ page: 'members', english: true });
    expect(routeForPath('/membro.html')).toEqual({ page: 'profile', english: false });
  });
  it.each(Object.entries(routes))('resolves direct entry %s and both language counterparts', (file, route) => {
    expect(routeForPath('/' + file)).toEqual(route);
    for (const english of [false, true]) {
      const target = languageTarget(route, english, '?perfil=public-one', '#history');
      expect(routeForPath('/' + target.split(/[?#]/)[0])).toEqual({ page: route.page, english });
      expect(target).toContain('#history');
      expect(target.includes('?perfil=public-one')).toBe(route.page === 'profile');
    }
  });
  it('preserves the public identity and anchor when changing language', () => {
    expect(languageTarget(routes['membro.html'], true, '?perfil=public-key', '#history')).toBe('membro-en.html?perfil=public-key#history');
    expect(languageTarget(routes['membros.html'], true, '?ignored=true', '#community')).toBe('membros-en.html#community');
  });
  it('explicit language links override preferences without redirect loops', () => {
    expect(preferredRootTarget('/membros-en.html', 'pt', ['pt-BR'], '')).toBeNull();
    expect(preferredRootTarget('/index.html', 'en', ['en-US'], '')).toBeNull();
    expect(preferredRootTarget('/', 'en', ['pt-BR'], '#projects')).toBe('index-en.html#projects');
    expect(preferredRootTarget('/', null, ['pt-BR'], '')).toBeNull();
  });
});
