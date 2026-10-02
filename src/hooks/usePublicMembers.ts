import { useCallback, useEffect, useRef, useState } from 'react';
import { configuredMembersOrigin, DEFAULT_ARTROLOVE_ORIGIN, loadMembersFeed, type PublicMembersFeed } from '../lib/public-members';

interface MembersState { status: 'loading' | 'ready' | 'error'; feed: PublicMembersFeed | null; origin: string }
/** A fresh public snapshot owns the directory. No persisted private or withdrawn fallback. */
export function usePublicMembers() {
  const [state, setState] = useState<MembersState>({ status: 'loading', feed: null, origin: DEFAULT_ARTROLOVE_ORIGIN });
  const refreshRef = useRef<() => void>(() => {});
  const retry = useCallback(() => refreshRef.current(), []);
  useEffect(() => {
    let disposed = false, sequence = 0, controller: AbortController | null = null;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const refresh = async () => {
      const request = ++sequence;
      controller?.abort(); clearTimeout(timeout);
      const nextController = new AbortController(); controller = nextController;
      timeout = setTimeout(() => nextController.abort(), 10000);
      setState(current => ({ ...current, status: current.feed ? 'ready' : 'loading' }));
      try {
        const origin = configuredMembersOrigin();
        const feed = await loadMembersFeed(origin, nextController.signal);
        if (!disposed && request === sequence) setState({ status: 'ready', feed, origin });
      } catch {
        if (!disposed && request === sequence) setState(current => ({ ...current, status: 'error', feed: null }));
      } finally {
        if (request === sequence) clearTimeout(timeout);
      }
    };
    refreshRef.current = () => { void refresh(); };
    const visibleRefresh = () => { if (!document.hidden) void refresh(); };
    const pageShow = (event: PageTransitionEvent) => { if (event.persisted) visibleRefresh(); };
    const interval = setInterval(visibleRefresh, 60000);
    window.addEventListener('focus', visibleRefresh);
    window.addEventListener('pageshow', pageShow);
    document.addEventListener('visibilitychange', visibleRefresh);
    void refresh();
    return () => {
      disposed = true; ++sequence; controller?.abort(); clearTimeout(timeout); clearInterval(interval);
      refreshRef.current = () => {};
      window.removeEventListener('focus', visibleRefresh);
      window.removeEventListener('pageshow', pageShow);
      document.removeEventListener('visibilitychange', visibleRefresh);
    };
  }, []);
  return { ...state, retry };
}
