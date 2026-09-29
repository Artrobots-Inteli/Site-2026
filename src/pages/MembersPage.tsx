import type { CSSProperties } from 'react';
import { MemberCard, MemberIcon } from '../components/MemberCard';
import { legacyTeams, type LegacyTeam } from '../data/legacy-members';
import { usePublicMembers } from '../hooks/usePublicMembers';
import { orderedLeadership, type DirectoryGroup, type PublicMember } from '../lib/public-members';

function LegacySection({ team, linked, english }: { team: LegacyTeam; linked: Set<string>; english: boolean }) {
  const members = team.members.filter(member => !linked.has(member.siteKey));
  if (!members.length) return null;
  return <section className="team-section" data-legacy-team="" data-legacy-project={team.isProject ? '' : undefined} id={team.id}>
    <div className="team-header" style={{ borderColor: team.color, background: `${team.color}0f` }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${team.color}2e` }}>
        <MemberIcon name={team.icon} className="w-7 h-7" style={{ color: team.color }} />
      </div>
      <div><h2 className="text-3xl font-bold font-display" style={{ color: team.color }}>{team.title}</h2><p className="text-gray-400 text-sm mt-1">{team.description}</p></div>
    </div>
    <div className={`${team.gridClass} member-profile-grid`}>{members.map(member => <MemberCard key={member.siteKey} legacy={member} color={team.color} english={english} />)}</div>
  </section>;
}
function ConnectedSection({ group, members, origin, english }: { group: DirectoryGroup; members: PublicMember[]; origin: string; english: boolean }) {
  const listed = group === 'leadership' ? orderedLeadership(members) : members.filter(member => member.directoryGroup === group);
  if (!listed.length) return null;
  const labels = english ? {
    leadership: ['CLUB LEADERSHIP', 'Members leading the club today.', '#F59E0B'],
    projects: ['PROJECT MEMBERS', 'Members contributing to an active project.', '#855EDE'],
    community: ['COMMUNITY', 'Members without an active project allocation, with a place in our community.', '#AED6F1'],
  } : {
    leadership: ['DIRETORIA', 'Membros que conduzem o clube hoje.', '#F59E0B'],
    projects: ['MEMBROS EM PROJETOS', 'Membros que contribuem com um projeto em andamento.', '#855EDE'],
    community: ['COMUNIDADE', 'Membros sem alocação em projeto ativo, com espaço na nossa comunidade.', '#AED6F1'],
  };
  const [title, description, color] = labels[group];
  return <section className="team-section connected-member-section" data-directory-group={group} style={{ '--team-color': color } as CSSProperties}>
    <div className="team-header"><div className="member-section-icon" aria-hidden="true">{group === 'leadership' ? '✦' : group === 'projects' ? '⌘' : '○'}</div>
      <div><h2 className="text-3xl font-bold font-display">{title}</h2><p className="text-gray-400 text-sm mt-1">{description}</p></div>
    </div>
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 member-profile-grid">
      {listed.map(member => <MemberCard key={member.id} member={member} origin={origin} english={english} color={color} />)}
    </div>
  </section>;
}
export function MembersPage({ english }: { english: boolean }) {
  const { feed, origin, status, retry } = usePublicMembers();
  const teams = legacyTeams(english), linked = new Set(feed?.linkedSiteKeys ?? []);
  const currentDirectory = feed?.directoryMode === 'active';
  const empty = feed && !feed.members.length && (currentDirectory || teams.every(team => team.members.every(member => linked.has(member.siteKey))));
  return <main>
    <section className="directory-hero relative min-h-[40vh] flex items-center justify-center bg-gradient-to-b from-primary to-dark" style={{ paddingTop: 100 }}>
      <div className="container mx-auto px-6 text-center"><h1 className="text-5xl md:text-7xl font-bold mb-4 font-display">{english ? 'MEMBERS' : 'MEMBROS'}</h1>
        <p className="text-xl text-gray-300">{english ? 'Meet all Artrobots members, organized by teams' : 'Conheça todos os membros do Artrobots, organizados por equipes'}</p>
      </div>
    </section>
    <section className="py-20 bg-dark"><div className="container mx-auto px-6" data-legacy-directory="" aria-busy={status === 'loading'}>
      <p className="text-sm text-gray-400 mb-4" role="status" hidden={status === 'ready' && !empty}>{status === 'loading' ? (english ? 'Loading members…' : 'Carregando membros…')
        : status === 'error' ? (english ? 'We could not load member profiles. Please try again.' : 'Não foi possível carregar os perfis. Tente novamente.')
          : empty ? (english ? 'No member profiles are publicly available yet.' : 'Ainda não há perfis de membros disponíveis publicamente.') : ''}</p>
      {status === 'error' ? <button type="button" onClick={retry} className="mb-8 rounded-lg border border-secondary px-4 py-2 text-sm">{english ? 'Try again' : 'Tentar novamente'}</button> : null}
      {feed ? <>
        <ConnectedSection group="leadership" members={feed.members} origin={origin} english={english} />
        {!currentDirectory && teams.filter(team => !team.isProject).map(team => <LegacySection key={team.id} team={team} linked={linked} english={english} />)}
        <ConnectedSection group="projects" members={feed.members} origin={origin} english={english} />
        {!currentDirectory && teams.filter(team => team.isProject).map(team => <LegacySection key={team.id} team={team} linked={linked} english={english} />)}
        <ConnectedSection group="community" members={feed.members} origin={origin} english={english} />
      </> : null}
    </div></section>
  </main>;
}
