import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { assertGduiMarkupPath, resolveProjectPath, toProjectPath } from '../../../addons/gdui/server/studio-server.js';

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
