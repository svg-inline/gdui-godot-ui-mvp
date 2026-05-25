import assert from "node:assert/strict";
import test from "node:test";
import { compileSource, parseMarkup } from "../src/index.js";

test("parses one gd root and preserves attributes", () => {
  const ast = parseMarkup(
    '<gd-screen name="Main"><gd-button text="Play" action="menu.play" /></gd-screen>',
  );
  assert.equal(ast.tag, "gd-screen");
  assert.equal(ast.children[0].attrs.action, "menu.play");
});

test("rejects generic html tags", () => {
  assert.throws(() => parseMarkup("<div></div>"), /Unsupported HTML tag/);
});

test("compiles button action to metadata", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-button name="PlayButton" text="Play" action="menu.play" /></gd-screen>',
  );
  assert.match(result.tscn, /metadata\/action = "menu\.play"/);
  assert.match(
    result.tscn,
    /\[node name="PlayButton" type="Button" parent="\."\]/,
  );
});

test("warns for action names outside the dotted contract", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-button text="Play" action="Play Now" /></gd-screen>',
  );

  assert.match(result.tscn, /metadata\/action = "Play Now"/);
  assert.match(
    result.warnings.join("\n"),
    /action "Play Now" should use dotted lowercase names/,
  );
});

test("exports minimal state and supported bindings as metadata", () => {
  const result = compileSource(`
    <gd-screen name="Main" state="screen">
      <gd-label name="Title" bind:text="screen.title" />
      <gd-button name="Play" bind:disabled="screen.locked" />
    </gd-screen>
  `);

  assert.match(result.tscn, /metadata\/gdui_state = "screen"/);
  assert.match(
    result.tscn,
    /metadata\/gdui_bindings = "\{\\\"text\\\":\\\"screen\.title\\\"\}"/,
  );
  assert.match(
    result.tscn,
    /metadata\/gdui_bindings = "\{\\\"disabled\\\":\\\"screen\.locked\\\"\}"/,
  );
});

test("warns for unsupported bindings", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-label bind:color="screen.color" /></gd-screen>',
  );

  assert.doesNotMatch(result.tscn, /metadata\/gdui_bindings/);
  assert.match(result.warnings.join("\n"), /bind:color is not supported/);
});

test("compiles panel stylebox subresource", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-panel name="Card" background="#111827" radius="12" padding="16" /></gd-screen>',
  );
  assert.match(result.tscn, /\[sub_resource type="StyleBoxFlat"/);
  assert.match(result.tscn, /theme_override_styles\/panel = SubResource/);
});

test("compiles theme resource and card variation without inline stylebox", () => {
  const result = compileSource(
    '<gd-screen name="Main" theme="res://scenes/theme.tres"><gd-card name="Card"><gd-label text="A" /></gd-card></gd-screen>',
  );

  assert.match(
    result.tscn,
    /\[ext_resource type="Theme" path="res:\/\/scenes\/theme\.tres" id="GduiTheme"\]/,
  );
  assert.match(result.tscn, /theme = ExtResource\("GduiTheme"\)/);
  assert.match(result.tscn, /theme_type_variation = &"Card"/);
  assert.doesNotMatch(result.tscn, /theme_override_styles\/panel/);
});

// v0.8 - Componentes de Input

test("gd-input compiles to LineEdit with placeholder and max_length", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-input name="NameInput" placeholder="Enter name..." max-length="32" /></gd-screen>',
  );
  assert.match(
    result.tscn,
    /\[node name="NameInput" type="LineEdit" parent="\."\]/,
  );
  assert.match(result.tscn, /placeholder_text = "Enter name\.\.\."/);
  assert.match(result.tscn, /max_length = 32/);
  assert.match(result.tscn, /focus_mode = 2/);
});

test("gd-input with password=true sets secret = true", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-input name="Pass" password="true" /></gd-screen>',
  );
  assert.match(result.tscn, /secret = true/);
});

test("gd-input with disabled sets editable = false", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-input name="Locked" disabled="true" /></gd-screen>',
  );
  assert.match(result.tscn, /editable = false/);
});

test("gd-option compiles to OptionButton with metadata/options", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-option name="Diff" options="Easy,Normal,Hard" /></gd-screen>',
  );
  assert.match(
    result.tscn,
    /\[node name="Diff" type="OptionButton" parent="\."\]/,
  );
  assert.match(
    result.tscn,
    /metadata\/options = "\[\\\"Easy\\\",\\\"Normal\\\",\\\"Hard\\\"\]"/,
  );
  assert.match(result.tscn, /focus_mode = 2/);
});

test("gd-progress compiles to ProgressBar with range props", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-progress name="Bar" min-value="0" max-value="200" value="75" step="5" /></gd-screen>',
  );
  assert.match(
    result.tscn,
    /\[node name="Bar" type="ProgressBar" parent="\."\]/,
  );
  assert.match(result.tscn, /min_value = 0/);
  assert.match(result.tscn, /max_value = 200/);
  assert.match(result.tscn, /value = 75/);
  assert.match(result.tscn, /step = 5/);
});

test("gd-slider defaults to HSlider", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-slider name="Vol" min-value="0" max-value="100" value="50" /></gd-screen>',
  );
  assert.match(result.tscn, /\[node name="Vol" type="HSlider" parent="\."\]/);
  assert.match(result.tscn, /focus_mode = 2/);
});

test("gd-slider with orientation=vertical compiles to VSlider", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-slider name="VSlide" orientation="vertical" min-value="0" max-value="10" value="5" /></gd-screen>',
  );
  assert.match(
    result.tscn,
    /\[node name="VSlide" type="VSlider" parent="\."\]/,
  );
});

test("gd-texture with res:// path generates ExtResource", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-texture name="Img" src="res://assets/logo.png" /></gd-screen>',
  );
  assert.match(
    result.tscn,
    /\[ext_resource type="Texture2D" path="res:\/\/assets\/logo\.png" id="Texture2D_1"\]/,
  );
  assert.match(result.tscn, /texture = ExtResource\("Texture2D_1"\)/);
  assert.doesNotMatch(result.tscn, /metadata\/source_image/);
});

test("gd-texture with non-res path falls back to metadata with warning", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-texture name="Img" src="assets/logo.png" /></gd-screen>',
  );
  assert.match(result.tscn, /metadata\/source_image = "assets\/logo\.png"/);
  assert.doesNotMatch(result.tscn, /\[ext_resource type="Texture2D"/);
  assert.match(result.warnings.join("\n"), /not a res:\/\/ path/);
});

test("two gd-textures with the same res:// path share one ExtResource", () => {
  const result = compileSource(
    '<gd-screen name="Main"><gd-texture name="A" src="res://img.png" /><gd-texture name="B" src="res://img.png" /></gd-screen>',
  );
  const matches = result.tscn.match(/\[ext_resource type="Texture2D"/g) || [];
  assert.equal(matches.length, 1);
});
