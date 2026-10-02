/** Typed boundary around the preserved, licensed Canvas/GLSL engines. */
declare module '*effects/site-effects.js' {
  export function mountSiteEffects(root: HTMLElement, options?: { english?: boolean }): { destroy(): void };
}
