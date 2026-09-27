const fs = require('node:fs');
const path = require('node:path');
const output = path.join(__dirname, '..', 'dist');
fs.mkdirSync(output, { recursive: true });
const files = ['index.html', 'index-en.html', 'membros.html', 'membros-en.html', 'membro.html', 'membro-en.html', 'style.css', 'identity.css', 'script.js', 'i18n.js', 'assets', 'components', 'zohoverify'];
for (const file of files) fs.cpSync(path.join(__dirname, '..', file), path.join(output, file), { recursive: true });
console.log('Public site exported to dist');
