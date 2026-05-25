import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  assertGduiMarkupPath,
  collectMarkupDiagnostics,
  resolveProjectPath,
  toProjectPath,
} from '../../../addons/gdui/server/studio-server.js';
import { compileSource, parseMarkup } from '../src/index.js';

test('studio server resolves paths inside the project root', () => {
  const root = path.resolve('fixture-project');
  const file = resolveProjectPath(root, 'ui/inventory.gdui.html');

  assert.equal(toProjectPath(root, file), 'ui/inventory.gdui.html');
});

test('studio server rejects paths outside the project root', () => {
  const root = path.resolve('fixture-project');

  assert.throws(() => resolveProjectPath(root, '../secret.gdui.html'), /escapes project root/);
});

test('studio server only edits gdui markup files', () => {
  assert.doesNotThrow(() => assertGduiMarkupPath('ui/inventory.gdui.html'));
  assert.throws(() => assertGduiMarkupPath('ui/index.html'), /Only \.gdui\.html/);
});

test('studio diagnostics report unsupported attributes and compiler warnings', () => {
  const diagnostics = collectMarkupDiagnostics(`
    <gd-screen name="Main">
      <gd-button text="Play" action="Play Now" onclick="menu.play" />
    </gd-screen>
  `, { compileSource, parseMarkup });

  assert.equal(diagnostics.ok, true);
  assert.match(
    diagnostics.warnings.map((warning) => warning.message).join('\n'),
    /unsupported attribute "onclick"/,
  );
  assert.match(
    diagnostics.warnings.map((warning) => warning.message).join('\n'),
    /action "Play Now" should use dotted lowercase names/,
  );
});

test('studio diagnostics report parse errors', () => {
  const diagnostics = collectMarkupDiagnostics('<div></div>', { compileSource, parseMarkup });

  assert.equal(diagnostics.ok, false);
  assert.match(diagnostics.errors[0].message, /Unsupported HTML tag <div>/);
});
