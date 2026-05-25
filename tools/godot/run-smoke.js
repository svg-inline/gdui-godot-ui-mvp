#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const candidates = process.platform === 'win32'
  ? ['godot.exe', 'godot', 'godot4']
  : ['godot', 'godot4'];

let lastError = null;
const logDir = '.godot-smoke-user';
fs.mkdirSync(logDir, { recursive: true });

for (const executable of candidates) {
  const result = spawnSync(executable, [
    '--headless',
    '--log-file',
    'res://.godot-smoke-user/godot.log',
    '--path',
    '.',
    '--script',
    'tools/godot/smoke_load_scenes.gd',
  ], {
    encoding: 'utf8',
    stdio: 'inherit',
  });

  if (result.error?.code === 'ENOENT') {
    lastError = result.error;
    continue;
  }

  if (result.error) {
    console.error(`[gdui-smoke] Failed to run ${executable}: ${result.error.message}`);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}

console.error('[gdui-smoke] Godot executable not found. Tried: ' + candidates.join(', '));
if (lastError) console.error('[gdui-smoke] Last error: ' + lastError.message);
process.exit(1);
