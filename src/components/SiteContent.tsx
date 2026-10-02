import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from 'react';
import { formattedDate, itemsFor, siteContentStore, stateLabel, type ContentKind, type SiteContentStore, type SiteEntry } from '../lib/site-content';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const CLASSES: Record<ContentKind, string> = {
  PROJECT: 'bg-dark p-8 rounded-xl shadow-2xl border',
  COMPETITION: 'bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl shadow-2xl border border-secondary',
  PARTNERSHIP: 'sponsor-item min-w-[300px] rounded-lg border border-secondary p-5 text-center',
  EVENT: 'bg-gray-700 p-4 rounded-lg border-l-4 border-secondary',
};
const EMPTY: Record<ContentKind, [string, string]> = {
  PROJECT: ['Nenhum projeto publicado.', 'No published projects.'], COMPETITION: ['Nenhuma competição publicada.', 'No published competitions.'],
  PARTNERSHIP: ['Nenhuma parceria publicada.', 'No published partnerships.'], EVENT: ['Nenhum evento publicado.', 'No published events.'],
};
function PublicImage({ item }: { item: SiteEntry }) {
  const [failed, setFailed] = useState(false);
  return item.imageUrl && !failed ? <img className="site-entry-media" src={item.imageUrl} alt={item.imageAlt} loading="lazy" decoding="async" referrerPolicy="no-referrer" width={640} height={360} onError={() => setFailed(true)} /> : null;
}
function EntryDetails({ item, english }: { item: SiteEntry; english: boolean }) {
  const first = item.startsAt && formattedDate(item.startsAt, item.allDay, english);
  const finalDate = item.endsAt && (item.allDay ? new Date(Date.parse(item.endsAt) - 1000).toISOString() : item.endsAt);
  const last = finalDate && formattedDate(finalDate, item.allDay, english);
  return <div className="site-entry-details">
    {first && <time className="site-entry-time" dateTime={item.startsAt!}>{first}{last && last !== first ? `${english ? ' to ' : ' até '}${last}` : ''}{item.allDay ? (english ? ' · All day' : ' · Dia inteiro') : ''}</time>}
    {item.location && <p className="site-entry-location">{item.location}</p>}
    {item.url && <a className="site-entry-link rb-specular" href={item.url} rel="noopener noreferrer">{english ? 'View details' : 'Ver detalhes'}</a>}
  </div>;
}
function EntryCard({ item, english }: { item: SiteEntry; english: boolean }) {
  const title = english && item.titleEn || item.title, summary = english && item.summaryEn || item.summary;
  const meta = stateLabel(item, english) + (item.featured ? (english ? ' · Featured' : ' · Destaque') : '');
  const [flipped, setFlipped] = useState(false), back = useRef<HTMLDivElement>(null), toggle = useRef<HTMLButtonElement>(null);
  const grip = useRef<{ x: number; y: number; id: number } | null>(null);
  const keyboardFocus = useRef(false);
  useEffect(() => {
    if (flipped && keyboardFocus.current) back.current?.focus({ preventScroll: true });
    keyboardFocus.current = false;
  }, [flipped]);
  const detailsId = `project-details-${item.id}`;
  const resetTilt = (card: HTMLElement) => { card.style.setProperty('--flip-x', '0deg'); card.style.setProperty('--flip-y', '0deg'); };
  const tilt = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || document.documentElement.classList.contains('rb-motion-disabled') || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const card = event.currentTarget, rect = card.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / Math.max(rect.width, 1))), y = Math.min(1, Math.max(0, (event.clientY - rect.top) / Math.max(rect.height, 1)));
    card.style.setProperty('--flip-x', `${(.5 - y) * 6}deg`); card.style.setProperty('--flip-y', `${(x - .5) * 6}deg`);
    card.style.setProperty('--glare-x', `${x * 100}%`); card.style.setProperty('--glare-y', `${y * 100}%`);
  };
  // The two faces belong to React; visual effects never move their children.
  if (item.kind === 'PROJECT') return <article className={`site-entry ${CLASSES.PROJECT} rb-flip${flipped ? ' is-flipped' : ''}`} style={{ minHeight: item.imageUrl ? 460 : 350 }} data-kind={item.kind} data-entry-id={item.id}
    onKeyDown={event => { if (event.key === 'Escape' && flipped) { setFlipped(false); toggle.current?.focus(); } }}
    onPointerDown={event => { if (event.button === 0 && !(event.target as HTMLElement).closest('button,a')) grip.current = { x: event.clientX, y: event.clientY, id: event.pointerId }; }}
    onPointerUp={event => { const start = grip.current; if (start?.id === event.pointerId && Math.abs(event.clientX - start.x) > 45 && Math.abs(event.clientX - start.x) > Math.abs(event.clientY - start.y) * 1.5) setFlipped(value => !value); grip.current = null; }}
    onPointerCancel={() => { grip.current = null; }} onPointerLeave={event => { grip.current = null; resetTilt(event.currentTarget); }} onPointerMove={tilt}>
    <div className="rb-flip-rotor">
      <div className="rb-flip-front" aria-hidden={flipped} inert={flipped}>
        <PublicImage item={item} key={item.imageUrl} /><div className="site-entry-body"><h3 className="site-entry-title">{title}</h3><p className="site-entry-meta">{meta}</p></div>
      </div>
      <div className="rb-flip-back" id={detailsId} ref={back} tabIndex={0} aria-hidden={!flipped} inert={!flipped}>
        <p className="rb-flip-back-title">{title}</p><p className="site-entry-summary">{summary}</p><EntryDetails item={item} english={english} />
      </div>
    </div>
    <button ref={toggle} type="button" className="rb-flip-toggle rb-specular" aria-controls={detailsId} aria-expanded={flipped}
      aria-label={`${flipped ? (english ? 'Back to' : 'Voltar a') : (english ? 'Read about' : 'Ler sobre')} ${title}`}
      onClick={event => { keyboardFocus.current = !flipped && event.detail === 0; setFlipped(value => !value); }}>
      {flipped ? (english ? 'Back ↶' : 'Voltar ↶') : (english ? 'About the project ↗' : 'Sobre o projeto ↗')}
    </button>
  </article>;
  const badgeDate = item.startsAt && new Date(item.startsAt), timeZone = item.allDay ? 'UTC' : 'America/Sao_Paulo';
  return <article className={`site-entry ${CLASSES[item.kind]}`} data-kind={item.kind} data-entry-id={item.id}>
    {item.kind === 'EVENT' && badgeDate && <div className="site-entry-date-badge" aria-hidden="true">
      <span className="site-entry-day">{new Intl.DateTimeFormat(english ? 'en-GB' : 'pt-BR', { timeZone, day: '2-digit' }).format(badgeDate)}</span>
      <span className="site-entry-month">{new Intl.DateTimeFormat(english ? 'en-GB' : 'pt-BR', { timeZone, month: 'short' }).format(badgeDate)}</span>
    </div>}
    {item.kind !== 'EVENT' && <PublicImage item={item} key={item.imageUrl} />}
    <div className="site-entry-body">
      {item.kind === 'EVENT' && <PublicImage item={item} key={item.imageUrl} />}
      <h3 className="site-entry-title">{title}</h3><p className="site-entry-summary">{summary}</p><p className="site-entry-meta">{meta}</p><EntryDetails item={item} english={english} />
    </div>
  </article>;
}
export interface SiteContentProps { kind: ContentKind; english: boolean; className?: string; store?: SiteContentStore }
export function SiteContent({ kind, english, className, store = siteContentStore }: SiteContentProps) {
  const { feed, error, pending } = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const root = useRef<HTMLDivElement>(null), focus = useRef<HTMLElement | null>(null);
  const items = feed ? itemsFor(feed, kind) : [];
  const state = error ? 'error' : !feed ? 'loading' : !feed.initialized ? 'uninitialized' : items.length ? 'ready' : 'empty';
  useBrowserLayoutEffect(() => {
    // Stable keys preserve ordinary updates; a removed focused publication yields
    // to a remaining control instead of silently dropping focus to the body.
    if (focus.current && !focus.current.isConnected) {
      const next = [...(root.current?.querySelectorAll<HTMLElement>('button,a') || [])].find(node => !node.closest('[inert]')) || root.current;
      next?.focus({ preventScroll: true }); focus.current = next;
    }
  });
  const message = error ? (feed ? (english ? 'Connection unavailable. Displaying the last received publication.' : 'Conexão indisponível. Exibindo a última publicação recebida.')
    : (english ? 'Published content is unavailable.' : 'Não foi possível carregar o conteúdo publicado.'))
    : state === 'loading' ? (english ? 'Loading published content…' : 'Carregando conteúdo publicado…')
      : state === 'uninitialized' ? (english ? 'Content is awaiting publication.' : 'Conteúdo aguardando publicação.') : EMPTY[kind][english ? 1 : 0];
  return <div ref={root} className={className} data-public-content={kind} data-state={state} aria-busy={pending} tabIndex={-1}
    onFocusCapture={event => { focus.current = event.target as HTMLElement; }} onBlurCapture={event => { if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget as Node)) focus.current = null; }}>
    {items.map(item => <EntryCard key={item.id} item={item} english={english} />)}
    {state !== 'ready' && <div className="site-content-state" role="status" aria-live="polite"><p className="site-content-message">{message}</p>
      {error && <button type="button" className="site-content-retry rb-specular" onClick={() => { void store.refresh(); }}>{english ? 'Try again' : 'Tentar novamente'}</button>}
    </div>}
  </div>;
}
export default SiteContent;
