#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const candidates = process.platform === 'win32'
  ? ['godot.exe', 'godot', 'godot4']
  : ['godot', 'godot4'];

const logDir = '.godot-smoke-user';
fs.mkdirSync(logDir, { recursive: true });
const scripts = process.argv.slice(2);
if (!scripts.length) scripts.push('tools/godot/smoke_load_scenes.gd');

let lastError = null;
let selectedExecutable = null;

for (const script of scripts) {
  const status = runSmokeScript(script);
  if (status !== 0) process.exit(status);
}

function runSmokeScript(script) {
  const executables = selectedExecutable ? [selectedExecutable] : candidates;

  for (const executable of executables) {
    const result = spawnSync(executable, [
      '--headless',
      '--log-file',
      'res://.godot-smoke-user/godot.log',
      '--path',
      '.',
      '--script',
      script,
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
      return 1;
    }

    selectedExecutable = executable;
    return result.status ?? 1;
  }

  console.error('[gdui-smoke] Godot executable not found. Tried: ' + candidates.join(', '));
  if (lastError) console.error('[gdui-smoke] Last error: ' + lastError.message);
  return 1;
}
