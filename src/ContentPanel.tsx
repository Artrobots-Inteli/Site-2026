import { useEffect, useState } from 'react';
import { itemsFor, publicImage, publicUrl } from './publicContent';
import { rangeLabel, type ContentKind, type Entry, type Snapshot } from './model';
function EntryCard({ entry, english }: { entry: Entry; english: boolean }) {
  const [broken, setBroken] = useState(false);
  const image = publicImage(entry.imageUrl);
  useEffect(() => { setBroken(false); }, [image]);
  const url = publicUrl(entry.url);
  const title = english && entry.titleEn || entry.title;
  const old = entry.status === 'COMPLETED' || entry.kind === 'EVENT' && !!entry.startsAt && Date.parse(entry.endsAt || entry.startsAt) < Date.now();
  const scheduled = entry.kind === 'EVENT' && !!entry.startsAt && Date.parse(entry.startsAt) > Date.now();
  const state = old ? english ? 'Archived' : 'Histórico' : scheduled ? english ? 'Scheduled' : 'Agendado' : english ? 'Active' : entry.kind === 'PARTNERSHIP' ? 'Ativa' : 'Em andamento';
  return <article className={`site-entry site-entry-${entry.kind.toLowerCase()}`}>
    {entry.kind !== 'EVENT' && image && !broken && <div className="site-entry-media"><img src={image} alt={entry.imageAlt || title} loading="lazy" decoding="async" onError={() => setBroken(true)} /></div>}
    <div className="site-entry-body"><div className="site-entry-meta"><span>{state}</span>{entry.featured && <span className="site-entry-featured">{english ? 'Featured' : 'Destaque'}</span>}</div><h3>{title}</h3><p>{english && entry.summaryEn || entry.summary}</p>
      {(entry.startsAt || entry.kind === 'EVENT') && <time className="site-entry-time" dateTime={entry.startsAt || undefined}>{rangeLabel(entry, english)}</time>}
      {entry.location && <p className="site-entry-location">{entry.location}</p>}
      {url && <a className="site-detail-link" href={url}>{english ? 'View details' : 'Ver detalhes'} ↗</a>}
    </div>
  </article>;
}
export default function ContentPanel({ kind, snapshot, english, loading }: { kind: ContentKind; snapshot: Snapshot | null; english: boolean; loading: boolean }) {
  const items = snapshot ? itemsFor(snapshot, kind) : [];
  if (loading && !snapshot) return <div className="league-loading" role="status"><span className="league-loading-orbit" /><p>{english ? 'Loading published content…' : 'Carregando conteúdo publicado…'}</p><p>{english ? 'The first connection may take a moment.' : 'O primeiro acesso pode demorar um pouco.'}</p></div>;
  if (!snapshot) return <p className="site-empty">{english ? 'Published content is currently unavailable. Try again below.' : 'O conteúdo publicado está indisponível. Tente novamente abaixo.'}</p>;
  return <div className="site-entries" data-site-content={kind}>{items.length ? items.map((entry) => <EntryCard key={entry.id} entry={entry} english={english} />) : <p className="site-empty">{english ? 'No published entries yet.' : 'Nenhum item publicado por enquanto.'}</p>}</div>;
}
