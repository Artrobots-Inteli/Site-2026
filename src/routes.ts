import manifest from './data/public-routes.json';

export type SitePage = 'home' | 'members' | 'profile';
export type SiteRoute = { page: SitePage; english: boolean };

export const routes: Record<string, SiteRoute> = Object.fromEntries(Object.entries(manifest).map(([file, route]) => {
  if (!file.endsWith('.html') || !['home', 'members', 'profile'].includes(route.page) || typeof route.english !== 'boolean') throw new Error(`Invalid public route: ${file}`);
  return [file, { page: route.page as SitePage, english: route.english }];
}));

export function routeForPath(pathname: string): SiteRoute {
  return routes[pathname.split('/').pop() || 'index.html'] || routes['index.html'];
}

export function languageTarget(route: SiteRoute, english: boolean, search: string, hash: string): string {
  const file = Object.keys(routes).find(file => routes[file].page === route.page && routes[file].english === english);
  if (!file) throw new Error('Public language route missing');
  return `${file}${route.page === 'profile' ? search : ''}${hash}`;
}

/** Explicit language URLs win. Stored preference applies only to the entry root. */
export function preferredRootTarget(pathname: string, stored: string | null, languages: readonly string[], hash: string): string | null {
  if (!pathname.endsWith('/')) return null;
  const locale = stored || languages.find(language => /^(pt|en)(-|$)/i.test(language)) || 'pt';
  return locale.toLowerCase().startsWith('en') ? languageTarget(routes['index.html'], true, '', hash) : null;
}
