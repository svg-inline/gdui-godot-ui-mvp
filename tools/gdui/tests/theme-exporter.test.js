import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { compileThemeFile, exportTheme, validateThemeTokens } from '../src/index.js';

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
    spacing: { sm: 8, md: 16, lg: 24 },
    radius: { md: 12, lg: 18 },
    fontSizes: { body: 16, title: 28, button: 16 },
  });

  assert.match(result.content, /^\[gd_resource type="Theme" load_steps=9 format=3\]/);
  assert.match(result.content, /PanelContainer\/styles\/panel = SubResource\("GduiPanel"\)/);
  assert.match(result.content, /Button\/styles\/normal = SubResource\("GduiButton"\)/);
  assert.match(result.content, /Button\/styles\/hover = SubResource\("GduiButtonHover"\)/);
  assert.match(result.content, /Button\/styles\/pressed = SubResource\("GduiButtonPressed"\)/);
  assert.match(result.content, /PrimaryButton\/styles\/hover = SubResource\("GduiPrimaryButtonHover"\)/);
  assert.match(result.content, /PrimaryButton\/base_type = &"Button"/);
  assert.deepEqual(result.warnings, []);
});

test('validates required theme tokens before exporting', () => {
  const validation = validateThemeTokens({
    colors: { surface: 'not-a-color' },
    spacing: { sm: 8 },
    radius: {},
    fontSizes: { body: 16 },
  });

  assert.match(validation.errors.join('\n'), /colors\.surface must be a hex color/);
  assert.match(validation.errors.join('\n'), /colors\.primary is required/);
  assert.match(validation.errors.join('\n'), /spacing\.md is required/);
});

test('committed theme snapshot matches theme.gdui.json', () => {
  const result = compileThemeFile(path.resolve('theme.gdui.json'), null);
  const snapshot = fs.readFileSync(path.resolve('scenes/theme.tres'), 'utf8');

  assert.equal(result.content, snapshot);
});
