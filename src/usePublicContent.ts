import { useCallback, useEffect, useRef, useState } from 'react';
import { origin, transition, validate, type FeedState } from './publicContent';
export function usePublicContent() {
  const [feed, setFeed] = useState<FeedState>({ state: 'loading', snapshot: null });
  const inFlight = useRef(false);
  const generation = useRef(0);
  const refresh = useCallback(async (signal?: AbortSignal) => {
    if (inFlight.current || document.hidden) return;
    const requestGeneration = ++generation.current;
    inFlight.current = true;
    setFeed((prior) => prior.snapshot ? prior : { ...prior, state: 'loading' });
    try {
      const response = await fetch(`${origin}/api/public/site-content`, { credentials: 'omit', cache: 'no-store', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(65000)]) : AbortSignal.timeout(65000) });
      if (!response.ok) throw new Error('Unavailable');
      const snapshot = validate(await response.json());
      if (!signal?.aborted) setFeed((prior) => transition(prior, snapshot));
    } catch {
      if (!signal?.aborted) setFeed((prior) => transition(prior, null, true));
    } finally { if (requestGeneration === generation.current) inFlight.current = false; }
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    let interval: ReturnType<typeof setInterval> | undefined;
    const request = () => { void refresh(abort.signal); };
    const visibility = () => { clearInterval(interval); if (!document.hidden) { request(); interval = setInterval(request, 60000); } };
    visibility(); window.addEventListener('focus', request); document.addEventListener('visibilitychange', visibility);
    return () => { abort.abort(); generation.current++; inFlight.current = false; clearInterval(interval); window.removeEventListener('focus', request); document.removeEventListener('visibilitychange', visibility); };
  }, [refresh]);
  return { ...feed, refresh };
}
