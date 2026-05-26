import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  assertGduiMarkupPath,
  collectMarkupDiagnostics,
  renderPreviewDocument,
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
    /unsupported attribute "onclick".*Use action="domain\.intent"/,
  );
  assert.match(
    diagnostics.warnings.map((warning) => warning.message).join('\n'),
    /action "Play Now" should use dotted lowercase names/,
  );
  assert.match(
    diagnostics.comparison.map((item) => item.message).join('\n'),
    /Godot output: .* native node/,
  );
});

test('studio diagnostics suggest Godot alternatives for unsupported props', () => {
  const diagnostics = collectMarkupDiagnostics(`
    <gd-screen name="Main">
      <gd-label text="Docs" style="color:red" href="/docs" />
    </gd-screen>
  `, { compileSource, parseMarkup });

  const warnings = diagnostics.warnings.map((warning) => warning.message).join('\n');
  assert.match(warnings, /style.*Use supported props/);
  assert.match(warnings, /href.*Use a gd-button action/);
});

test('studio diagnostics report parse errors', () => {
  const diagnostics = collectMarkupDiagnostics('<div></div>', { compileSource, parseMarkup });

  assert.equal(diagnostics.ok, false);
  assert.match(diagnostics.errors[0].message, /Unsupported HTML tag <div>/);
});

test('studio diagnostics compare web preview with Godot-only behavior', () => {
  const diagnostics = collectMarkupDiagnostics(`
    <gd-screen name="Main" theme="res://scenes/theme.tres">
      <gd-grid columns="2" lg:columns="4">
        <gd-button text="Play" action="menu.play" bind:disabled="screen.locked" />
        <gd-list items="inventory.items"><gd-label text="Item" /></gd-list>
        <gd-texture src="res://icon.svg" />
      </gd-grid>
    </gd-screen>
  `, { compileSource, parseMarkup });

  const comparison = diagnostics.comparison.map((item) => item.message).join('\n');
  assert.match(comparison, /theme affects Godot metadata\/resource behavior/);
  assert.match(comparison, /lg:columns is applied by responsive_runtime\.gd/);
  assert.match(comparison, /action="menu\.play" is exported as metadata\/action/);
  assert.match(comparison, /bind:disabled is exported as gdui_bindings metadata/);
  assert.match(comparison, /gd-list exports native container nodes plus metadata\/gdui_list/);
  assert.match(comparison, /gd-texture is metadata-only/);
});

test('studio preview renders gd-* markup as safe html approximation', () => {
  const html = renderPreviewDocument(`
    <gd-screen name="Main" background="#101820">
      <gd-grid columns="3" gap="12">
        <gd-label text="Title & More" font-size="24" />
        <gd-button text="Play" min-height="48" />
      </gd-grid>
    </gd-screen>
  `, { parseMarkup });

  assert.match(html, /class="gd-screen"/);
  assert.match(html, /background:#101820/);
  assert.match(html, /grid-template-columns:repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(html, /Title &amp; More/);
  assert.doesNotMatch(html, /Title & More/);
});
