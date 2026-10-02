import { useEffect, type RefObject } from 'react';
import { mountSiteEffects } from '../../effects/site-effects.js';

/** App owns the lifetime. No auto-run scripts and no global duplicate mounts. */
export function useSiteEffects(root: RefObject<HTMLElement | null>, english: boolean) {
  useEffect(() => {
    if (!root.current || typeof window.matchMedia !== 'function') return;
    const effects = mountSiteEffects(root.current, { english });
    return () => effects.destroy();
  }, [root, english]);
}
