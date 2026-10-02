import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MembersPage } from '../src/pages/MembersPage';
import { MemberProfilePage } from '../src/pages/MemberProfilePage';
import { MemberCarousel } from '../src/components/MemberCarousel';
import type { PublicMember } from '../src/lib/public-members';

const people: PublicMember[] = ['reg-ART-0061', 'reg-MEM-1111'].map((id, i) => ({ id, name: `Pessoa ${i}`, position: 'Engenharia', description: 'Descrição pública',
  photoPath: `/api/public/members/${id}/photo`, profilePath: `/membros/${id}`, siteKey: i ? null : 'pessoa-0', directoryGroup: 'leadership', projects: [] }));
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ members: people, linkedSiteKeys: ['pessoa-0'], directoryMode: 'active' }) }));
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.clear(); });

describe('member browsing and return journey', () => {
  it.each([false, true])('preserves all historical relationships in compact/list/cards, english=%s', async english => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ members: [], linkedSiteKeys: [], directoryMode: 'legacy' }) }));
    const { container } = render(<MembersPage english={english} />);
    await screen.findByRole('link', { name: english ? 'View Kaian Moura\'s profile' : 'Ver perfil de Kaian Moura' });
    const original = [...container.querySelectorAll<HTMLAnchorElement>('[data-site-key]')].map(link => [link.dataset.siteKey, link.href]);
    expect(original).toHaveLength(27);
    for (const label of [english ? 'List' : 'Lista', 'Cards', english ? 'Compact' : 'Compacto']) {
      fireEvent.click(screen.getByRole('button', { name: label }));
      expect([...container.querySelectorAll<HTMLAnchorElement>('[data-site-key]')].map(link => [link.dataset.siteKey, link.href])).toEqual(original);
    }
  });
  it.each([false, true])('keeps the same public identities across every view and offers a home link, english=%s', async english => {
    const { container } = render(<MembersPage english={english} />);
    await screen.findByRole('link', { name: english ? "View Pessoa 0's profile" : 'Ver perfil de Pessoa 0' });
    expect(screen.getByRole('link', { name: english ? '← Back to Artrobots' : '← Voltar ao site Artrobots' }).getAttribute('href')).toBe(`${english ? 'index-en' : 'index'}.html#leadership`);
    expect(screen.getByRole('button', { name: english ? 'Compact' : 'Compacto' }).getAttribute('aria-pressed')).toBe('true');
    for (const label of [english ? 'List' : 'Lista', 'Cards', english ? 'Compact' : 'Compacto']) {
      fireEvent.click(screen.getByRole('button', { name: label }));
      expect([...container.querySelectorAll('[data-public-profile-id]')].map(e => e.getAttribute('data-public-profile-id'))).toEqual(people.map(p => p.id));
      expect(screen.getByRole('button', { name: label }).getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByRole('link', { name: english ? "View Pessoa 0's profile" : 'Ver perfil de Pessoa 0' }).getAttribute('href')).toBe(`${english ? 'membro-en' : 'membro'}.html?perfil=reg-ART-0061`);
    }
  });
  it('restores only valid preferences and tolerates unavailable storage', async () => {
    localStorage.setItem('artrobots_member_view', 'list');
    const { unmount } = render(<MembersPage english={false} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Lista' }).getAttribute('aria-pressed')).toBe('true'));
    unmount();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    render(<MembersPage english={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cards' }));
    expect(screen.getByRole('button', { name: 'Cards' }).getAttribute('aria-pressed')).toBe('true');
  });
  it.each(['reg-ART-0061', 'pessoa-0'])('shows an approved profile locally for id or old site alias %s, then hides a withdrawal', async key => {
    const { container } = render(<MemberProfilePage english={false} profileKey={key} />);
    await screen.findByRole('heading', { name: 'Pessoa 0' });
    expect(screen.getByRole('link', { name: '← Voltar para membros' }).getAttribute('href')).toBe('membros.html');
    expect(screen.getByRole('link', { name: 'Voltar ao site Artrobots' }).getAttribute('href')).toBe('index.html#leadership');
    expect(screen.getByRole('link', { name: 'Ver na ArtroLove' }).getAttribute('href')).toBe('https://artrolove.artrobots.tech/membros/reg-ART-0061/comunidade');
    expect(container.textContent).toContain('Descrição pública');
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ members: [], linkedSiteKeys: ['pessoa-0'], directoryMode: 'active' }) } as Response);
    fireEvent.focus(window);
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Pessoa 0' })).toBeNull());
    expect(container.querySelector('article')).toBeNull();
  });
});

describe('manual member carousel', () => {
  it.each([false, true])('handles endpoints, keyboard and reduced motion, reduced=%s', reduced => {
    let resize: ResizeObserverCallback = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal('ResizeObserver', class { constructor(cb: ResizeObserverCallback) { resize = cb; } observe() {} disconnect = disconnect; });
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: reduced, addEventListener() {}, removeEventListener() {} })));
    const { unmount } = render(<MemberCarousel members={people} origin="https://artrolove.artrobots.tech" english={false} />);
    const track = screen.getByRole('region', { name: 'Membros da liderança' });
    const scrollBy = vi.fn(), scrollTo = vi.fn();
    Object.defineProperties(track, { clientWidth: { value: 600 }, scrollWidth: { value: 1800 }, scrollLeft: { writable: true, value: 0 }, scrollBy: { value: scrollBy }, scrollTo: { value: scrollTo } });
    act(() => resize([], {} as ResizeObserver));
    expect((screen.getByRole('button', { name: 'Membros anteriores' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Próximos membros' }));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: 600, behavior: reduced ? 'auto' : 'smooth' });
    track.scrollLeft = 1200; fireEvent.scroll(track);
    expect((screen.getByRole('button', { name: 'Próximos membros' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.keyDown(track, { key: 'ArrowLeft' });
    expect(scrollBy).toHaveBeenLastCalledWith({ left: -600, behavior: reduced ? 'auto' : 'smooth' });
    fireEvent.keyDown(track, { key: 'Home' });
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'auto' });
    unmount(); expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
