import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToString } from 'react-dom/server';
import { App } from '../src/App';
import { routes } from '../src/routes';

// Public institutional text is built locally. No API or member data is fetched here.
// Live public approvals are checked by the browser and never baked into the build.
for (const [file, route] of Object.entries(routes)) {
  const path = resolve('dist', file);
  const template = readFileSync(path, 'utf8');
  const rendered = renderToString(<App {...route} />);
  if (!template.includes('<div id="root"></div>')) throw new Error(`Missing root in ${file}`);
  writeFileSync(path, template.replace('<div id="root"></div>', () => `<div id="root">${rendered}</div>`));
}
console.log(`Pre-rendered ${Object.keys(routes).length} public routes without fetching private data.`);
