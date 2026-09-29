import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from '../src/pages/HomePage';
import { Navbar } from '../src/components/Navbar';

const cms = vi.hoisted(() => ({ partnerCount: 0 }));
vi.mock('../src/components/SiteContent', () => ({
  SiteContent: ({ kind, className }: { kind: string; className?: string }) => <div className={className} data-public-content={kind}>
    {kind === 'PARTNERSHIP' && Array.from({ length: cms.partnerCount }, (_, index) => <article data-kind="PARTNERSHIP" key={index}>Partner {index}</article>)}
  </div>,
}));

let resizeCallbacks: ResizeObserverCallback[];
let disconnectResize = vi.fn<() => void>();

beforeEach(() => {
  cms.partnerCount = 0;
  resizeCallbacks = [];
  disconnectResize = vi.fn<() => void>();
  class Observer {
    constructor(callback: ResizeObserverCallback) { resizeCallbacks.push(callback); }
    observe() {}
    unobserve() {}
    disconnect() { disconnectResize(); }
  }
  vi.stubGlobal('ResizeObserver', Observer);
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('pointer: fine'), addEventListener() {}, removeEventListener() {} })));
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  window.history.replaceState({}, '', '/');
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('published home interactions survive React ownership', () => {
  it.each([false, true])('shows only approved leaders in mandate order, language english=%s', async english => {
    const member = (id: string, position: string, directoryGroup = 'leadership') => ({ id, name: id, position, description: '',
      photoPath: `/api/public/members/${id}/photo`, profilePath: `/membros/${id}`, siteKey: null, directoryGroup, projects: [] });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ directoryMode: 'active', linkedSiteKeys: [], members: [
      member('William', 'Diretor de Elétrica'), member('Mell', 'Vice Presidente', 'community'),
      member('Carlos', 'Vice-presidente'), member('Kaian', 'Presidente'),
    ] }) }));
    const { container, unmount } = render(<HomePage english={english} />);
    await waitFor(() => expect(container.querySelectorAll('#leadership [data-public-profile-id]')).toHaveLength(3));
    const cards = container.querySelectorAll<HTMLElement>('#leadership [data-public-profile-id]');
    expect([...cards].map(card => card.getAttribute('data-public-profile-id'))).toEqual(['Kaian', 'Carlos', 'William']);
    expect(container.querySelector('#leadership [data-current-leadership]')).not.toBeNull();
    expect(container.querySelector('#leadership')?.textContent).not.toContain('Nicolli Venino');
    expect(container.querySelector('#leadership')?.textContent).not.toContain('Mell Aguiar');
    for (const card of cards) {
      expect(card.classList.contains('member-profile-card')).toBe(true);
      expect(card.querySelectorAll('.mpc-shine, .mpc-glare')).toHaveLength(2);
      expect(card.querySelector('.connected-member-portrait img')?.getAttribute('src')).toMatch(/^https:\/\/artrolove\.artrobots\.tech\/api\/public\/members\//);
    }
    const mouse = new Event('pointermove', { bubbles: true });
    Object.assign(mouse, { pointerType: 'mouse', clientX: 30, clientY: 40 });
    fireEvent(cards[0], mouse);
    expect(cards[0].dataset.profileCardActive).toBe('true');
    expect(requestAnimationFrame).toHaveBeenCalled();
    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
  });

  it('does not resurrect former leaders when the public feed is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { container } = render(<HomePage english={false} />);
    await waitFor(() => expect(container.querySelector('#leadership')?.textContent).toContain('A diretoria está temporariamente indisponível.'));
    expect(container.querySelector('#leadership [data-public-profile-id]')).toBeNull();
    expect(container.querySelector('#leadership')?.textContent).not.toContain('Nicolli Venino');
  });

  it('shows sponsor controls only while published partners actually overflow and releases observers', async () => {
    const disconnectMutation = vi.spyOn(MutationObserver.prototype, 'disconnect');
    const { container, rerender, unmount } = render(<HomePage english={false} />);
    const carousel = container.querySelector<HTMLElement>('.sponsors-container')!;
    const previous = container.querySelector<HTMLButtonElement>('.sponsors-scroll-left')!;
    const next = container.querySelector<HTMLButtonElement>('.sponsors-scroll-right')!;
    let scrollWidth = 1600;
    Object.defineProperty(carousel, 'clientWidth', { configurable: true, get: () => 600 });
    Object.defineProperty(carousel, 'scrollWidth', { configurable: true, get: () => scrollWidth });
    const resize = () => act(() => resizeCallbacks.forEach(callback => callback([], {} as ResizeObserver)));
    resize();
    expect(previous.disabled).toBe(true);
    expect(next.parentElement?.hidden).toBe(true);

    // Async CMS content causes a mutation; no imperative control patching.
    cms.partnerCount = 3;
    rerender(<HomePage english={false} />);
    await waitFor(() => expect(previous.disabled).toBe(false));
    expect(next.disabled).toBe(false);
    expect(next.parentElement?.hidden).toBe(false);
    scrollWidth = 600;
    resize();
    expect(previous.disabled).toBe(true);
    expect(next.parentElement?.style.display).toBe('none');
    scrollWidth = 1600;
    resize();
    expect(next.disabled).toBe(false);
    cms.partnerCount = 0;
    rerender(<HomePage english={false} />);
    await waitFor(() => expect(next.disabled).toBe(true));
    expect(next.parentElement?.hidden).toBe(true);
    unmount();
    expect(disconnectResize).toHaveBeenCalledTimes(1);
    expect(disconnectMutation).toHaveBeenCalled();
  });

  it('keeps a profile identity and the current anchor in the actual language links', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    window.history.replaceState({}, '', '/membro.html?perfil=kaian-moura#history');
    const { container, unmount } = render(<Navbar english={false} page="profile" profileKey="kaian-moura" />);
    const englishLinks = () => [...container.querySelectorAll<HTMLAnchorElement>('[data-lang="en"]')].map(link => link.getAttribute('href'));
    expect(englishLinks()).toEqual(['membro-en.html?perfil=kaian-moura#history', 'membro-en.html?perfil=kaian-moura#history']);
    window.history.replaceState({}, '', '/membro.html?perfil=kaian-moura#projects');
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(englishLinks()).toEqual(['membro-en.html?perfil=kaian-moura#projects', 'membro-en.html?perfil=kaian-moura#projects']);
    unmount();
    expect(remove).toHaveBeenCalledWith('hashchange', expect.any(Function));
  });
});
