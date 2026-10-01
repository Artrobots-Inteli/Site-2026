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
  useEffect(() => {
    if (page === 'profile') setProfileKey(new URLSearchParams(location.search).get('perfil'));
  }, [page]);
  useSiteEffects(root, english);
  return <div ref={root} className="site-application">
    <Navbar page={page} english={english} profileKey={profileKey} />
    {page === 'home' ? <HomePage english={english} /> : page === 'members'
      ? <MembersPage english={english} /> : <MemberProfilePage english={english} />}
    <Footer english={english} />
  </div>;
}
