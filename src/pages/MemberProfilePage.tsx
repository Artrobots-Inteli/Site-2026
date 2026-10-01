import { useEffect, useState } from 'react';
import { legacyTeams } from '../data/legacy-members';
import { usePublicMembers } from '../hooks/usePublicMembers';
import { profileState, validProfileKey } from '../lib/public-members';
import { ProjectRelations } from '../components/MemberCard';

export function MemberProfilePage({ english, profileKey }: { english: boolean; profileKey?: string | null }) {
  const [key, setKey] = useState<string | null>(profileKey ?? null);
  const [queryReady, setQueryReady] = useState(profileKey !== undefined);
  const [hiddenPhoto, setHiddenPhoto] = useState(false);
  const { feed, origin, status, retry } = usePublicMembers();
  useEffect(() => {
    if (profileKey !== undefined) { setKey(profileKey); setQueryReady(true); return; }
    setKey(new URLSearchParams(window.location.search).get('perfil')); setQueryReady(true);
  }, [profileKey]);
  const directory = english ? 'membros-en.html' : 'membros.html';
  const state = feed && validProfileKey(key) ? profileState(feed, key) : null;
  const connected = state?.kind === 'connected' ? state.member : null;
  const records = state?.kind === 'legacy' ? legacyTeams(english).flatMap(team => team.members.filter(member => member.siteKey === key).map(member => ({ ...member, team: team.title, teamId: team.id }))) : [];
  const first = records[0];
  const legacy = first && records.every(member => member.name === first.name && member.photo === first.photo) ? first : null;
  useEffect(() => { setHiddenPhoto(false); }, [key, connected?.photoPath]);
  useEffect(() => { const name = connected?.name ?? legacy?.name; if (name) document.title = `${name} - Artrobots`; }, [connected?.name, legacy?.name]);
  let message = '';
  if (!queryReady || status === 'loading') message = english ? 'Loading profile…' : 'Carregando perfil…';
  else if (!validProfileKey(key)) message = english ? 'This profile could not be found.' : 'Este perfil não foi encontrado.';
  else if (status === 'error') message = english ? 'We could not load this profile. Please try again.' : 'Não foi possível carregar este perfil. Tente novamente.';
  else if (state?.kind === 'withdrawn') message = english ? 'This profile is not publicly available.' : 'Este perfil não está disponível publicamente.';
  else if (state?.kind === 'historical') message = english ? 'This historical profile is not part of the current member directory.' : 'Este perfil histórico não faz parte do diretório atual de membros.';
  else if (!legacy && !connected) message = english ? 'This profile could not be found.' : 'Este perfil não foi encontrado.';
  return <main className="member-profile-shell">
    <nav className="member-return-navigation" aria-label={english ? 'Profile navigation' : 'Navegação do perfil'}>
      <a href={directory} className="member-profile-back">{english ? '← Back to members' : '← Voltar para membros'}</a>
      <a href={english ? 'index-en.html#leadership' : 'index.html#leadership'} className="member-profile-back">{english ? 'Back to Artrobots' : 'Voltar ao site Artrobots'}</a>
    </nav>
    {message ? <p role="status" className="text-gray-300">{message}</p> : null}
    {connected && status === 'ready' ? <article className="site-member-profile">
      <div className="member-profile-heading">
        <img src={hiddenPhoto ? 'assets/logo_circulo.png' : `${origin}${connected.photoPath}`} alt={connected.name} width={160} height={160} className="member-profile-photo" referrerPolicy="no-referrer" onError={() => setHiddenPhoto(true)} />
        <div><p className="text-sm text-light mb-2">{english ? 'ARTROBOTS COMMUNITY' : 'COMUNIDADE ARTROBOTS'}</p>
          <h1 className="text-4xl font-bold font-display">{connected.name}</h1><p className="site-member-position">{connected.position}</p>
        </div>
      </div>
      {connected.description ? <p className="site-member-description">{connected.description}</p> : null}
      {connected.projects.length ? <section><h2 className="text-xl font-bold">{english ? 'Projects' : 'Projetos'}</h2><ProjectRelations projects={connected.projects} english={english} links /></section> : null}
      <a className="brand-button brand-button-secondary" href={`${origin}${connected.profilePath}/comunidade${english ? '?lang=en' : ''}`}>{english ? 'View in ArtroLove' : 'Ver na ArtroLove'}</a>
    </article> : null}
    {legacy && status === 'ready' ? <div>
      <div className="member-profile-heading">
        {!hiddenPhoto ? <img src={legacy.photo} alt={legacy.name} width={96} height={96} className="member-profile-photo" onError={() => setHiddenPhoto(true)} /> : null}
        <div><p className="text-sm text-light mb-2">{english ? 'ARTROBOTS COMMUNITY' : 'COMUNIDADE ARTROBOTS'}</p><h1 className="text-4xl font-bold font-display">{legacy.name}</h1></div>
      </div>
      <h2 className="text-xl font-bold">{english ? 'On the club website' : 'No site do clube'}</h2>
      <p className="mt-3 text-gray-400">{english ? 'Public information from our member directory. Current project participation is shown when this profile is connected to ArtroLove.' : 'Informações públicas do nosso diretório de membros. A participação atual em projetos aparece quando este perfil é conectado à ArtroLove.'}</p>
      <ul className="member-profile-history">{records.map(record => <li key={record.teamId}><a className="text-light font-bold" href={`${directory}#${encodeURIComponent(record.teamId)}`}>{record.team}</a><p className="mt-2 text-gray-300">{record.position}</p></li>)}</ul>
    </div> : null}
    {status === 'error' ? <button type="button" onClick={retry} className="mt-6 rounded-lg border border-secondary px-4 py-2">{english ? 'Try again' : 'Tentar novamente'}</button> : null}
  </main>;
}
