// Compatibility with the existing Render build command. New environments may use
// npm ci && npm run build directly; both produce the same locked React artifact.
const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');
for (const args of [['ci'], ['run', 'build']]) {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    cwd: resolve(__dirname, '..'), stdio: 'inherit', shell: process.platform === 'win32',
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
