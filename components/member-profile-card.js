/* Adapted for the Artrobots website from React Bits ProfileCard, David Haz 2026.
 * Source: https://github.com/DavidHDev/react-bits/tree/5d0c00e7594c898e989b250d022806961f4c8478/src/content/Components/ProfileCard
 * MIT + Commons Clause; full copyright and license: ../THIRD_PARTY_NOTICES.md.
 * Public data and the anchor remain owned by the existing approved directory.
 */
(function (global, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (!global || !global.document) return;
  global.ArtrobotsMemberProfileCard = api;
  const start = () => api.mount(global.document, global);
  if (global.document.readyState === 'loading') global.document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})(typeof window === 'undefined' ? null : window, function () {
  'use strict';
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

  // The reference normalizes the pointer and moves its holographic background
  // between 35% and 65%. Rotation is bounded here for a directory of many cards.
  function pointer(clientX, clientY, rect) {
    const x = clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1);
    const y = clamp((clientY - rect.top) / Math.max(1, rect.height), 0, 1);
    return { x, y, rx: clamp((.5 - y) * 12, -6, 6), ry: clamp((x - .5) * 12, -6, 6) };
  }

  function enhance(card, environment) {
    const { document, window: view, reducedMotion, finePointer, forcedColors } = environment;
    card.classList.add('member-profile-card');
    if (card.parentElement?.classList.contains('grid')) card.parentElement.classList.add('member-profile-grid');
    const photoFrame = card.querySelector('.member-photo')?.parentElement;
    photoFrame?.classList.add('mpc-photo-frame');
    const decorations = ['mpc-shine', 'mpc-glare'].map((className) => {
      const node = document.createElement('span');
      node.className = className;
      node.setAttribute('aria-hidden', 'true');
      card.append(node);
      return node;
    });
    let raf = 0, previousTime = 0, disposed = false, hovered = false, focused = false;
    let current = { x: .5, y: .5, rx: 0, ry: 0 };
    let target = { ...current };
    const allowed = () => !disposed && !document.hidden && !reducedMotion.matches &&
      finePointer.matches && !forcedColors.matches && !document.documentElement.classList.contains('rb-motion-disabled') && card.isConnected && !card.closest('[hidden]');
    const apply = () => {
      const properties = {
        '--mpc-pointer-x': `${(current.x * 100).toFixed(2)}%`,
        '--mpc-pointer-y': `${(current.y * 100).toFixed(2)}%`,
        '--mpc-background-x': `${(35 + current.x * 30).toFixed(2)}%`,
        '--mpc-background-y': `${(35 + current.y * 30).toFixed(2)}%`,
        '--mpc-rotate-x': `${current.rx.toFixed(3)}deg`,
        '--mpc-rotate-y': `${current.ry.toFixed(3)}deg`,
      };
      for (const [key, value] of Object.entries(properties)) card.style.setProperty(key, value);
    };
    const active = () => {
      card.dataset.profileCardActive = (hovered || focused) && !document.hidden ? 'true' : 'false';
    };
    const stop = () => {
      if (raf) view.cancelAnimationFrame(raf);
      raf = 0; previousTime = 0;
    };
    function reset() {
      stop(); hovered = false;
      target = current = { x: .5, y: .5, rx: 0, ry: 0 };
      apply(); active();
    }
    const step = (time) => {
      raf = 0;
      if (!allowed()) { reset(); return; }
      const seconds = previousTime ? clamp((time - previousTime) / 1000, 0, .05) : 1 / 60;
      previousTime = time;
      const easing = 1 - Math.exp(-seconds / .09);
      let delta = 0;
      for (const key of ['x', 'y', 'rx', 'ry']) {
        current[key] += (target[key] - current[key]) * easing;
        delta = Math.max(delta, Math.abs(target[key] - current[key]));
      }
      if (delta < .005) current = { ...target };
      apply();
      if (delta >= .005) raf = view.requestAnimationFrame(step);
      else previousTime = 0;
    };
    const animate = () => {
      if (!allowed()) { reset(); return; }
      if (!raf) raf = view.requestAnimationFrame(step);
    };
    const onPointer = (event) => {
      if (event.pointerType !== 'mouse' || !allowed()) return;
      hovered = true; active();
      target = pointer(event.clientX, event.clientY, card.getBoundingClientRect());
      animate();
    };
    const onLeave = () => {
      hovered = false; active();
      target = { x: .5, y: .5, rx: 0, ry: 0 };
      animate();
    };
    const onFocus = () => { focused = true; active(); };
    const onBlur = () => { focused = false; active(); if (!hovered) onLeave(); };
    const listeners = { pointerenter: onPointer, pointermove: onPointer, pointerleave: onLeave, pointercancel: onLeave, focusin: onFocus, focusout: onBlur };
    for (const [name, handler] of Object.entries(listeners)) card.addEventListener(name, handler);
    apply(); active();
    return {
      reset,
      destroy() {
        disposed = true; stop(); hovered = focused = false; active();
        for (const [name, handler] of Object.entries(listeners)) card.removeEventListener(name, handler);
        for (const node of decorations) node.remove();
        photoFrame?.classList.remove('mpc-photo-frame');
        card.classList.remove('member-profile-card');
        delete card.dataset.profileCardActive;
        for (const key of ['pointer-x', 'pointer-y', 'background-x', 'background-y', 'rotate-x', 'rotate-y']) card.style.removeProperty(`--mpc-${key}`);
      },
    };
  }

  function mount(document, view) {
    const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = view.matchMedia('(hover: hover) and (pointer: fine)');
    const forcedColors = view.matchMedia('(forced-colors: active)');
    const controllers = new Map();
    const environment = { document, window: view, reducedMotion, finePointer, forcedColors };
    const collect = (root) => {
      const cards = [...(root.querySelectorAll?.('.member-card, [data-profile-card]') || [])];
      if (root.matches?.('.member-card, [data-profile-card]')) cards.unshift(root);
      for (const card of cards) if (!controllers.has(card) && card.isConnected) controllers.set(card, enhance(card, environment));
    };
    const resetAll = () => { for (const controller of controllers.values()) controller.reset(); };
    collect(document);
    const observer = new view.MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          for (const [card, controller] of controllers) if (card.closest('[hidden]')) controller.reset();
        } else for (const node of mutation.addedNodes) collect(node);
      }
      for (const [card, controller] of controllers) {
        if (!card.isConnected) { controller.destroy(); controllers.delete(card); }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    document.addEventListener('visibilitychange', resetAll);
    document.addEventListener('artrobots-motion-change', resetAll);
    for (const query of [reducedMotion, finePointer, forcedColors]) query.addEventListener('change', resetAll);
    return {
      destroy() {
        observer.disconnect();
        document.removeEventListener('visibilitychange', resetAll);
        document.removeEventListener('artrobots-motion-change', resetAll);
        for (const query of [reducedMotion, finePointer, forcedColors]) query.removeEventListener('change', resetAll);
        for (const controller of controllers.values()) controller.destroy();
        controllers.clear();
      },
    };
  }
  return Object.freeze({ pointer, enhance, mount });
});
