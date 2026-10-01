const { readFileSync, readdirSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const assert = require('node:assert/strict');
const root = join(__dirname, '..', 'dist');
for (const page of ['index', 'index-en', 'membros', 'membros-en', 'membro', 'membro-en']) {
  const html = readFileSync(join(root, `${page}.html`), 'utf8');
  // React may hoist image preloads before its first rendered element.
  assert.match(html, /<div id="root">(?:\s*<link[^>]*>)*\s*<div class="site-application"/);
  assert.match(html, /type="module"/);
  assert.match(html, /<nav/);
  assert.doesNotMatch(html, /cdn\.tailwindcss|unpkg\.com|feather\.replace|custom-navbar|artrobots-member-directory/);
  assert.match(html, new RegExp(`<html lang="${page.endsWith('-en') ? 'en' : 'pt-BR'}"`));
}
for (const path of ['specs', 'tests', 'node_modules', '.git', '.env', 'src', 'package.json']) assert.equal(existsSync(join(root, path)), false, `Private/source path copied: ${path}`);
const names = readdirSync(root);
assert.ok(names.includes('assets') && names.includes('_app'));
console.log('Six pre-rendered React entries and public-only artifact verified.');
