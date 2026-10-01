import { describe, expect, it } from 'vitest';
import { languageTarget, preferredRootTarget, routeForPath, routes } from '../src/routes';

describe('existing public addresses', () => {
  it('preserves all six direct entry points and the root home', () => {
    expect(Object.keys(routes)).toHaveLength(6);
    expect(routeForPath('/')).toEqual({ page: 'home', english: false });
    expect(routeForPath('/membros-en.html')).toEqual({ page: 'members', english: true });
    expect(routeForPath('/membro.html')).toEqual({ page: 'profile', english: false });
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
