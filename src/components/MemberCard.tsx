import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Icon as MemberIcon } from './Icon';
export { Icon as MemberIcon } from './Icon';
import type { LegacyMember } from '../data/legacy-members';
import { memberProfileHref, type PublicMember, type PublicMemberProject } from '../lib/public-members';

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
type Pointer = { x: number; y: number; rx: number; ry: number };
export function profileCardPointer(clientX: number, clientY: number, rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>): Pointer {
  const x = clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1);
  const y = clamp((clientY - rect.top) / Math.max(1, rect.height), 0, 1);
  return { x, y, rx: clamp((.5 - y) * 12, -6, 6), ry: clamp((x - .5) * 12, -6, 6) };
}
/** React lifecycle adaptation of the existing React Bits ProfileCard effect.
 * Attribution and source license are preserved in THIRD_PARTY_NOTICES.md.
 */
export function useProfileCard<T extends HTMLElement = HTMLAnchorElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const card = ref.current;
    if (!card || !window.matchMedia) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const forced = window.matchMedia('(forced-colors: active)');
    const center = (): Pointer => ({ x: .5, y: .5, rx: 0, ry: 0 });
    let current = center(), target = center(), raf = 0, previous = 0, hovered = false, focused = false, disposed = false;
    const allowed = () => !disposed && !document.hidden && !reduced.matches && fine.matches && !forced.matches
      && !document.documentElement.classList.contains('rb-motion-disabled') && card.isConnected;
    const apply = () => {
      for (const [key, value] of Object.entries({ 'pointer-x': `${current.x * 100}%`, 'pointer-y': `${current.y * 100}%`,
        'background-x': `${35 + current.x * 30}%`, 'background-y': `${35 + current.y * 30}%`,
        'rotate-x': `${current.rx}deg`, 'rotate-y': `${current.ry}deg` })) card.style.setProperty(`--mpc-${key}`, value);
      card.dataset.profileCardActive = String((hovered || focused) && !document.hidden);
    };
    const reset = () => { cancelAnimationFrame(raf); raf = previous = 0; hovered = false; current = center(); target = center(); apply(); };
    const step = (time: number) => {
      raf = 0;
      if (!allowed()) { reset(); return; }
      const seconds = previous ? clamp((time - previous) / 1000, 0, .05) : 1 / 60;
      previous = time;
      const easing = 1 - Math.exp(-seconds / .09);
      let delta = 0;
      for (const key of ['x', 'y', 'rx', 'ry'] as const) {
        current[key] += (target[key] - current[key]) * easing;
        delta = Math.max(delta, Math.abs(target[key] - current[key]));
      }
      if (delta < .005) current = { ...target };
      apply();
      if (delta >= .005) raf = requestAnimationFrame(step); else previous = 0;
    };
    const animate = () => { if (!allowed()) reset(); else if (!raf) raf = requestAnimationFrame(step); };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !allowed()) return;
      hovered = true; target = profileCardPointer(event.clientX, event.clientY, card.getBoundingClientRect()); apply(); animate();
    };
    const leave = () => { hovered = false; target = center(); apply(); animate(); };
    const focus = () => { focused = true; apply(); };
    const blur = () => { focused = false; apply(); if (!hovered) leave(); };
    card.addEventListener('pointerenter', pointer); card.addEventListener('pointermove', pointer);
    card.addEventListener('pointerleave', leave); card.addEventListener('pointercancel', leave);
    card.addEventListener('focusin', focus); card.addEventListener('focusout', blur);
    document.addEventListener('visibilitychange', reset); document.addEventListener('artrobots-motion-change', reset);
    for (const media of [reduced, fine, forced]) media.addEventListener('change', reset);
    apply();
    return () => {
      disposed = true; cancelAnimationFrame(raf);
      card.removeEventListener('pointerenter', pointer); card.removeEventListener('pointermove', pointer);
      card.removeEventListener('pointerleave', leave); card.removeEventListener('pointercancel', leave);
      card.removeEventListener('focusin', focus); card.removeEventListener('focusout', blur);
      document.removeEventListener('visibilitychange', reset); document.removeEventListener('artrobots-motion-change', reset);
      for (const media of [reduced, fine, forced]) media.removeEventListener('change', reset);
    };
  }, []);
  return ref;
}

