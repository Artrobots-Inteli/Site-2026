import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { SiteContent } from '../src/components/SiteContent';
import { createSiteContentStore, ended, formattedDate, publicImage, publicUrl, validateSiteFeed } from '../src/lib/site-content';

const item = (overrides: Record<string, unknown> = {}) => ({ id: 'project-one', kind: 'PROJECT', title: 'Robô de combate', titleEn: 'Combat robot', summary: 'Eletrônica e mecânica.', summaryEn: 'Electronics and mechanics.',
  imageUrl: 'https://artrobots.tech/assets/hockey.jpg', imageAlt: 'Protótipo', url: 'https://github.com/Artrobots-Inteli', featured: true, order: 0, status: 'ACTIVE', startsAt: null, endsAt: null, allDay: false, location: '', ...overrides });
const feed = (items: unknown[] = [item()]) => ({ schemaVersion: 1, initialized: true, updatedAt: '2026-09-27T10:00:00Z', items });
const response = (value: unknown) => new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('typed public CMS contract', () => {
  it('allowlists public values and rejects duplicate IDs and private images', () => {
    const parsed = validateSiteFeed(feed([item({ sourceId: 'private-project', notes: 'private', email: 'secret@example.com' })]));
    expect(parsed.items[0]).not.toHaveProperty('sourceId'); expect(parsed.items[0]).not.toHaveProperty('email'); expect(parsed.items[0]).not.toHaveProperty('notes');
    expect(() => validateSiteFeed(feed([item(), item()]))).toThrow();
    expect(publicImage('https://artrolove.artrobots.tech/api/site-content/photos/private')).toBeNull();
    expect(publicImage('https://artrobots.tech/assets/solidoworks.svg')).toContain('solidoworks.svg');
    expect(publicImage('https://example.com/member.jpg')).toBeNull();
  });
  it('does not accept malformed HTTPS, credentials, loopback or local destinations', () => {
    for (const value of ['https:example.com', 'https:///example.com', 'https://me:secret@example.com', 'https://127.0.0.1', 'https://0x7f000001', 'https://[::ffff:127.0.0.1]', 'https://service.internal', 'http://example.com', 'javascript:alert(1)']) expect(publicUrl(value)).toBeNull();
  });
  it('validates real civil dates and all-day exclusive end without Brazil off-by-one', () => {
    expect(() => validateSiteFeed(feed([item({ kind: 'EVENT', startsAt: '2026-02-30T00:00:00Z' })]))).toThrow();
    expect(() => validateSiteFeed(feed([item({ kind: 'EVENT', startsAt: '2026-09-27T10:00:00' })]))).toThrow();
    const event = validateSiteFeed(feed([item({ kind: 'EVENT', startsAt: '2026-09-27T00:00:00Z', allDay: true })])).items[0];
    expect(event.endsAt).toBe('2026-09-28T00:00:00.000Z');
    expect(ended(event, new Date('2026-09-28T01:00:00Z'))).toBe(false);
    expect(ended(event, new Date('2026-09-28T03:00:00Z'))).toBe(true);
    expect(formattedDate(event.startsAt!, true, false)).toContain('27');
  });
  it('initial SSR contains a loading slot without fetching or importing browser state', () => {
    const fetcher = vi.fn<typeof fetch>();
    const html = renderToString(<SiteContent kind="PROJECT" english={false} store={createSiteContentStore(fetcher)} />);
    expect(html).toContain('data-public-content="PROJECT"'); expect(html).toContain('Carregando'); expect(fetcher).not.toHaveBeenCalled();
  });
});

