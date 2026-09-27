import { StrictMode, useRef, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useSiteEffects } from '../src/hooks/useSiteEffects';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
function Probe() {
  const root = useRef<HTMLDivElement>(null), [label, setLabel] = useState('Texto original');
  useSiteEffects(root, false);
  return <div ref={root}><section className="brand-hero"><div className="container"><h1 id="home-title"><span>{label}</span></h1><div className="brand-hero-actions"><button className="brand-button" onClick={() => setLabel('Texto atualizado')}>Atualizar</button></div></div></section></div>;
}
function observers() {
  const disconnected = vi.fn();
  class Observer { observe() {} unobserve() {} disconnect() { disconnected(); } }
  vi.stubGlobal('IntersectionObserver', Observer); vi.stubGlobal('ResizeObserver', Observer);
  return disconnected;
}
it('owns a single effect lifecycle in StrictMode and leaves React text and controls intact', () => {
  const disconnected = observers();
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('reduced-motion'), addEventListener() {}, removeEventListener() {} })));
  const view = render(<StrictMode><Probe /></StrictMode>);
  expect(view.container.querySelectorAll('.rb-hero-waves')).toHaveLength(1); expect(view.container.querySelectorAll('.rb-hero-dots')).toHaveLength(1); expect(view.container.querySelectorAll('.rb-motion-toggle')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Atualizar' })); expect(screen.getByRole('heading', { name: 'Texto atualizado' })).toBeTruthy();
  expect(view.container.querySelectorAll('#home-title span')).toHaveLength(1);
  view.unmount(); expect(document.querySelector('.rb-glow-cursor')).toBeNull(); expect(document.documentElement.classList.contains('rb-motion-disabled')).toBe(false); expect(disconnected).toHaveBeenCalled();
});
it('keeps readable content and removes failed shader layers when WebGL is unavailable', () => {
  observers();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
  const view = render(<Probe />);
  expect(screen.getByRole('heading', { name: 'Texto original' })).toBeTruthy();
  expect(view.container.querySelectorAll('canvas')).toHaveLength(0); expect(view.container.querySelectorAll('.rb-specular-fx')).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: 'Pausar efeitos' })); expect(screen.getByRole('button', { name: 'Ativar efeitos' })).toBeTruthy();
  view.unmount(); expect(document.querySelector('.rb-glow-cursor')).toBeNull();
});
