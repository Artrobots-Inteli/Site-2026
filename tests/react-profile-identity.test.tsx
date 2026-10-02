import { act, render, screen, waitFor } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/App';
import { MemberProfilePage } from '../src/pages/MemberProfilePage';

vi.mock('../src/hooks/useSiteEffects', () => ({ useSiteEffects: vi.fn() }));
const member = { id: 'public-one', name: 'Pessoa sintética', position: 'Engenharia', description: 'Descrição pública',
  photoPath: '/api/public/members/public-one/photo', profilePath: '/membros/public-one', siteKey: 'kaian-moura', directoryGroup: 'projects', projects: [] };
function publicFeed() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ members: [member], linkedSiteKeys: ['kaian-moura'], directoryMode: 'active' }) }));
}
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); window.history.replaceState({}, '', '/'); });

describe('profile identity owned by the application', () => {
  it.each([false, true])('uses the same direct-query identity in content and language links, english=%s', async english => {
    publicFeed();
    window.history.replaceState({}, '', `/membro${english ? '-en' : ''}.html?perfil=kaian-moura#history`);
    const { container } = render(<App page="profile" english={english} />);
    await screen.findByRole('heading', { name: member.name });
    expect([...container.querySelectorAll(`[data-lang="${english ? 'pt' : 'en'}"]`)].map(element => element.getAttribute('href')))
      .toEqual([1, 2].map(() => `membro${english ? '' : '-en'}.html?perfil=kaian-moura#history`));
  });

  it.each(['', 'bad_key!'])('does not select a historical person for an absent/invalid identity %s', async key => {
    publicFeed();
    window.history.replaceState({}, '', '/membro.html' + (key ? '?perfil=' + encodeURIComponent(key) : ''));
    render(<App page="profile" english={false} />);
    await screen.findByText('Este perfil não foi encontrado.');
    expect(screen.queryByRole('heading', { name: member.name })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Kaian Moura' })).toBeNull();
  });

  it('preserves loading until identity readiness, then reacts to direct prop changes', async () => {
    publicFeed();
    const { rerender } = render(<MemberProfilePage english={false} profileKey="kaian-moura" queryReady={false} />);
    await act(async () => { await Promise.resolve(); });
    expect(screen.getByText('Carregando perfil…')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: member.name })).toBeNull();
    rerender(<MemberProfilePage english={false} profileKey="kaian-moura" queryReady />);
    await screen.findByRole('heading', { name: member.name });
    rerender(<MemberProfilePage english={false} profileKey={null} queryReady />);
    expect(screen.getByText('Este perfil não foi encontrado.')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: member.name })).toBeNull();
  });

  it('hydrates prerendered loading markup before reading the browser query', async () => {
    publicFeed();
    window.history.replaceState({}, '', '/membro.html?perfil=kaian-moura');
    const html = renderToString(<App page="profile" english={false} />);
    expect(html).toContain('Carregando perfil');
    expect(fetch).not.toHaveBeenCalled();
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const container = document.createElement('div'); container.innerHTML = html; document.body.append(container);
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => { root = hydrateRoot(container, <App page="profile" english={false} />); });
    await waitFor(() => expect(container.querySelector('h1')?.textContent).toBe(member.name));
    expect(errors.mock.calls.filter(call => /hydrat|server rendered|did not match/i.test(call.join(' ')))).toHaveLength(0);
    await act(async () => { root.unmount(); });
    container.remove();
  });
});
