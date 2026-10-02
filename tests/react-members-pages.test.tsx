import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MembersPage } from '../src/pages/MembersPage';
import { MemberProfilePage } from '../src/pages/MemberProfilePage';
import { usePublicMembers } from '../src/hooks/usePublicMembers';
import { legacyTeamsPt } from '../src/data/legacy-members';

const keys = legacyTeamsPt.flatMap(team => team.members.map(member => member.siteKey));
const publicMember = (id = 'public-1', directoryGroup = 'projects') => ({ id, name: `Pessoa ${id}`, position: 'Engenharia', description: 'Robótica',
  photoPath: `/api/public/members/${id}/photo`, profilePath: `/membros/${id}`, siteKey: null, directoryGroup,
  projects: [{ id: 'robot-1', title: 'Robô', titleEn: 'Robot', url: 'https://artrobots.tech/#projects', status: 'COMPLETED', membership: 'PAST' }],
  email: 'private@example.test', notes: 'private notes' });
const response = (members: unknown[] = [], linkedSiteKeys: string[] = [], directoryMode?: 'active' | 'legacy') => ({ ok: true, json: async () => ({ members, linkedSiteKeys, directoryMode }) }) as Response;
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('member directory integration', () => {
  it('SSR renders safe loading markup without fetching or requiring DOM', () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    expect(renderToString(<MembersPage english={false} />)).toContain('Carregando membros');
    expect(renderToString(<MemberProfilePage english={true} profileKey={null} queryReady={false} />)).toContain('Loading profile');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('replaces only explicit linked identities and puts unallocated community last', async () => {
    const approved = { ...publicMember(), siteKey: 'kaian-moura' };
    const fetcher = vi.fn().mockResolvedValue(response([publicMember('lead', 'leadership'), approved, publicMember('community', 'community')], ['kaian-moura']));
    vi.stubGlobal('fetch', fetcher);
    const { container } = render(<MembersPage english={false} />);
    expect(screen.queryByText('Kaian Moura')).toBeNull();
    await screen.findByRole('link', { name: 'Ver perfil de Pessoa public-1' });
    expect(screen.queryByText('Kaian Moura')).toBeNull();
    expect(screen.getByText('Mell Aguiar')).toBeTruthy();
    expect(container.querySelectorAll('[data-site-key]')).toHaveLength(26);
    expect(container.textContent).toContain('Participação anterior · Concluído');
    expect(container.textContent).not.toContain('private');
    const groups = Array.from(container.querySelectorAll('.team-section'));
    expect(groups[0].getAttribute('data-directory-group')).toBe('leadership');
    expect(groups.at(-1)?.getAttribute('data-directory-group')).toBe('community');
    expect(screen.getByRole('link', { name: 'Ver perfil de Pessoa public-1' }).getAttribute('href')).toBe('membro.html?perfil=public-1');
    expect(fetcher.mock.calls[0][1]).toMatchObject({ credentials: 'omit', cache: 'no-store', signal: expect.any(AbortSignal) });
  });
  it('shows only reviewed active members when ArtroLove activates the current directory', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([publicMember('reg-ART-0027', 'community')], [], 'active')));
    const { container } = render(<MembersPage english={false} />);
    await screen.findByRole('link', { name: 'Ver perfil de Pessoa reg-ART-0027' });
    expect(container.querySelectorAll('[data-site-key]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-public-profile-id]')).toHaveLength(1);
    expect(screen.queryByText('Kaian Moura')).toBeNull();
  });
  it('orders confirmed leadership as president, vice, then directors without promoting community titles', async () => {
    const approved = [
      { ...publicMember('director', 'leadership'), position: 'Diretor de Elétrica' },
      { ...publicMember('unconfirmed-vice', 'community'), position: 'Vice Presidente' },
      { ...publicMember('vice', 'leadership'), position: 'Vice-presidente' },
      { ...publicMember('president', 'leadership'), position: 'Presidente' },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(approved, [], 'active')));
    const { container } = render(<MembersPage english={false} />);
    await screen.findByRole('link', { name: 'Ver perfil de Pessoa president' });
    expect([...container.querySelectorAll('[data-directory-group="leadership"] [data-public-profile-id]')]
      .map(card => card.getAttribute('data-public-profile-id'))).toEqual(['president', 'vice', 'director']);
    expect(container.querySelector('[data-directory-group="community"] [data-public-profile-id]')?.getAttribute('data-public-profile-id')).toBe('unconfirmed-vice');
  });
  it('does not revive old directory cards after every current publication is withdrawn', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([], [], 'active')));
    const { container } = render(<MembersPage english={false} />);
    await screen.findByText('Ainda não há perfis de membros disponíveis publicamente.');
    expect(container.querySelectorAll('.member-card')).toHaveLength(0);
  });
  it('renders a real empty state and no legacy resurrection after withdrawal', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response([publicMember()], keys)).mockResolvedValue(response([], keys));
    vi.stubGlobal('fetch', fetcher);
    const { container } = render(<MembersPage english={true} />);
    await screen.findByRole('link', { name: "View Pessoa public-1's profile" });
    expect(container.textContent).toContain('Robot');
    fireEvent.focus(window);
    await screen.findByText('No member profiles are publicly available yet.');
    expect(container.querySelectorAll('.member-card')).toHaveLength(0);
  });
  it('clears unavailable data, offers retry and never displays private payload fields', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValue(response([], [])));
    const { container } = render(<MembersPage english={false} />);
    await screen.findByRole('button', { name: 'Tentar novamente' });
    expect(container.querySelectorAll('.member-card')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await screen.findByText('Kaian Moura');
    expect(container.querySelectorAll('.member-card')).toHaveLength(27);
  });
  it('does not revive a legacy profile when tombstoned or unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([], ['kaian-moura'])));
    const { rerender } = render(<MemberProfilePage english={false} profileKey="kaian-moura" />);
    await screen.findByText('Este perfil não está disponível publicamente.');
    expect(screen.queryByRole('heading', { name: 'Kaian Moura' })).toBeNull();
    rerender(<MemberProfilePage english={false} profileKey="mell-aguiar" />);
    await screen.findByRole('heading', { name: 'Mell Aguiar' });
  });
  it('prevents a late obsolete response from undoing a withdrawn snapshot', async () => {
    let oldResolve: (result: Response) => void = () => {};
    const fetcher = vi.fn().mockImplementationOnce(() => new Promise<Response>(resolve => { oldResolve = resolve; })).mockResolvedValue(response([], keys));
    vi.stubGlobal('fetch', fetcher);
    const { result } = renderHook(() => usePublicMembers());
    fireEvent.focus(window);
    await waitFor(() => expect(result.current.status).toBe('ready'));
    await act(async () => { oldResolve(response([publicMember()], [])); });
    expect(result.current.feed?.members).toEqual([]);
    expect(result.current.feed?.linkedSiteKeys).toEqual(keys);
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
  });
  it('refreshes at 60 seconds and BFCache restore, cancels timers/listeners on unmount', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn().mockResolvedValue(response()); vi.stubGlobal('fetch', fetcher);
    const { unmount } = renderHook(() => usePublicMembers());
    await act(async () => {});
    expect(fetcher).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    expect(fetcher).toHaveBeenCalledTimes(2);
    await act(async () => { window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); });
    expect(fetcher).toHaveBeenCalledTimes(3);
    unmount();
    fireEvent.focus(window);
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls[2][1].signal.aborted).toBe(true);
  });
});
