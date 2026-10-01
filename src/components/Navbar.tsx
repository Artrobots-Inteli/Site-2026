import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { languageTarget } from '../routes';

type NavbarProps = { english: boolean; page?: 'home' | 'members' | 'profile'; profileKey?: string | null };
const sectionLabels = [
  ['about', 'Sobre', 'About'],
  ['areas', 'Áreas', 'Areas'],
  ['projects', 'Projetos', 'Projects'],
  ['competitions', 'Competições', 'Competitions'],
  ['leadership', 'Liderança', 'Leadership'],
  ['calendar', 'Calendário', 'Calendar'],
  ['contact', 'Contato', 'Contact'],
] as const;

export function Navbar({ english, page = 'home', profileKey }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState('');
  const toggleRef = useRef<HTMLButtonElement>(null);
  const homeHref = english ? 'index-en.html' : 'index.html';
  const baseHref = page === 'home' ? '' : homeHref;
  const query = page === 'profile' && profileKey ? `?perfil=${encodeURIComponent(profileKey)}` : '';
  const membersHref = english ? 'membros-en.html' : 'membros.html';

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [open]);

  const languages = () => (
    <div className="inline-flex border border-secondary rounded-full overflow-hidden">
      {(['pt', 'en'] as const).map((language) => (
        <a key={language} href={languageTarget({ page, english }, language === 'en', query, hash)} data-lang={language} aria-label={language === 'pt' ? 'Português (Brasil)' : 'English'} hrefLang={language === 'pt' ? 'pt-BR' : 'en'} aria-current={(language === 'en') === english ? 'page' : undefined} onClick={() => { try { localStorage.setItem('artrobots_lang', language); } catch { /* Storage is optional for navigation. */ } }} className={`px-3 py-1 text-sm font-semibold transition ${(language === 'en') === english ? 'bg-secondary text-white' : 'text-gray-300 hover:bg-secondary hover:bg-opacity-20'}`}>
          {language === 'pt' ? 'PT-BR' : 'ENG'}
        </a>
      ))}
    </div>
  );
  const sections = (mobile = false) => sectionLabels.map(([id, pt, en]) => (
    <a key={id} href={`${baseHref}#${id}`} onClick={() => setOpen(false)} className={mobile ? 'block py-2 hover:text-accent' : 'hover:text-accent transition'}>{english ? en : pt}</a>
  ));

  return (
    <nav className={`bg-primary bg-opacity-90 backdrop-blur-md fixed top-0 w-full z-40 transition-all duration-300${scrolled ? ' shadow-lg' : ''}`} id="navbar" aria-label={english ? 'Main navigation' : 'Navegação principal'}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <a href={page === 'home' ? '#' : homeHref} className="flex items-center space-x-3 hover:opacity-80 transition">
            <img src="assets/logo_circulo.png" alt="Artrobots Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold text-white font-display">ARTROBOTS</span>
          </a>
          <div className="desktop-navigation hidden md:flex items-center space-x-8">
            {sections()}
            <a href={membersHref} className="bg-secondary hover:bg-purple text-white font-bold py-1.5 px-5 rounded-full transition duration-300 inline-flex items-center text-sm">
              <Icon name="users" width={14} height={14} className="mr-1.5" />{english ? 'Members' : 'Membros'}
            </a>
            <a href="https://artrolove.artrobots.tech" className="hover:text-accent transition">ArtroLove</a>
            {languages()}
          </div>
          <button type="button" ref={toggleRef} className="navigation-toggle md:hidden text-white" aria-label={open ? (english ? 'Close menu' : 'Fechar menu') : (english ? 'Open menu' : 'Abrir menu')} aria-controls="mobile-menu" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
            <Icon name="menu" />
          </button>
        </div>
        <div id="mobile-menu" hidden={!open} className={`md:hidden mt-4 pb-4 overflow-hidden transition-all duration-200 ease-out ${open ? 'opacity-100 translate-y-0 max-h-96' : 'hidden opacity-0 -translate-y-1 max-h-0'}`}>
          <a href="https://artrolove.artrobots.tech" className="block py-2 hover:text-accent">ArtroLove</a>
          {sections(true)}
          <a href={membersHref} className="mt-2 inline-flex items-center bg-secondary hover:bg-purple text-white font-bold py-2 px-5 rounded-full transition duration-300 text-sm">
            <Icon name="users" width={14} height={14} className="mr-1.5" />{english ? 'Members' : 'Membros'}
          </a>
          <div className="mt-4">{languages()}</div>
        </div>
      </div>
    </nav>
  );
}
