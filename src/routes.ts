export type SitePage = 'home' | 'members' | 'profile';
export type SiteRoute = { page: SitePage; english: boolean };

export const routes: Record<string, SiteRoute> = {
  'index.html': { page: 'home', english: false },
  'index-en.html': { page: 'home', english: true },
  'membros.html': { page: 'members', english: false },
  'membros-en.html': { page: 'members', english: true },
  'membro.html': { page: 'profile', english: false },
  'membro-en.html': { page: 'profile', english: true },
};

export function routeForPath(pathname: string): SiteRoute {
  return routes[pathname.split('/').pop() || 'index.html'] || routes['index.html'];
}

export function languageTarget(route: SiteRoute, english: boolean, search: string, hash: string): string {
  const stem = route.page === 'members' ? 'membros' : route.page === 'profile' ? 'membro' : 'index';
  return `${stem}${english ? '-en' : ''}.html${route.page === 'profile' ? search : ''}${hash}`;
}

/** Explicit language URLs win. Stored preference applies only to the entry root. */
export function preferredRootTarget(pathname: string, stored: string | null, languages: readonly string[], hash: string): string | null {
  if (!pathname.endsWith('/')) return null;
  const locale = stored || languages.find(language => /^(pt|en)(-|$)/i.test(language)) || 'pt';
  return locale.toLowerCase().startsWith('en') ? `index-en.html${hash}` : null;
}
