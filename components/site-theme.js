// Shared preference only. Public content and member information are never stored here.
(function (root) {
  const key = 'artrobots_theme';
  const modes = ['dark', 'light', 'system'];
  function resolve(mode, systemDark) { return mode === 'system' ? systemDark ? 'dark' : 'light' : mode === 'light' ? 'light' : 'dark'; }
  function read(storage) { try { const value = (storage ?? root.localStorage).getItem(key); return modes.includes(value) ? value : 'dark'; } catch { return 'dark'; } }
  const api = { key, modes, resolve, read };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ArtrobotsTheme = api;
  if (!root.document) return;
  const media = root.matchMedia?.('(prefers-color-scheme: dark)');
  let mode = read();
  function apply(value) {
    mode = modes.includes(value) ? value : 'dark';
    document.documentElement.dataset.theme = resolve(mode, media?.matches);
    document.documentElement.style.colorScheme = document.documentElement.dataset.theme;
    document.querySelectorAll('[data-theme-select]').forEach((select) => { select.value = mode; });
    root.dispatchEvent(new CustomEvent('artrobots:theme', { detail: document.documentElement.dataset.theme }));
  }
  api.apply = apply;
  apply(mode);
  document.addEventListener('change', (event) => {
    if (!event.target.matches('[data-theme-select]')) return;
    try { root.localStorage.setItem(key, event.target.value); } catch { /* usable without storage */ }
    apply(event.target.value);
  });
  document.addEventListener('DOMContentLoaded', () => apply(mode));
  media?.addEventListener('change', () => { if (mode === 'system') apply(mode); });
  root.addEventListener('storage', (event) => { if (event.key === key) apply(read()); });
})(globalThis);