export function ProjectRelations({ projects, english, links = false }: { projects: PublicMemberProject[]; english: boolean; links?: boolean }) {
  if (!projects.length) return null;
  return <ul className={links ? 'member-profile-history' : 'mt-3 text-xs space-y-2'} aria-label={english ? 'Projects' : 'Projetos'}>
    {projects.map(project => <li key={project.id} data-project-id={project.id}>
      {links && project.url ? <a className="text-light font-bold" href={project.url} rel="noopener noreferrer">{english && project.titleEn ? project.titleEn : project.title}</a>
        : <span className="font-semibold">{english && project.titleEn ? project.titleEn : project.title}</span>}
      {' · '}<span>{project.membership === 'CURRENT' ? (english ? 'Current' : 'Atual') : (english ? 'Past participation' : 'Participação anterior')}{project.status === 'COMPLETED' ? (english ? ' · Completed' : ' · Concluído') : ''}</span>
    </li>)}
  </ul>;
}
export type MemberView = 'compact' | 'list' | 'cards';
type MemberCardProps = { english: boolean; color?: string; view?: MemberView } & ({ legacy: LegacyMember; member?: never; origin?: never } | { member: PublicMember; origin: string; legacy?: never });
export function MemberCard(props: MemberCardProps) {
  const { english, color = '#855EDE', member, legacy, view = 'cards' } = props;
  const ref = useProfileCard();
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const name = member?.name ?? legacy!.name;
  const photo = member ? `${props.origin}${member.photoPath}` : legacy!.photo;
  const href = member ? memberProfileHref(member, english) : `${english ? 'membro-en.html' : 'membro.html'}?perfil=${legacy!.siteKey}`;
  if (view !== 'cards') return <a href={href} data-public-profile-id={member?.id} data-site-key={legacy?.siteKey}
    className={`member-card member-summary member-summary-${view}`} style={{ '--team-color': color } as CSSProperties}
    aria-label={english ? `View ${name}'s profile` : `Ver perfil de ${name}`}>
    <img className="member-summary-photo" src={failedPhoto === photo ? 'assets/logo_circulo.png' : photo} alt="" width={64} height={64}
      loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailedPhoto(photo)} />
    <div className="member-summary-copy"><h3>{name}</h3><p className="connected-member-position">{member?.position ?? legacy!.position}</p>
      {member?.projects.length ? <div className="member-summary-projects"><ProjectRelations projects={member.projects} english={english} /></div> : null}
    </div>
    <span className="member-summary-link" aria-hidden="true">→</span>
  </a>;
  if (member) return <a ref={ref} href={href} data-public-profile-id={member.id}
    className="member-card member-profile-card connected-member-card"
    style={{ '--team-color': color } as CSSProperties}
    aria-label={english ? `View ${name}'s profile` : `Ver perfil de ${name}`}>
    <div className="connected-member-portrait" aria-hidden="true">
      <img src={failedPhoto === photo ? 'assets/logo_circulo.png' : photo} alt="" width={480} height={640}
        loading="lazy" decoding="async" referrerPolicy="no-referrer"
        onError={() => setFailedPhoto(photo)} />
    </div>
    <div className="connected-member-content">
      <div><h3 title={name}>{name}</h3><p className="connected-member-position">{member.position}</p></div>
      {member.projects.length ? <div className="connected-member-projects"><ProjectRelations projects={member.projects} english={english} /></div> : null}
      {member.description ? <p className="connected-member-description">{member.description}</p> : null}
      <span className="connected-member-link">{english ? 'View profile' : 'Ver perfil'}<span aria-hidden="true">↗</span></span>
    </div>
    <span className="mpc-shine" aria-hidden="true" /><span className="mpc-glare" aria-hidden="true" />
  </a>;
  return <a ref={ref} href={href} data-site-key={legacy.siteKey}
    className="member-card member-profile-card bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border overflow-hidden text-center p-5"
    style={{ borderColor: `${color}4d`, '--team-color': color } as CSSProperties}
    aria-label={english ? `View ${name}'s profile` : `Ver perfil de ${name}`}>
    {legacy?.captain ? <div className="captain-badge mx-auto w-fit"><MemberIcon name="star" className="w-3 h-3 inline mr-0.5" />{english ? 'CAPTAIN' : 'CAPITÃO'}</div> : null}
    <div className="mpc-photo-frame w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-4" style={{ borderColor: color }}>
      <img src={failedPhoto === photo ? 'assets/logo_circulo.png' : photo} alt={name} width={96} height={96} loading="lazy" referrerPolicy="no-referrer" className="member-photo w-full h-full object-cover" onError={() => setFailedPhoto(photo)} />
    </div>
    <h3 className="font-bold text-base leading-tight mb-0.5">{name}</h3>
    <p className="connected-member-position text-xs font-semibold" style={{ color }}>{legacy.position}</p>
    <div className="team-badge" style={{ background: `${color}1f`, color }}><MemberIcon name={legacy.icon} className="w-3 h-3" /><span>{legacy.badge}</span></div>
    <span className="member-profile-label">{english ? 'View profile →' : 'Ver perfil →'}</span>
    <span className="mpc-shine" aria-hidden="true" /><span className="mpc-glare" aria-hidden="true" />
  </a>;
}
