import test from 'node:test';
import assert from 'node:assert/strict';
import { compileSource, parseMarkup } from '../src/index.js';

test('parses one gd root and preserves attributes', () => {
  const ast = parseMarkup('<gd-screen name="Main"><gd-button text="Play" action="menu.play" /></gd-screen>');
  assert.equal(ast.tag, 'gd-screen');
  assert.equal(ast.children[0].attrs.action, 'menu.play');
});

test('rejects generic html tags', () => {
  assert.throws(() => parseMarkup('<div></div>'), /Unsupported HTML tag/);
});

test('compiles button action to metadata', () => {
  const result = compileSource('<gd-screen name="Main"><gd-button name="PlayButton" text="Play" action="menu.play" /></gd-screen>');
  assert.match(result.tscn, /metadata\/action = "menu\.play"/);
  assert.match(result.tscn, /\[node name="PlayButton" type="Button" parent="\."\]/);
});

test('compiles panel stylebox subresource', () => {
  const result = compileSource('<gd-screen name="Main"><gd-panel name="Card" background="#111827" radius="12" padding="16" /></gd-screen>');
  assert.match(result.tscn, /\[sub_resource type="StyleBoxFlat"/);
  assert.match(result.tscn, /theme_override_styles\/panel = SubResource/);
});

test('compiles theme resource and card variation without inline stylebox', () => {
  const result = compileSource('<gd-screen name="Main" theme="res://scenes/theme.tres"><gd-card name="Card"><gd-label text="A" /></gd-card></gd-screen>');

  assert.match(result.tscn, /\[ext_resource type="Theme" path="res:\/\/scenes\/theme\.tres" id="GduiTheme"\]/);
  assert.match(result.tscn, /theme = ExtResource\("GduiTheme"\)/);
  assert.match(result.tscn, /theme_type_variation = &"Card"/);
  assert.doesNotMatch(result.tscn, /theme_override_styles\/panel/);
});
