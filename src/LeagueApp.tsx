import { Component, lazy, Suspense, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'motion/react';
import ContentPanel from './ContentPanel';
import { usePublicContent } from './usePublicContent';
import { routes, viewForHash, type Area, type ContentKind, type View } from './model';
const WorldScene = lazy(() => import('./worldScene'));
type ThemeApi = { read: () => string; apply: (mode: string) => void };
const themeApi = (window as unknown as { ArtrobotsTheme: ThemeApi }).ArtrobotsTheme;
const areas: Area[] = ['PROJECT', 'COMPETITION', 'KNOWLEDGE', 'MEMBERS', 'PARTNERSHIP', 'EVENT'];
const symbols: Record<Area, string> = { PROJECT: '⬡', COMPETITION: '⚑', KNOWLEDGE: '⌘', MEMBERS: '◉', PARTNERSHIP: '◇', EVENT: '▦' };
function Portal(props: ComponentProps<typeof motion.section>) {
  const present = useIsPresent();
  return <motion.section {...props} inert={!present} aria-hidden={!present || undefined} style={{ ...props.style, pointerEvents: present ? 'auto' : 'none' }} />;
}
function Panel(props: ComponentProps<typeof motion.aside>) {
  const present = useIsPresent();
  return <motion.aside {...props} inert={!present} aria-hidden={!present || undefined} style={{ ...props.style, pointerEvents: present ? 'auto' : 'none' }} />;
}
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export default function LeagueApp() {
  const english = document.documentElement.lang.startsWith('en');
  const t = (pt: string, en: string) => english ? en : pt;
  const titles: Record<Area, string> = { PROJECT: t('Projetos', 'Projects'), COMPETITION: t('Competições', 'Competitions'), KNOWLEDGE: t('Conhecimento', 'Knowledge'), MEMBERS: t('Membros', 'Members'), PARTNERSHIP: t('Parcerias', 'Partners'), EVENT: t('Calendário', 'Calendar') };
  const [view, setView] = useState<View>(() => viewForHash(location.hash));
  const [sceneEnabled, setSceneEnabled] = useState(() => viewForHash(location.hash).page !== 'portal');
  const [theme, setTheme] = useState(() => themeApi?.read() || 'dark');
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const reduce = !!useReducedMotion();
  const lastArea = useRef<Area | null>(null);
  const shouldFocus = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const enter = useRef<HTMLButtonElement>(null);
  const nodeRefs = useRef<Partial<Record<Area, HTMLButtonElement | null>>>({});
  const feed = usePublicContent();
  const navigate = (area: Area | null = null, portal = false) => {
    shouldFocus.current = true;
    if (area) lastArea.current = area;
    const next: View = { page: portal ? 'portal' : area ? 'area' : 'hub', area: portal ? null : area };
    history.pushState(null, '', `#${portal ? 'inicio' : area ? routes[area] : 'liga'}`);
    setView(next);
  };
  useEffect(() => {
    const update = () => { shouldFocus.current = true; setView(viewForHash(location.hash)); };
    const visibility = () => setHidden(document.hidden);
    const onTheme = () => setTheme(themeApi?.read() || 'dark');
    window.addEventListener('popstate', update); window.addEventListener('hashchange', update);
    document.addEventListener('visibilitychange', visibility); window.addEventListener('artrobots:theme', onTheme);
    return () => { window.removeEventListener('popstate', update); window.removeEventListener('hashchange', update); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('artrobots:theme', onTheme); };
  }, []);
  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    if (view.page === 'area') heading.current?.focus();
    else if (view.page === 'hub') nodeRefs.current[lastArea.current || 'PROJECT']?.focus();
    else enter.current?.focus({ preventScroll: true });
  }, [view.page, view.area]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && view.page === 'area') navigate(); };
    document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape);
  }, [view.page]);
  const selectTheme = (value: string) => { try { localStorage.setItem('artrobots_theme', value); } catch { /* retain preference in current tab */ } themeApi?.apply(value); setTheme(value); };
  const transition = reduce ? { duration: 0 } : { duration: .55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
  const feedStatus = feed.state === 'ready' ? t('Publicado pelo marketing da Artrobots', 'Published by Artrobots marketing') : feed.state === 'loading' ? t('Atualizando publicação…', 'Updating published content…') : feed.state === 'stale' ? t('Conexão indisponível. Última versão disponível.', 'Connection unavailable. Last available version.') : t('Publicação indisponível no momento.', 'Publishing is currently unavailable.');
  return <div className="league-shell" data-view={view.page}>
    <header className="league-navigation"><button className="league-brand" onClick={() => navigate(null, true)} aria-label={t('Artrobots, entrada da liga', 'Artrobots, league entrance')}><img src="/assets/logo_circulo.png" alt="" width="36" height="36" /><span>Artrobots</span></button><div className="league-navigation-tools"><a href="https://artrolove.artrobots.tech">ArtroLove ↗</a><div className="league-language"><a href={`index.html${location.hash}`} aria-label="Português" aria-current={!english ? 'page' : undefined}>PT</a><a href={`index-en.html${location.hash}`} aria-label="English" aria-current={english ? 'page' : undefined}>EN</a></div><select aria-label={t('Tema de cor', 'Colour theme')} value={theme} onChange={(event) => selectTheme(event.target.value)}><option value="dark">{t('Noturno', 'Dark')}</option><option value="light">{t('Claro', 'Light')}</option><option value="system">{t('Sistema', 'System')}</option></select><button className="league-motion-toggle" onClick={() => setPaused((value) => !value)} disabled={reduce} aria-label={reduce ? t('Cena estática', 'Static scene') : paused ? t('Continuar movimento', 'Resume motion') : t('Pausar movimento', 'Pause motion')} title={reduce ? t('Cena estática', 'Static scene') : paused ? t('Continuar movimento', 'Resume motion') : t('Pausar movimento', 'Pause motion')} aria-pressed={paused || reduce}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{paused && !reduce ? <path d="m8 5 11 7-11 7z" /> : <path d="M8 5v14M16 5v14" />}</svg></button></div></header>
    <AnimatePresence initial={false}>
      {view.page === 'portal' && <Portal key="portal" className="league-portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: reduce ? 1 : 1.025 }} transition={transition} aria-labelledby="league-title"><nav className="league-portal-nav" aria-label={t('Acessos diretos ao clube', 'Direct access to the club')}>{(['PROJECT', 'COMPETITION', 'PARTNERSHIP', 'EVENT', 'MEMBERS'] as Area[]).map((area) => <button key={area} onClick={() => navigate(area)}>{titles[area]}</button>)}</nav><div className="league-portal-photo"><img src="/assets/artrobots-grupo-2026.webp" alt={t('Membros da Artrobots no Inteli', 'Artrobots members at Inteli')} fetchPriority="high" onLoad={() => setSceneEnabled(true)} /></div><div className="league-portal-copy"><span className="league-kicker">INTELI / {t('CLUBE DE ROBÓTICA', 'ROBOTICS CLUB')}</span><h1 id="league-title">Artrobots<span>.</span></h1><p>{t('Projetos, pessoas e conhecimento do clube.', 'The club’s projects, people and knowledge.')}</p><button ref={enter} className="league-enter" onClick={() => navigate()}>{t('Explorar a liga', 'Explore the league')}<span aria-hidden="true">↗</span></button></div><span className="league-photo-caption">ARTROBOTS / INTELI</span></Portal>}
    </AnimatePresence>
      <div className="league-scene" data-stage={view.page}>{(!sceneReady || sceneFailed) && <img className="league-scene-fallback" src="/assets/artrolove-spider-scene.webp" alt="" />}{(sceneEnabled || view.page !== 'portal') && !sceneFailed && <SceneBoundary onFailure={() => setSceneFailed(true)}><Suspense fallback={null}><WorldScene stage={view.page} activeArea={view.area} onNavigate={(area) => navigate(area)} paused={paused || hidden} reducedMotion={reduce} onReady={() => setSceneReady(true)} onFallback={() => setSceneFailed(true)} onLayout={(nodes) => { if (matchMedia('(max-width: 767px)').matches) return; for (const point of nodes) { const node = nodeRefs.current[point.area]; if (!node || !Number.isFinite(point.x) || !Number.isFinite(point.y)) continue; node.style.left = `${Math.max(13, Math.min(87, point.x * 100))}%`; node.style.top = `${Math.max(24, Math.min(81, point.y * 100))}%`; } }} /></Suspense></SceneBoundary>}</div>
    <main className="league-map" aria-label={t('Mapa da liga', 'League map')} aria-hidden={view.page === 'portal'} inert={view.page === 'portal'}>
      <div className="league-context"><span className="league-kicker">ARTROBOTS / {t('LIGA', 'LEAGUE')}</span><h2>{view.area ? titles[view.area] : t('Explore o clube', 'Explore the club')}</h2><p>{view.area ? t('Conteúdo e referências da área.', 'Content and references for this area.') : t('Escolha uma área no mapa.', 'Choose an area on the map.')}</p></div>
      {view.page === 'hub' && <nav className="league-nodes" aria-label={t('Áreas da liga', 'League areas')}>{areas.map((area) => <motion.button ref={(element) => { nodeRefs.current[area] = element; }} key={area} className="league-node" onClick={() => navigate(area)} aria-controls="league-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...transition, delay: reduce ? 0 : areas.indexOf(area) * .045 }}><span className="league-node-symbol" aria-hidden="true">{symbols[area]}</span><span>{titles[area]}</span><span className="league-node-arrow" aria-hidden="true">↗</span></motion.button>)}</nav>}
      <div className="league-map-tools"><button onClick={() => navigate(null, true)}>{t('Entrada', 'Entrance')}</button></div>
      <AnimatePresence>
        {view.page === 'area' && view.area && <Panel key={view.area} id="league-panel" className="league-panel" aria-labelledby="league-panel-title" initial={{ opacity: 0, x: reduce ? 0 : 35 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduce ? 0 : 20 }} transition={transition}><header className="league-panel-header"><button className="league-back" onClick={() => navigate()}>← {t('Voltar à liga', 'Back to the league')}</button><h2 id="league-panel-title" ref={heading} tabIndex={-1}>{titles[view.area]}</h2></header><div className="league-panel-scroll">
          {view.area === 'KNOWLEDGE' ? <><div className="league-resource"><span className="league-resource-icon" aria-hidden="true">⌘</span><h3>{t('Base técnica do clube', 'The club’s technical knowledge')}</h3><p>{t('Documentação, discussões e registros dos projetos na ArtroLove.', 'Documentation, discussions and project records in ArtroLove.')}</p><a className="league-action" href="https://artrolove.artrobots.tech/documentacao">{t('Abrir documentação', 'Open documentation')} ↗</a><span className="league-resource-note">{t('Acesso para membros', 'Members only')}</span></div><div className="league-resource"><h3>{t('Código e projetos', 'Code and projects')}</h3><a className="league-action" href="https://github.com/Artrobots-Inteli">GitHub Artrobots ↗</a></div></> : view.area === 'MEMBERS' ? <div className="league-resource"><img src="/assets/artrobots-grupo-2026.webp" alt={t('Membros da Artrobots no Inteli', 'Artrobots members at Inteli')} /><h3>{t('Perfis e equipes', 'Profiles and teams')}</h3><p>{t('Membros, projetos e histórico de participação no clube.', 'Members, projects and participation history in the club.')}</p><a className="league-action" href={english ? 'membros-en.html' : 'membros.html'}>{t('Conhecer os membros', 'Meet the members')} ↗</a><a className="league-action league-action-secondary" href="https://artrolove.artrobots.tech">{t('Entrar na comunidade', 'Open the community')} ↗</a><a className="league-action league-action-secondary" href="https://instagram.com/artrobots.inteli">Instagram Artrobots ↗</a></div> : <><ContentPanel kind={view.area as ContentKind} snapshot={feed.snapshot} english={english} loading={feed.state === 'loading'} /><div className="league-sync"><p role="status">{feedStatus}</p>{feed.state !== 'ready' && feed.state !== 'loading' && <button onClick={() => { void feed.refresh(); }}>{t('Tentar novamente', 'Try again')}</button>}</div></>}
        </div></Panel>}
      </AnimatePresence>
    </main>
  </div>;
}