describe('React-owned CMS slots', () => {
  it('shares one anonymous request between all kinds, renders PT/EN, and cleans up', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(feed([
      item(), item({ id: 'competition', kind: 'COMPETITION', title: 'RoboChallenge' }), item({ id: 'partner', kind: 'PARTNERSHIP', title: 'Altium' }),
      item({ id: 'event', kind: 'EVENT', title: 'Treino', startsAt: '2026-09-27T00:00:00Z', allDay: true }),
    ])));
    const store = createSiteContentStore(fetcher);
    const view = render(<><SiteContent kind="PROJECT" english store={store} /><SiteContent kind="COMPETITION" english={false} store={store} /><SiteContent kind="PARTNERSHIP" english={false} store={store} /><SiteContent kind="EVENT" english={false} store={store} /></>);
    await screen.findByRole('heading', { name: 'Combat robot' });
    expect(fetcher).toHaveBeenCalledTimes(1); expect(screen.getByRole('heading', { name: 'RoboChallenge' })).toBeTruthy(); expect(screen.getByRole('heading', { name: 'Altium' })).toBeTruthy(); expect(screen.getByText(/Dia inteiro/)).toBeTruthy();
    const options = fetcher.mock.calls[0][1]!; expect(options.credentials).toBe('omit'); expect(options.cache).toBe('no-store');
    view.unmount(); expect(store.getSnapshot().feed).toBeNull();
  });
  it('preserves focus, handles flip/escape, retains only last public snapshot on errors, and removes withdrawn cards', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(response(feed())).mockResolvedValueOnce(response(feed())).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(response(feed([])));
    const store = createSiteContentStore(fetcher), view = render(<SiteContent kind="PROJECT" english={false} store={store} />);
    const button = await screen.findByRole('button', { name: 'Ler sobre Robô de combate' }); button.focus();
    await act(async () => { await store.refresh(); }); expect(document.activeElement).toBe(button);
    fireEvent.click(button, { detail: 1 }); expect(button.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(button, { key: 'Escape' }); expect(button.getAttribute('aria-expanded')).toBe('false');
    await act(async () => { await store.refresh(); }); expect(screen.getByText(/última publicação recebida/)).toBeTruthy();
    await act(async () => { await store.refresh(); }); expect(view.container.querySelector('[data-entry-id]')).toBeNull(); expect(screen.getByText('Nenhum projeto publicado.')).toBeTruthy();
  });
  it('refreshes on 60-second poll, focus, visibility return and BFCache, without overlap', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => response(feed([]))), store = createSiteContentStore(fetcher);
    render(<SiteContent kind="PROJECT" english={false} store={store} />);
    await act(async () => { await store.refresh(); }); expect(fetcher).toHaveBeenCalledTimes(1);
    await act(async () => { vi.advanceTimersByTime(60000); await store.refresh(); }); expect(fetcher).toHaveBeenCalledTimes(2);
    await act(async () => { window.dispatchEvent(new Event('focus')); await store.refresh(); }); expect(fetcher).toHaveBeenCalledTimes(3);
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); await store.refresh(); }); expect(fetcher).toHaveBeenCalledTimes(4);
    await act(async () => { window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); await store.refresh(); }); expect(fetcher).toHaveBeenCalledTimes(5);
    cleanup(); await act(async () => { vi.advanceTimersByTime(120000); window.dispatchEvent(new Event('focus')); }); expect(fetcher).toHaveBeenCalledTimes(5);
  });
  it('aborts on unmount and prevents a delayed response from a prior mount replacing current data', async () => {
    let resolveOld!: (value: Response) => void;
    const fetcher = vi.fn<typeof fetch>().mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; })).mockResolvedValueOnce(response(feed([])));
    const store = createSiteContentStore(fetcher), view = render(<SiteContent kind="PROJECT" english={false} store={store} />);
    await act(async () => { await Promise.resolve(); });
    const oldSignal = fetcher.mock.calls[0][1]!.signal as AbortSignal; view.unmount(); expect(oldSignal.aborted).toBe(true);
    render(<SiteContent kind="PROJECT" english={false} store={store} />); await screen.findByText('Nenhum projeto publicado.');
    await act(async () => { resolveOld(response(feed())); await Promise.resolve(); }); expect(screen.queryByRole('heading', { name: 'Robô de combate' })).toBeNull(); expect(store.getSnapshot().feed?.items).toHaveLength(0);
  });
});
