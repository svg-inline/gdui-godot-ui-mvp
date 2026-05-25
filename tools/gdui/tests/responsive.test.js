import test from 'node:test';
import assert from 'node:assert/strict';
import { compileSource } from '../src/index.js';

test('normalizes responsive props into scene AST metadata', () => {
  const result = compileSource(`
    <gd-screen name="Responsive">
      <gd-grid name="Items" columns="2" md:columns="3" lg:columns="4" tv:columns="6" />
    </gd-screen>
  `);

  const grid = result.sceneAst.children[0];

  assert.deepEqual(grid.responsive, {
    md: { columns: '3' },
    lg: { columns: '4' },
    tv: { columns: '6' },
  });
  assert.equal(grid.attrs['md:columns'], undefined);
  assert.equal(grid.props.columns, '2');
  assert.equal(
    grid.props['metadata/gdui_responsive'],
    '"{\\"md\\":{\\"columns\\":\\"3\\"},\\"lg\\":{\\"columns\\":\\"4\\"},\\"tv\\":{\\"columns\\":\\"6\\"}}"',
  );
});

test('exports responsive metadata to .tscn', () => {
  const result = compileSource(`
    <gd-screen name="Responsive">
      <gd-label name="Title" text="Title" md:font-size="24" tv:visible="false" />
    </gd-screen>
  `);

  assert.match(result.tscn, /metadata\/gdui_responsive = "\{\\\"md\\\":\{\\\"font-size\\\":\\\"24\\\"\},\\\"tv\\\":\{\\\"visible\\\":\\\"false\\\"\}\}"/);
});
