import { useEffect, useState } from 'react';
import { legacyTeams } from '../data/legacy-members';
import { usePublicMembers } from '../hooks/usePublicMembers';
import { profileState, validSiteKey } from '../lib/public-members';

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
  const state = feed && validSiteKey(key) ? profileState(feed, key) : null;
  const connectedPath = state?.kind === 'connected' ? state.member.profilePath : null;
  useEffect(() => {
    if (connectedPath) window.location.replace(`${origin}${connectedPath}${english ? '?lang=en' : ''}`);
  }, [origin, connectedPath, english]);
  const records = state?.kind === 'legacy' ? legacyTeams(english).flatMap(team => team.members.filter(member => member.siteKey === key).map(member => ({ ...member, team: team.title, teamId: team.id }))) : [];
  const first = records[0];
  const legacy = first && records.every(member => member.name === first.name && member.photo === first.photo) ? first : null;
  useEffect(() => { if (legacy) document.title = `${legacy.name} - Artrobots`; }, [legacy?.name]);
  let message = '';
  if (!queryReady || status === 'loading') message = english ? 'Loading profile…' : 'Carregando perfil…';
  else if (!validSiteKey(key)) message = english ? 'This profile could not be found.' : 'Este perfil não foi encontrado.';
  else if (status === 'error') message = english ? 'We could not load this profile. Please try again.' : 'Não foi possível carregar este perfil. Tente novamente.';
  else if (state?.kind === 'connected') message = english ? 'Opening profile…' : 'Abrindo perfil…';
  else if (state?.kind === 'withdrawn') message = english ? 'This profile is not publicly available.' : 'Este perfil não está disponível publicamente.';
  else if (!legacy) message = english ? 'This profile could not be found.' : 'Este perfil não foi encontrado.';
  return <main className="member-profile-shell">
    <a href={directory} className="member-profile-back">{english ? '← Back to members' : '← Voltar para membros'}</a>
    <p role="status" className="text-gray-300">{message}</p>
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
