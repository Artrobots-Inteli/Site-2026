import { useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MembersPage } from './pages/MembersPage';
import { MemberProfilePage } from './pages/MemberProfilePage';
import { useSiteEffects } from './hooks/useSiteEffects';
import type { SiteRoute } from './routes';

export function App({ page, english }: SiteRoute) {
  const root = useRef<HTMLDivElement>(null);
  const [profileKey, setProfileKey] = useState<string | null>(null);
  const [queryReady, setQueryReady] = useState(false);
  useEffect(() => {
    setProfileKey(page === 'profile' ? new URLSearchParams(location.search).get('perfil') : null);
    setQueryReady(true);
  }, [page]);
  useSiteEffects(root, english);
  return <div ref={root} className="site-application">
    <Navbar page={page} english={english} profileKey={profileKey} />
    {page === 'home' ? <HomePage english={english} /> : page === 'members'
      ? <MembersPage english={english} /> : <MemberProfilePage english={english} profileKey={profileKey} queryReady={queryReady} />}
    <Footer english={english} />
  </div>;
}
