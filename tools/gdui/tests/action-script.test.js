import assert from "node:assert/strict";
import test from "node:test";
import { generateActionScript } from "@gdui/godot-exporter";
import { normalizeToSceneAst, parseMarkup } from "@gdui/compiler";

function buildAst(source) {
  return normalizeToSceneAst(parseMarkup(source));
}

test("generates extends Control for gd-screen root", () => {
  const ast = buildAst(
    '<gd-screen name="Main"><gd-label text="Hi" /></gd-screen>',
  );
  const { content } = generateActionScript(ast);
  assert.match(content, /extends Control/);
});

test("generates pass-only _ready when no actions present", () => {
  const ast = buildAst(
    '<gd-screen name="Main"><gd-label text="Hi" /></gd-screen>',
  );
  const { content, actions } = generateActionScript(ast);
  assert.deepEqual(actions, []);
  assert.match(content, /func _ready\(\) -> void:/);
  assert.match(content, /\tpass/);
  assert.doesNotMatch(content, /action_triggered/);
});

test("collects a single action and generates match branch", () => {
  const ast = buildAst(
    '<gd-screen name="Main"><gd-button text="Play" action="menu.play" /></gd-screen>',
  );
  const { content, actions } = generateActionScript(ast);
  assert.deepEqual(actions, ["menu.play"]);
  assert.match(
    content,
    /preload\("res:\/\/addons\/gdui\/runtime\/action_router\.gd"\)/,
  );
  assert.match(
    content,
    /_router\.action_triggered\.connect\(_on_gdui_action\)/,
  );
  assert.match(content, /"menu\.play":/);
  assert.match(content, /pass  # TODO: handle menu\.play/);
});

test("collects multiple actions sorted alphabetically", () => {
  const ast = buildAst(`
    <gd-screen name="Main">
      <gd-button text="Quit" action="menu.quit" />
      <gd-button text="Play" action="menu.play" />
      <gd-button text="Settings" action="menu.settings" />
    </gd-screen>
  `);
  const { actions } = generateActionScript(ast);
  assert.deepEqual(actions, ["menu.play", "menu.quit", "menu.settings"]);
});

test("generates wildcard branch for unhandled actions", () => {
  const ast = buildAst(
    '<gd-screen name="Main"><gd-button text="Play" action="menu.play" /></gd-screen>',
  );
  const { content } = generateActionScript(ast);
  assert.match(content, /push_warning\("GduiActions: unhandled action/);
});

test("sourceName appears in header comment", () => {
  const ast = buildAst(
    '<gd-screen name="Main"><gd-button action="x.y" text="X" /></gd-screen>',
  );
  const { content } = generateActionScript(ast, {
    sourceName: "main-menu.gdui.html",
  });
  assert.match(content, /# Source: main-menu\.gdui\.html/);
});

test("collects actions from nested nodes", () => {
  const ast = buildAst(`
    <gd-screen name="Main">
      <gd-vbox>
        <gd-hbox>
          <gd-button text="A" action="nav.home" />
        </gd-hbox>
        <gd-button text="B" action="nav.back" />
      </gd-vbox>
    </gd-screen>
  `);
  const { actions } = generateActionScript(ast);
  assert.deepEqual(actions, ["nav.back", "nav.home"]);
});

test("deduplicates repeated actions", () => {
  const ast = buildAst(`
    <gd-screen name="Main">
      <gd-button text="A" action="menu.play" />
      <gd-button text="B" action="menu.play" />
    </gd-screen>
  `);
  const { actions } = generateActionScript(ast);
  assert.deepEqual(actions, ["menu.play"]);
});
