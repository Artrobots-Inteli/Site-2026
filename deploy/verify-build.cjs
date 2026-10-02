const { readFileSync, readdirSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const assert = require('node:assert/strict');
const routes = require('../src/data/public-routes.json');
const root = join(__dirname, '..', 'dist');
// An independent compatibility expectation must catch a missing/renamed entry
// even when build and prerender both consume the same manifest.
const expectedPages = ['index.html', 'index-en.html', 'membros.html', 'membros-en.html', 'membro.html', 'membro-en.html'];
assert.deepEqual(Object.keys(routes).sort(), [...expectedPages].sort(), 'Public entry compatibility changed');
for (const [page, route] of Object.entries(routes)) {
  assert.equal(route.english, page.endsWith('-en.html'));
  const html = readFileSync(join(root, page), 'utf8');
  // React may hoist image preloads before its first rendered element.
  assert.match(html, /<div id="root">(?:\s*<link[^>]*>)*\s*<div class="site-application"/);
  assert.match(html, /type="module"/);
  assert.match(html, /<nav/);
  assert.doesNotMatch(html, /cdn\.tailwindcss|unpkg\.com|feather\.replace|custom-navbar|artrobots-member-directory/);
  assert.match(html, new RegExp(`<html lang="${route.english ? 'en' : 'pt-BR'}"`));
}
for (const path of ['specs', 'tests', 'node_modules', '.git', '.env', 'src', 'package.json']) assert.equal(existsSync(join(root, path)), false, `Private/source path copied: ${path}`);
const names = readdirSync(root);
assert.ok(names.includes('assets') && names.includes('_app'));
console.log('Six pre-rendered React entries and public-only artifact verified.');
