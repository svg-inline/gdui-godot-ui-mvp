import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { compileThemeFile, exportTheme } from '../src/index.js';

test('exports a Godot Theme resource with core variations', () => {
  const result = exportTheme({
    colors: {
      surface: '#111827',
      surfaceAlt: '#1e293b',
      text: '#f8fafc',
      primary: '#38bdf8',
      primaryText: '#020617',
      border: '#334155',
    },
    spacing: { md: 16 },
    radius: { md: 12, lg: 18 },
    fontSizes: { body: 16, button: 16 },
  });

  assert.match(result.content, /^\[gd_resource type="Theme" load_steps=4 format=3\]/);
  assert.match(result.content, /PanelContainer\/styles\/panel = SubResource\("GduiPanel"\)/);
  assert.match(result.content, /Button\/styles\/normal = SubResource\("GduiButton"\)/);
  assert.match(result.content, /PrimaryButton\/base_type = &"Button"/);
  assert.deepEqual(result.warnings, []);
});

test('committed theme snapshot matches theme.gdui.json', () => {
  const result = compileThemeFile(path.resolve('theme.gdui.json'), null);
  const snapshot = fs.readFileSync(path.resolve('scenes/theme.tres'), 'utf8');

  assert.equal(result.content, snapshot);
});
