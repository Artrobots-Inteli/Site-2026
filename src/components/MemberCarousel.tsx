import { useEffect, useId, useRef, useState } from 'react';
import { MemberCard } from './MemberCard';
import type { PublicMember } from '../lib/public-members';

/** Native scrolling keeps swipe, keyboard and reduced motion under browser control. */
export function MemberCarousel({ members, origin, english }: { members: PublicMember[]; origin: string; english: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const [bounds, setBounds] = useState({ previous: false, next: false });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const measure = () => {
      const previous = element.scrollLeft > 2, next = element.scrollLeft + element.clientWidth < element.scrollWidth - 2;
      setBounds(old => old.previous === previous && old.next === next ? old : { previous, next });
    };
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    resize?.observe(element);
    element.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    return () => { resize?.disconnect(); element.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); };
  }, [members.length]);
  const move = (direction: -1 | 1) => {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth, behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  return <div className="member-carousel" data-current-leadership="">
    <div className="member-carousel-toolbar"><p>{members.length} {english ? 'members · swipe to explore' : 'pessoas · deslize para explorar'}</p>
      <div className="member-carousel-controls">
        <button type="button" aria-label={english ? 'Previous members' : 'Membros anteriores'} aria-controls={id} disabled={!bounds.previous} onClick={() => move(-1)}>←</button>
        <button type="button" aria-label={english ? 'Next members' : 'Próximos membros'} aria-controls={id} disabled={!bounds.next} onClick={() => move(1)}>→</button>
      </div>
    </div>
    <div ref={track} id={id} className="member-carousel-track member-profile-grid" role="region" aria-label={english ? 'Leadership members' : 'Membros da liderança'} tabIndex={0}
      onKeyDown={event => {
        if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') move(event.key === 'ArrowLeft' ? -1 : 1);
        else event.currentTarget.scrollTo({ left: event.key === 'Home' ? 0 : event.currentTarget.scrollWidth, behavior: 'auto' });
      }}>
      {members.map(member => <MemberCard key={member.id} member={member} origin={origin} english={english} color="#855EDE" />)}
    </div>
  </div>;
}
