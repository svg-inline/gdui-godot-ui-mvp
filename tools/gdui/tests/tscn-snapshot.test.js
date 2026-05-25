import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { compileFile } from '../src/index.js';

const CASES = [
  'inventory.gdui.html',
  'main-menu.gdui.html',
  'responsive-grid.gdui.html',
  'settings.gdui.html',
];

test('generated scenes match committed .tscn snapshots', () => {
  for (const fileName of CASES) {
    const inputFile = path.resolve('ui', fileName);
    const result = compileFile(inputFile, null);
    const snapshotFile = path.resolve('scenes', `${result.sceneAst.name}.tscn`);
    const snapshot = fs.readFileSync(snapshotFile, 'utf8');

    assert.equal(
      result.tscn,
      snapshot,
      `${fileName} should compile to ${path.relative(process.cwd(), snapshotFile)}`,
    );
  }
});
