/*! React Bits adaptations for the existing Artrobots site.
 * Copyright (c) 2026 David Haz. MIT + Commons Clause. See THIRD_PARTY_NOTICES.md.
 */
import * as shaders from './shaders.js';
import { specularShaders } from './specular-shaders.js';
import { mountTechText } from './tech-text.js';

/** Visual-only lifecycle; React keeps ownership of content and card faces. */
export function mountSiteEffects(root, { english = false } = {}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const forced = matchMedia('(forced-colors: active)');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const cleanups = [];
  const hero = root.querySelector('.brand-hero, .directory-hero');
  let paused = false;
  try { paused = sessionStorage.getItem('artrobots-effects-paused') === 'true'; } catch { /* Storage is optional. */ }
  const allowed = () => !reduced.matches && !forced.matches && !paused;

  // Native WebGL reuses the original shaders without adding a new framework.
  function shaderSurface(container, vertex, fragment, values, version = 1, density = 1, premultipliedAlpha = true) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext(version === 2 ? 'webgl2' : 'webgl', { alpha: true, antialias: false, depth: false, premultipliedAlpha });
    if (!gl) throw new Error('WebGL unavailable');
    const shaders = [], buffers = [];
    const compile = (type, code) => {
      const shader = gl.createShader(type); shaders.push(shader);
      gl.shaderSource(shader, code); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Shader unavailable');
      return shader;
    };
    const program = gl.createProgram();
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader link unavailable');
    } catch (error) { shaders.forEach(shader => gl.deleteShader(shader)); gl.deleteProgram(program); throw error; }
    gl.useProgram(program);
    for (const [name, data] of Object.entries({ position: [-1, -1, 3, -1, -1, 3], uv: [0, 0, 2, 0, 0, 2] })) {
      const location = gl.getAttribLocation(program, name);
      if (location < 0) continue;
      const buffer = gl.createBuffer(); buffers.push(buffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    }
    const locations = Object.fromEntries(Object.keys(values).map(key => [key, gl.getUniformLocation(program, key)]));
    let lost = false;
    const onLost = event => { event.preventDefault(); lost = true; canvas.hidden = true; };
    canvas.addEventListener('webglcontextlost', onLost);
    container.append(canvas);
    function size() {
      const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight);
      const dpr = Math.min(devicePixelRatio || 1, density, 1100 / width);
      canvas.width = Math.ceil(width * dpr); canvas.height = Math.ceil(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      if ('iResolution' in values) values.iResolution = [canvas.width, canvas.height];
      if ('uResolution' in values) values.uResolution = [width, height];
    }
    const observer = new ResizeObserver(size); observer.observe(container); size();
    return {
      canvas,
      draw() {
        if (lost) return;
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        for (const [key, value] of Object.entries(values)) {
          const location = locations[key];
          if (location === null) continue;
          if (typeof value === 'boolean') gl.uniform1i(location, value ? 1 : 0);
          else if (Array.isArray(value) || ArrayBuffer.isView(value)) {
            if (key === 'uPoints' || value.length === 2) gl.uniform2fv(location, value);
            else if (value.length === 3) gl.uniform3fv(location, value);
            else gl.uniform1fv(location, value);
          } else gl.uniform1f(location, value);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      destroy() {
        observer.disconnect(); canvas.removeEventListener('webglcontextlost', onLost);
        buffers.forEach(buffer => gl.deleteBuffer(buffer)); shaders.forEach(shader => gl.deleteShader(shader));
        gl.deleteProgram(program); canvas.remove();
      }
    };
  }

  function visibleLoop(container, draw) {
    let visible = false, raf = 0, last = -100, disposed = false;
    function tick(time) {
      raf = 0;
      if (disposed || !visible || document.hidden) return;
      if (time - last >= 32) { last = time; draw(time); }
      raf = requestAnimationFrame(tick);
    }
    function sync() { cancelAnimationFrame(raf); raf = 0; if (!disposed && visible && !document.hidden) raf = requestAnimationFrame(tick); }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(container); document.addEventListener('visibilitychange', sync);
    return () => { disposed = true; cancelAnimationFrame(raf); observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }

  function gradientWaves(container) {
    const { waveVertex, waveFragment } = shaders;
    const values = { iTime: 0, iResolution: [1, 1], uSpeed: .18, uAmplitude: 2.5, uWaveScale: .6, uWaveRatio: .9, uSwell: 30, uTurbulence: 16, uTilt: 1.11, uZoom: 1, uHeight: 5.5, uFogDepth: 15, uSteps: 32, uBrightness: 1, uOpacity: .8, uGrain: 1, uGrainIntensity: .018, uMouse: [.5, .5], uParallax: .18, uEnableMouse: false, uHorizonColor: rgb('#6d35bd'), uWaveColor: rgb('#98c7ed'), uCrestColor: rgb('#eee2fc') };
    const surface = shaderSurface(container, waveVertex, waveFragment, values, 2, 1);
    const stop = visibleLoop(container, time => { values.iTime = time * .001; surface.draw(); });
    return () => { stop(); surface.destroy(); };
  }

  function dotField(container) {
    const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d'); if (!ctx) return () => {};
    container.append(canvas); let width = 1, height = 1, dots = [], raf = 0;
    const pointer = { x: -9999, y: -9999, lastX: 0, lastY: 0, speed: 0 };
    function draw() {
      raf = 0; if (document.hidden) return;
      ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#7547a8'; ctx.beginPath(); let settling = false;
      pointer.speed *= .92;
      for (const dot of dots) {
        const dx = pointer.x - dot.ax, dy = pointer.y - dot.ay, distance = Math.hypot(dx, dy);
        const push = distance < 210 ? Math.pow(1 - distance / 210, 2) * 32 * Math.min(pointer.speed / 6, 1) : 0;
        const x = dot.ax - Math.cos(Math.atan2(dy, dx)) * push, y = dot.ay - Math.sin(Math.atan2(dy, dx)) * push;
        dot.x += (x - dot.x) * .13; dot.y += (y - dot.y) * .13;
        if (Math.abs(x - dot.x) + Math.abs(y - dot.y) > .06) settling = true;
        ctx.moveTo(dot.x + 1.1, dot.y); ctx.arc(dot.x, dot.y, 1.1, 0, Math.PI * 2);
      }
      ctx.fill(); if (settling || pointer.speed > .02) raf = requestAnimationFrame(draw);
    }
    function wake() { if (!raf && !document.hidden) raf = requestAnimationFrame(draw); }
    function size() {
      width = container.clientWidth; height = container.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = []; const step = innerWidth < 650 ? 25 : 22;
      for (let y = 12; y < height; y += step) for (let x = 12; x < width; x += step) dots.push({ ax: x, ay: y, x, y });
      wake();
    }
    function move(event) {
      if (event.pointerType !== 'mouse') return;
      const box = container.getBoundingClientRect(); pointer.x = event.clientX - box.left; pointer.y = event.clientY - box.top;
      pointer.speed = Math.min(Math.hypot(pointer.lastX - pointer.x, pointer.lastY - pointer.y), 60);
      pointer.lastX = pointer.x; pointer.lastY = pointer.y; wake();
    }
    function leave() { pointer.x = pointer.y = -9999; wake(); }
    function visibility() { cancelAnimationFrame(raf); raf = 0; if (!document.hidden) wake(); }
    const observer = new ResizeObserver(size); observer.observe(container); size();
    hero.addEventListener('pointermove', move, { passive: true }); hero.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); cancelAnimationFrame(raf); hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', visibility); canvas.remove(); };
  }

  function glowCursor() {
    if (!fine.matches) return () => {};
    const container = document.createElement('div'); container.className = 'rb-glow-cursor'; container.setAttribute('aria-hidden', 'true');
    document.body.append(container);
    const points = Array.from({ length: 24 }, () => ({ x: 0, y: 0 })), data = new Float32Array(48);
    const values = { uResolution: [1, 1], uPoints: data, uPointCount: 24, uColor: rgb('#8250c5'), uSecondaryColor: rgb('#72b5d9'), uTrailWidth: 2.7, uTaper: .85, uGlowIntensity: 1.1, uGlowSpread: 1, uHotspot: .4, uBrightness: 1.1, uOpacity: .5, uPulseSpeed: .4, uNoiseStrength: .015, uNormalBlend: 1, uTime: 0, uFade: 0 };
    let surface;
    try { surface = shaderSurface(container, shaders.glowVertex, shaders.glowFragment.replace('#define MAX_POINTS 64', '#define MAX_POINTS 24'), values, 1, .7, false); }
    catch (error) { container.remove(); throw error; }
    const target = { x: 0, y: 0 }; let raf = 0, lastInput = 0, previous = 0, initialized = false;
    function draw(time) {
      raf = 0; if (document.hidden) return;
      const delta = Math.min((time - (previous || time - 16.667)) / 16.667, 3); previous = time;
      points[0].x += (target.x - points[0].x) * (1 - Math.pow(.8, delta)); points[0].y += (target.y - points[0].y) * (1 - Math.pow(.8, delta));
      for (let i = 1; i < points.length; i++) { points[i].x += (points[i - 1].x - points[i].x) * (1 - Math.pow(.64, delta)); points[i].y += (points[i - 1].y - points[i].y) * (1 - Math.pow(.64, delta)); }
      points.forEach((point, index) => { data[index * 2] = point.x; data[index * 2 + 1] = point.y; });
      values.uFade += ((time - lastInput < 400 ? 1 : 0) - values.uFade) * Math.min(1, .14 * delta); values.uTime = time * .001;
      surface.draw(); if (values.uFade > .005 || time - lastInput < 400) raf = requestAnimationFrame(draw);
    }
    function move(event) {
      if (event.pointerType !== 'mouse') return;
      target.x = event.clientX; target.y = innerHeight - event.clientY; lastInput = performance.now();
      if (!initialized) { points.forEach(point => Object.assign(point, target)); initialized = true; }
      if (!raf) { previous = 0; raf = requestAnimationFrame(draw); }
    }
    function reset() { cancelAnimationFrame(raf); raf = 0; values.uFade = 0; surface.draw(); initialized = false; }
    document.addEventListener('pointermove', move, { passive: true }); document.addEventListener('visibilitychange', reset); document.documentElement.addEventListener('pointerleave', reset);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('pointermove', move); document.removeEventListener('visibilitychange', reset); document.documentElement.removeEventListener('pointerleave', reset); surface.destroy(); container.remove(); };
  }

  function specularButton(button) {
    const layer = document.createElement('span'); layer.className = 'rb-specular-fx'; layer.setAttribute('aria-hidden', 'true'); button.append(layer);
    const values = { uCenter: [1, 1], uHalfSize: [1, 1], uRadius: 8.8, uAngle: 2.4, uPx: 1, uLineColor: rgb('#ffffff'), uBaseColor: rgb('#623d8f'), uIntensity: 0, uShineSize: .175, uShineFade: .698, uThickness: 1, uBaseWidth: 1 };
    let surface;
    try { surface = shaderSurface(layer, specularShaders.vertex, specularShaders.fragment, values, 2, 1.5); }
    catch (error) { layer.remove(); throw error; }
    let target = 2.4, angle = 2.4, proximity = 0, bright = 0, raf = 0, previous = 0;
    function draw(time) {
      raf = 0; if (document.hidden) return;
      const delta = Math.min((time - (previous || time - 16.667)) / 1000, .05); previous = time;
      const difference = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angle += difference * (1 - Math.exp(-delta * 7)); bright += (proximity - bright) * (1 - Math.exp(-delta * 8));
      const rect = button.getBoundingClientRect(), dpr = surface.canvas.width / Math.max(layer.clientWidth, 1);
      values.uCenter = [surface.canvas.width / 2, surface.canvas.height / 2]; values.uHalfSize = [rect.width * dpr / 2, rect.height * dpr / 2];
      values.uRadius = Math.min(parseFloat(getComputedStyle(button).borderRadius) || 9, rect.height / 2) * dpr;
      values.uAngle = angle; values.uPx = dpr; values.uIntensity = 1.7 * bright; values.uThickness = 1.25 * dpr; values.uBaseWidth = dpr;
      surface.draw();
      if (Math.abs(difference) > .002 || Math.abs(proximity - bright) > .002) raf = requestAnimationFrame(draw);
    }
    function wake() { if (!raf) { previous = 0; raf = requestAnimationFrame(draw); } }
    function move(event) {
      if (event.pointerType !== 'mouse' || !fine.matches) return;
      const rect = button.getBoundingClientRect(), cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      const distance = Math.hypot(Math.max(rect.left - event.clientX, 0, event.clientX - rect.right), Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom));
      target = distance === 0 ? Math.atan2(2 / rect.height, -2 / rect.width) + (event.clientX - cx) / (rect.width / 2) * .3 + (cy - event.clientY) / (rect.height / 2) * .15 : Math.atan2(cy - event.clientY, event.clientX - cx);
      const p = Math.max(0, 1 - distance / 250); proximity = p * p * (3 - 2 * p); wake();
    }
    const focus = () => { proximity = 1; target = 2.4; wake(); };
    const blur = () => { proximity = 0; wake(); };
    const visibility = () => { cancelAnimationFrame(raf); raf = 0; if (!document.hidden) wake(); };
    const resize = new ResizeObserver(wake); resize.observe(button);
    document.addEventListener('pointermove', move, { passive: true }); document.addEventListener('visibilitychange', visibility); button.addEventListener('focus', focus); button.addEventListener('blur', blur); wake();
    return () => { cancelAnimationFrame(raf); resize.disconnect(); document.removeEventListener('pointermove', move); document.removeEventListener('visibilitychange', visibility); button.removeEventListener('focus', focus); button.removeEventListener('blur', blur); surface.destroy(); layer.remove(); };
  }


  let disposed = false;
  const buttonSelector = '.brand-button, #about a[href="#contact"], #projects .text-center > a, #leadership .text-center > a, #sponsors .text-center > :is(a,button), #contact button[type="submit"], .rb-flip-toggle, .site-entry-link, .site-content-retry';
  const buttons = new Set();
  function collectButtons() {
    root.querySelectorAll(buttonSelector).forEach(button => { button.classList.add('rb-specular'); buttons.add(button); });
    for (const button of buttons) if (!root.contains(button)) buttons.delete(button);
  }
  function specularPointer(event) {
    if (!allowed() || !fine.matches || event.pointerType !== 'mouse') return;
    const button = event.target.closest?.(buttonSelector);
    if (!button || !root.contains(button)) return;
    const box = button.getBoundingClientRect();
    button.style.setProperty('--specular-x', `${clamp((event.clientX - box.left) / Math.max(box.width, 1)) * 100}%`);
    button.style.setProperty('--specular-y', `${clamp((event.clientY - box.top) / Math.max(box.height, 1)) * 100}%`);
  }
  collectButtons(); root.addEventListener('pointermove', specularPointer, { passive: true });
  const buttonObserver = new MutationObserver(collectButtons); buttonObserver.observe(root, { childList: true, subtree: true });
  cleanups.push(() => { buttonObserver.disconnect(); root.removeEventListener('pointermove', specularPointer); for (const button of buttons) { button.style.removeProperty('--specular-x'); button.style.removeProperty('--specular-y'); } buttons.clear(); });

  function scrollReveal() {
    const entries = [...root.querySelectorAll('section[id] > .container > h2, section[id] > .container > p, #aboutText')];
    const active = new Set(); let raf = 0;
    entries.forEach(element => element.classList.add('rb-scroll-reveal'));
    function draw() {
      raf = 0;
      for (const element of active) {
        const progress = allowed() ? clamp((innerHeight * .94 - element.getBoundingClientRect().top) / (innerHeight * .26)) : 1;
        const words = [...element.querySelectorAll('.rb-reveal-word')];
        // Optional word spans are JSX-owned. Never split or replace React text.
        (words.length ? words : [element]).forEach((word, index) => { const p = clamp(progress * 1.7 - index / Math.max(words.length, 1) * .7); word.style.opacity = String(.45 + .55 * p); word.style.filter = `blur(${(1 - p) * 1.4}px)`; });
        element.style.transform = `rotate(${(1 - progress) * .8}deg)`;
      }
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const observer = new IntersectionObserver(items => { items.forEach(entry => { if (entry.isIntersecting) active.add(entry.target); else active.delete(entry.target); }); schedule(); }, { rootMargin: '80px' });
    entries.forEach(element => observer.observe(element)); window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule);
    document.addEventListener('artrobots-motion-change', schedule);
    return () => { observer.disconnect(); cancelAnimationFrame(raf); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); document.removeEventListener('artrobots-motion-change', schedule); entries.forEach(element => { element.classList.remove('rb-scroll-reveal'); for (const node of [element, ...element.querySelectorAll('.rb-reveal-word')]) { node.style.removeProperty('opacity'); node.style.removeProperty('filter'); node.style.removeProperty('transform'); } }); };
  }
  cleanups.push(scrollReveal());

  let ambient = [], pause;
  const heroLayers = [];
  if (hero) {
    for (const kind of ['waves', 'dots']) {
      const layer = document.createElement('div'); layer.className = `rb-hero-${kind}`; layer.setAttribute('aria-hidden', 'true'); layer.dataset.effectOwned = 'true'; hero.prepend(layer); heroLayers.push(layer);
    }
    const actions = hero.querySelector('.brand-hero-actions') || hero.querySelector('.container');
    if (actions) {
      // A dedicated effect-owned slot keeps this optional control isolated.
      const controls = document.createElement('div'); controls.className = 'rb-effect-controls';
      pause = document.createElement('button'); pause.type = 'button'; pause.className = 'rb-motion-toggle'; controls.append(pause); actions.append(controls);
      const toggle = () => { paused = !paused; try { sessionStorage.setItem('artrobots-effects-paused', String(paused)); } catch { /* Optional persistence. */ } configure(); };
      pause.addEventListener('click', toggle); cleanups.push(() => { pause.removeEventListener('click', toggle); controls.remove(); });
    }
  }
  function clearAmbient() { ambient.forEach(stop => stop()); ambient = []; }
  function configure() {
    if (disposed) return;
    clearAmbient();
    document.documentElement.classList.toggle('rb-motion-disabled', !allowed());
    if (pause) { pause.hidden = reduced.matches || forced.matches; pause.setAttribute('aria-pressed', String(paused)); pause.textContent = english ? (paused ? 'Resume effects' : 'Pause effects') : (paused ? 'Ativar efeitos' : 'Pausar efeitos'); }
    document.dispatchEvent(new Event('artrobots-motion-change'));
    if (!allowed()) return;
    const factories = [glowCursor];
    root.querySelectorAll('.brand-hero-actions .brand-button').forEach(button => factories.push(() => specularButton(button)));
    if (hero) {
      factories.push(() => gradientWaves(heroLayers[0]), () => dotField(heroLayers[1]));
      const title = hero.querySelector('#home-title');
      if (title && fine.matches) factories.push(() => mountTechText(title));
    }
    factories.forEach(factory => { try { const stop = factory(); if (typeof stop === 'function') ambient.push(stop); } catch { /* Readable text and static backgrounds survive unsupported WebGL. */ } });
  }
  function pageHide() { clearAmbient(); }
  function pageShow(event) { if (event.persisted) configure(); }
  for (const query of [reduced, fine, forced]) query.addEventListener('change', configure);
  window.addEventListener('pagehide', pageHide); window.addEventListener('pageshow', pageShow);
  configure();
  return { destroy() {
    if (disposed) return; disposed = true; clearAmbient(); cleanups.forEach(stop => stop()); heroLayers.forEach(layer => layer.remove());
    for (const query of [reduced, fine, forced]) query.removeEventListener('change', configure);
    window.removeEventListener('pagehide', pageHide); window.removeEventListener('pageshow', pageShow);
    document.documentElement.classList.remove('rb-motion-disabled');
  } };
}
