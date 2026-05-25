#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 39147;
const RESPONSIVE_PREFIXES = new Set(["sm", "md", "lg", "xl", "tv"]);
const BINDING_PREFIX = "bind";
const SUPPORTED_BINDINGS = new Set(["text", "visible", "disabled"]);
const SUPPORTED_ATTRS = new Set([
  "name",
  "id",
  "anchor",
  "visible",
  "width",
  "height",
  "min-width",
  "min-height",
  "expand",
  "class",
  "variant",
  "theme",
  "tooltip",
  "action",
  "padding",
  "gap",
  "background",
  "radius",
  "border",
  "border-color",
  "color",
  "font-size",
  "align",
  "wrap",
  "columns",
  "src",
  "image",
  "disabled",
  "text",
  "state",
]);
const GODOT_ONLY_ATTRS = new Set(["action", "theme", "class", "tooltip"]);
const PREVIEW_APPROX_ATTRS = new Set([
  "anchor",
  "expand",
  "padding",
  "gap",
  "background",
  "radius",
  "border",
  "border-color",
  "font-size",
  "columns",
  "wrap",
]);

export function resolveProjectPath(root, requestedPath) {
  const value = String(requestedPath || "").replaceAll("\\", "/");

  if (!value || value.includes("\0") || path.isAbsolute(value)) {
    throw new Error("Invalid project path");
  }

  const resolved = path.resolve(root, value);
  const relative = path.relative(root, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Project path escapes project root");
  }

  return resolved;
}

export function assertGduiMarkupPath(filePath) {
  if (!/\.gdui\.html$/i.test(filePath)) {
    throw new Error("Only .gdui.html files can be edited by Gdui Studio");
  }
}

export function toProjectPath(root, filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

export function collectMarkupDiagnostics(source, compiler) {
  const diagnostics = {
    ok: true,
    errors: [],
    warnings: [],
    comparison: [],
  };

  try {
    const markupAst = compiler.parseMarkup(source);
    collectUnsupportedAttrs(markupAst, diagnostics.warnings);
    const result = compiler.compileSource(source);
    diagnostics.comparison.push(
      ...collectPreviewComparison(markupAst, result.sceneAst),
    );
    for (const warning of result.warnings || []) {
      diagnostics.warnings.push({ kind: "compiler-warning", message: warning });
    }
  } catch (error) {
    diagnostics.ok = false;
    diagnostics.errors.push({
      kind: "compile-error",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return diagnostics;
}

export function collectPreviewComparison(markupAst, sceneAst) {
  const items = [];
  const sceneNodes = [];
  collectSceneNodes(sceneAst, sceneNodes);
  const nodeCount = sceneNodes.length;

  items.push({
    kind: "godot-output",
    message: `Godot output: ${nodeCount} native node(s), root ${sceneAst.type} "${sceneAst.name}".`,
  });

  collectMarkupComparison(markupAst, items);

  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.kind}:${item.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function renderPreviewDocument(source, compiler) {
  const markupAst = compiler.parseMarkup(source);
  const body = renderPreviewNode(markupAst);

  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: file:;"><style>${previewCss()}</style></head><body>${body}</body></html>`;
}

function parseArgs(argv) {
  const args = {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    root: process.cwd(),
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }

  args.port = Number(args.port || DEFAULT_PORT);
  args.root = path.resolve(String(args.root || process.cwd()));
  return args;
}

function listGduiFiles(root) {
  const files = [];
  const sourceDirs = ["ui", "examples"];

  for (const sourceDir of sourceDirs) {
    const absoluteDir = path.join(root, sourceDir);
    if (!fs.existsSync(absoluteDir)) continue;
    walk(absoluteDir);
  }

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.gdui\.html$/i.test(entry.name)) {
        files.push(toProjectPath(root, fullPath));
      }
    }
  }

  return files.sort();
}

async function loadCompiler(root) {
  // Prefer bundled lib (self-contained addon — just addons/gdui/ distributed)
  const bundledPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../compiler/lib.mjs",
  );
  if (fs.existsSync(bundledPath)) {
    return import(pathToFileURL(bundledPath).href);
  }

  // Development fallback: workspace source tree
  const srcPath = path.join(root, "tools/gdui/src/index.js");
  if (!fs.existsSync(srcPath)) {
    throw new Error(
      'Compiler not found. Run "npm run build:addon" to generate addons/gdui/compiler/lib.mjs',
    );
  }
  return import(pathToFileURL(srcPath).href);
}

async function readRequestJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
}

function sendHtml(res, html) {
  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(html);
}

function sendError(res, error) {
  sendJson(res, 400, {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  });
}

async function compileSingle(root, projectPath) {
  const inputFile = resolveProjectPath(root, projectPath);
  assertGduiMarkupPath(inputFile);

  const { compileFile } = await loadCompiler(root);
  const dryRun = compileFile(inputFile, null);
  const outputFile = path.join(root, "scenes", `${dryRun.sceneAst.name}.tscn`);
  const result = compileFile(inputFile, outputFile);

  return {
    input: toProjectPath(root, inputFile),
    output: toProjectPath(root, outputFile),
    warnings: result.warnings,
  };
}

async function compileAll(root) {
  const inputDir = path.join(root, "ui");
  const outputDir = path.join(root, "scenes");
  const { compileDirectory } = await loadCompiler(root);
  const results = compileDirectory(inputDir, outputDir);

  return results.map((item) => ({
    input: toProjectPath(root, item.input),
    output: toProjectPath(root, item.output),
    warnings: item.warnings,
  }));
}

async function diagnoseSource(root, source) {
  const compiler = await loadCompiler(root);
  return collectMarkupDiagnostics(String(source || ""), compiler);
}

async function previewSource(root, source) {
  const compiler = await loadCompiler(root);
  return renderPreviewDocument(String(source || ""), compiler);
}

function collectUnsupportedAttrs(node, warnings) {
  for (const attr of Object.keys(node.attrs || {})) {
    const [prefix, prop] = attr.split(":");
    const isResponsive = Boolean(prop) && RESPONSIVE_PREFIXES.has(prefix);
    const isBinding = Boolean(prop) && prefix === BINDING_PREFIX;
    const attrName = isResponsive ? prop : attr;

    if (isBinding && SUPPORTED_BINDINGS.has(prop)) {
      continue;
    }

    if (!SUPPORTED_ATTRS.has(attrName)) {
      warnings.push({
        kind: "unsupported-attr",
        node: node.tag,
        attr,
        message: `${node.tag}: unsupported attribute "${attr}" is ignored by the Godot exporter.`,
      });
    }
  }

  for (const child of node.children || []) {
    if (child.type === "element") collectUnsupportedAttrs(child, warnings);
  }
}

function collectMarkupComparison(node, items) {
  if (node.tag === "gd-texture") {
    items.push({
      kind: "preview-gap",
      message:
        "gd-texture is metadata-only in the Godot MVP; the web preview cannot confirm the final TextureRect resource.",
    });
  }

  if (node.tag === "gd-button" && node.attrs?.action) {
    items.push({
      kind: "godot-only",
      message: `action="${node.attrs.action}" is exported as metadata/action and handled by action_router.gd, not by the web preview.`,
    });
  }

  for (const attr of Object.keys(node.attrs || {})) {
    const [prefix, prop] = attr.split(":");
    const isResponsive = Boolean(prop) && RESPONSIVE_PREFIXES.has(prefix);
    const isBinding = Boolean(prop) && prefix === BINDING_PREFIX;
    const attrName = isResponsive ? prop : attr;

    if (isResponsive) {
      items.push({
        kind: "runtime-only",
        message: `${attr} is applied by responsive_runtime.gd in Godot; the web preview only approximates breakpoints.`,
      });
    } else if (isBinding) {
      items.push({
        kind: "runtime-only",
        message: `${attr} is exported as gdui_bindings metadata for the future Godot reactive runtime; the web preview does not execute bindings.`,
      });
    } else if (GODOT_ONLY_ATTRS.has(attrName)) {
      items.push({
        kind: "godot-only",
        message: `${attrName} affects Godot metadata/resource behavior and may not be visible in the web preview.`,
      });
    } else if (PREVIEW_APPROX_ATTRS.has(attrName)) {
      items.push({
        kind: "preview-approx",
        message: `${attrName} is approximated in the web preview; verify final layout in the generated .tscn.`,
      });
    }
  }

  for (const child of node.children || []) {
    if (child.type === "element") collectMarkupComparison(child, items);
  }
}

function collectSceneNodes(node, out) {
  out.push(node);
  for (const child of node.children || []) collectSceneNodes(child, out);
}

function renderPreviewNode(node) {
  const attrs = node.attrs || {};
  const children = (node.children || [])
    .filter((child) => child.type === "element")
    .map(renderPreviewNode)
    .join("");

  switch (node.tag) {
    case "gd-screen":
      return `<main class="gd-screen" style="${styleAttr(screenStyles(attrs))}">${children}</main>`;
    case "gd-vbox":
      return `<div class="gd-vbox" style="${styleAttr(layoutStyles(attrs, "column"))}">${children}</div>`;
    case "gd-hbox":
      return `<div class="gd-hbox" style="${styleAttr(layoutStyles(attrs, "row"))}">${children}</div>`;
    case "gd-grid":
      return `<div class="gd-grid" style="${styleAttr(gridStyles(attrs))}">${children}</div>`;
    case "gd-panel":
      return `<section class="gd-panel" style="${styleAttr(panelStyles(attrs))}">${children}</section>`;
    case "gd-card":
      return `<article class="gd-card" style="${styleAttr(panelStyles(attrs))}">${children}</article>`;
    case "gd-label":
      return `<div class="gd-label" style="${styleAttr(labelStyles(attrs))}">${escapeHtml(attrs.text || "")}</div>`;
    case "gd-button":
      return `<button class="gd-button" style="${styleAttr(buttonStyles(attrs))}"${attrs.disabled === "true" ? " disabled" : ""}>${escapeHtml(attrs.text || "")}</button>`;
    case "gd-scroll":
      return `<div class="gd-scroll" style="${styleAttr(sizeStyles(attrs))}">${children}</div>`;
    case "gd-texture":
      return `<div class="gd-texture" style="${styleAttr(sizeStyles(attrs))}">${escapeHtml(attrs.src || attrs.image || "Texture")}</div>`;
    case "gd-spacer":
      return `<div class="gd-spacer" style="${styleAttr(sizeStyles(attrs))}"></div>`;
    case "gd-container":
    case "gd-control":
    default:
      return `<div class="gd-control" style="${styleAttr(containerStyles(attrs))}">${children}</div>`;
  }
}

function previewCss() {
  return [
    "html,body{margin:0;min-height:100%;background:#0f172a;color:#f8fafc;font-family:Inter,system-ui,sans-serif;}",
    "*{box-sizing:border-box;}",
    ".gd-screen{min-height:100vh;padding:32px;background:#0f172a;}",
    ".gd-vbox{display:flex;flex-direction:column;gap:18px;}",
    ".gd-hbox{display:flex;flex-direction:row;align-items:center;gap:16px;}",
    ".gd-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;}",
    ".gd-panel,.gd-card{display:block;background:#111827;border:1px solid #334155;border-radius:12px;padding:18px;}",
    ".gd-label{display:block;color:#f8fafc;}",
    ".gd-button{display:inline-flex;justify-content:center;align-items:center;min-height:42px;padding:0 16px;border:0;border-radius:6px;background:#2f8f83;color:#06110f;font:inherit;font-weight:700;}",
    ".gd-button:disabled{opacity:.55;}",
    ".gd-scroll{display:block;overflow:auto;}",
    ".gd-texture{display:grid;place-items:center;min-height:96px;border:1px dashed #475569;color:#cbd5e1;background:#111827;}",
    ".gd-spacer{display:block;flex:1 1 auto;}",
    "@media (min-width:1025px){.gd-grid{grid-template-columns:repeat(4,minmax(0,1fr));}}",
  ].join("");
}

function screenStyles(attrs) {
  return {
    ...sizeStyles(attrs),
    background: attrs.background,
    padding: attrs.padding ? cssBox(attrs.padding) : undefined,
    display: attrs.visible === "false" ? "none" : undefined,
  };
}

function layoutStyles(attrs, direction) {
  return {
    ...containerStyles(attrs),
    display: attrs.visible === "false" ? "none" : "flex",
    "flex-direction": direction,
    gap: cssNumber(attrs.gap),
  };
}

function gridStyles(attrs) {
  const columns = Math.max(1, Number.parseInt(attrs.columns || "2", 10) || 2);
  return {
    ...containerStyles(attrs),
    display: attrs.visible === "false" ? "none" : "grid",
    "grid-template-columns": `repeat(${columns}, minmax(0, 1fr))`,
    gap: cssNumber(attrs.gap),
  };
}

function panelStyles(attrs) {
  return {
    ...containerStyles(attrs),
    background: attrs.background,
    padding: attrs.padding ? cssBox(attrs.padding) : undefined,
    "border-radius": cssNumber(attrs.radius),
    border: attrs.border
      ? `${stripUnit(attrs.border)}px solid ${attrs["border-color"] || "#334155"}`
      : undefined,
  };
}

function containerStyles(attrs) {
  return {
    ...sizeStyles(attrs),
    padding: attrs.padding ? cssBox(attrs.padding) : undefined,
    display: attrs.visible === "false" ? "none" : undefined,
  };
}

function labelStyles(attrs) {
  return {
    ...sizeStyles(attrs),
    color: attrs.color,
    "font-size": cssNumber(attrs["font-size"]),
    "text-align":
      attrs.align === "center" || attrs.align === "right"
        ? attrs.align
        : undefined,
    "white-space": attrs.wrap === "true" ? "normal" : undefined,
    display: attrs.visible === "false" ? "none" : undefined,
  };
}

function buttonStyles(attrs) {
  return {
    ...sizeStyles(attrs),
    display: attrs.visible === "false" ? "none" : undefined,
  };
}

function sizeStyles(attrs) {
  return {
    width: cssNumber(attrs.width),
    height: cssNumber(attrs.height),
    "min-width": cssNumber(attrs["min-width"]),
    "min-height": cssNumber(attrs["min-height"]),
  };
}

function styleAttr(styles) {
  return Object.entries(styles)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(([key, value]) => `${key}:${escapeHtml(String(value))}`)
    .join(";");
}

function cssBox(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .map(cssNumber)
    .join(" ");
}

function cssNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const raw = stripUnit(value);
  return Number.isFinite(Number(raw)) ? `${raw}px` : undefined;
}

function stripUnit(value) {
  return String(value || "")
    .replace(/px$/i, "")
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createServer(root) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://localhost");

      if (req.method === "GET" && url.pathname === "/") {
        sendHtml(res, renderStudioHtml());
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/status") {
        sendJson(res, 200, { ok: true, root, files: listGduiFiles(root) });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/files") {
        sendJson(res, 200, { ok: true, files: listGduiFiles(root) });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/file") {
        const projectPath = url.searchParams.get("path");
        const filePath = resolveProjectPath(root, projectPath);
        assertGduiMarkupPath(filePath);
        sendJson(res, 200, {
          ok: true,
          path: toProjectPath(root, filePath),
          source: fs.readFileSync(filePath, "utf8"),
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/file") {
        const body = await readRequestJson(req);
        const filePath = resolveProjectPath(root, body.path);
        assertGduiMarkupPath(filePath);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, String(body.source || ""), "utf8");
        sendJson(res, 200, { ok: true, path: toProjectPath(root, filePath) });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/compile") {
        const body = await readRequestJson(req);
        const result = body.all
          ? await compileAll(root)
          : await compileSingle(root, body.path);
        sendJson(res, 200, { ok: true, result });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/diagnostics") {
        const body = await readRequestJson(req);
        const result = await diagnoseSource(root, body.source);
        sendJson(res, 200, { ok: true, result });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/preview") {
        const body = await readRequestJson(req);
        const html = await previewSource(root, body.source);
        sendJson(res, 200, { ok: true, html });
        return;
      }

      sendJson(res, 404, { ok: false, error: "Route not found" });
    } catch (error) {
      sendError(res, error);
    }
  });
}

function renderStudioHtml() {
  return String.raw`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gdui Studio</title>
  <style>
    :root {
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #10131a;
      color: #f7f4ea;
    }

    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: #10131a; }
    button, select, textarea { font: inherit; }

    .app {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      min-height: 100vh;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 18px;
      border-bottom: 1px solid #2f3442;
      background: #171b24;
    }

    h1 {
      margin: 0;
      font-size: 18px;
      line-height: 1.2;
      font-weight: 700;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    select {
      min-width: min(360px, 42vw);
      height: 36px;
      border: 1px solid #3a4050;
      border-radius: 6px;
      background: #10131a;
      color: #f7f4ea;
      padding: 0 10px;
    }

    button {
      height: 36px;
      border: 1px solid #3a4050;
      border-radius: 6px;
      background: #252b36;
      color: #f7f4ea;
      padding: 0 12px;
      cursor: pointer;
    }

    button.primary {
      border-color: #2c796f;
      background: #2f8f83;
      color: #06110f;
      font-weight: 700;
    }

    main {
      display: grid;
      grid-template-columns: minmax(360px, 46%) minmax(0, 1fr);
      min-height: 0;
    }

    .editor, .preview {
      min-height: 0;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
    }

    .preview {
      grid-template-rows: auto minmax(0, 1fr) minmax(120px, auto);
    }

    .panel-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 42px;
      padding: 0 14px;
      border-bottom: 1px solid #2f3442;
      background: #141821;
      color: #d8d2c1;
      font-size: 13px;
    }

    textarea {
      width: 100%;
      height: 100%;
      resize: none;
      border: 0;
      outline: 0;
      padding: 16px;
      background: #0b0e14;
      color: #f7f4ea;
      line-height: 1.5;
      tab-size: 2;
      font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
      font-size: 13px;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: 0;
      background: #0f172a;
    }

    .diagnostics {
      min-height: 120px;
      max-height: 220px;
      overflow: auto;
      border-top: 1px solid #2f3442;
      background: #0b0e14;
      padding: 10px 14px;
      font-size: 13px;
      line-height: 1.45;
    }

    .diagnostic {
      display: block;
      margin: 0 0 6px;
      color: #cbd5e1;
    }

    .diagnostic.error { color: #fca5a5; }
    .diagnostic.warning { color: #facc15; }
    .diagnostic.info { color: #93c5fd; }
    .diagnostic.ok { color: #86efac; }

    output {
      display: block;
      max-width: 460px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #d8d2c1;
      font-size: 13px;
    }

    @media (max-width: 900px) {
      main { grid-template-columns: 1fr; grid-template-rows: minmax(340px, 52vh) minmax(360px, 1fr); }
      header { align-items: flex-start; flex-direction: column; }
      .toolbar { justify-content: flex-start; }
      select { min-width: min(100%, 520px); }
    }
  </style>
</head>
<body>
  <div class="app">
    <header>
      <h1>Gdui Studio</h1>
      <div class="toolbar">
        <select id="fileSelect" aria-label="Gdui file"></select>
        <button id="reloadButton" type="button">Reload</button>
        <button id="saveButton" type="button">Save</button>
        <button id="compileButton" class="primary" type="button">Compile</button>
        <button id="compileAllButton" type="button">Compile all</button>
      </div>
    </header>
    <main>
      <section class="editor">
        <div class="panel-title">
          <span>.gdui.html</span>
          <output id="status"></output>
        </div>
        <textarea id="source" spellcheck="false"></textarea>
      </section>
      <section class="preview">
        <div class="panel-title">
          <span>Preview web auxiliar</span>
          <span>.tscn continua sendo a saida canonica</span>
        </div>
        <iframe id="preview" title="Gdui preview" sandbox=""></iframe>
        <div id="diagnostics" class="diagnostics" aria-live="polite"></div>
      </section>
    </main>
  </div>

  <script>
    const fileSelect = document.querySelector('#fileSelect');
    const source = document.querySelector('#source');
    const preview = document.querySelector('#preview');
    const diagnostics = document.querySelector('#diagnostics');
    const status = document.querySelector('#status');
    const reloadButton = document.querySelector('#reloadButton');
    const saveButton = document.querySelector('#saveButton');
    const compileButton = document.querySelector('#compileButton');
    const compileAllButton = document.querySelector('#compileAllButton');

    let currentPath = '';
    let diagnosticsTimer = 0;
    let previewRequestId = 0;

    function setStatus(message) {
      status.value = message;
    }

    async function requestJson(url, options = {}) {
      const response = await fetch(url, {
        headers: { 'content-type': 'application/json' },
        ...options,
      });
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || 'Request failed');
      return payload;
    }

    async function loadFiles() {
      const payload = await requestJson('/api/files');
      fileSelect.replaceChildren(...payload.files.map((file) => {
        const option = document.createElement('option');
        option.value = file;
        option.textContent = file;
        return option;
      }));

      if (payload.files.length) {
        currentPath = payload.files[0];
        fileSelect.value = currentPath;
        await loadCurrentFile();
      } else {
        setStatus('Nenhum arquivo .gdui.html encontrado em ui/ ou examples/.');
      }
    }

    async function loadCurrentFile() {
      currentPath = fileSelect.value;
      if (!currentPath) return;
      const payload = await requestJson('/api/file?path=' + encodeURIComponent(currentPath));
      source.value = payload.source;
      renderPreview();
      scheduleDiagnostics();
      setStatus('Loaded ' + currentPath);
    }

    async function saveCurrentFile() {
      if (!currentPath) return;
      await requestJson('/api/file', {
        method: 'POST',
        body: JSON.stringify({ path: currentPath, source: source.value }),
      });
      setStatus('Saved ' + currentPath);
      await runDiagnostics();
    }

    async function compileCurrentFile() {
      if (!currentPath) return;
      await saveCurrentFile();
      const payload = await requestJson('/api/compile', {
        method: 'POST',
        body: JSON.stringify({ path: currentPath }),
      });
      setStatus('Compiled to ' + payload.result.output);
      await runDiagnostics();
    }

    async function compileAllFiles() {
      await saveCurrentFile();
      const payload = await requestJson('/api/compile', {
        method: 'POST',
        body: JSON.stringify({ all: true }),
      });
      setStatus('Compiled ' + payload.result.length + ' file(s)');
      await runDiagnostics();
    }

    function renderPreview() {
      const requestId = ++previewRequestId;
      requestJson('/api/preview', {
        method: 'POST',
        body: JSON.stringify({ source: source.value }),
      }).then((payload) => {
        if (requestId === previewRequestId) preview.srcdoc = payload.html;
      }).catch((error) => {
        if (requestId === previewRequestId) {
          preview.srcdoc = '<!doctype html><html><body style="margin:0;padding:16px;background:#0f172a;color:#fca5a5;font-family:system-ui,sans-serif;">' + error.message + '</body></html>';
        }
      });
    }

    function scheduleDiagnostics() {
      window.clearTimeout(diagnosticsTimer);
      diagnosticsTimer = window.setTimeout(() => {
        runDiagnostics().catch((error) => renderDiagnostics({ errors: [{ message: error.message }], warnings: [] }));
      }, 180);
    }

    async function runDiagnostics() {
      const payload = await requestJson('/api/diagnostics', {
        method: 'POST',
        body: JSON.stringify({ source: source.value }),
      });
      renderDiagnostics(payload.result);
    }

    function renderDiagnostics(result) {
      const entries = [];
      for (const error of result.errors || []) entries.push({ type: 'error', message: error.message });
      for (const warning of result.warnings || []) entries.push({ type: 'warning', message: warning.message || warning });
      for (const item of result.comparison || []) entries.push({ type: 'info', message: item.message || item });

      if (!entries.length) {
        diagnostics.replaceChildren(createDiagnostic('ok', 'Sem diagnosticos.'));
        return;
      }

      diagnostics.replaceChildren(...entries.map((entry) => createDiagnostic(entry.type, entry.message)));
    }

    function createDiagnostic(type, message) {
      const item = document.createElement('p');
      item.className = 'diagnostic ' + type;
      item.textContent = message;
      return item;
    }

    fileSelect.addEventListener('change', loadCurrentFile);
    reloadButton.addEventListener('click', loadCurrentFile);
    saveButton.addEventListener('click', saveCurrentFile);
    compileButton.addEventListener('click', compileCurrentFile);
    compileAllButton.addEventListener('click', compileAllFiles);
    source.addEventListener('input', () => {
      renderPreview();
      scheduleDiagnostics();
    });

    loadFiles().catch((error) => setStatus(error.message));
  </script>
</body>
</html>`;
}

export function startStudioServer(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const host = options.host || DEFAULT_HOST;
  const port = Number(options.port || DEFAULT_PORT);
  const server = createServer(root);

  server.listen(port, host, () => {
    console.log(`[gdui-studio] http://${host}:${port}`);
    console.log(`[gdui-studio] project root: ${root}`);
  });

  return server;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const args = parseArgs(process.argv.slice(2));
  startStudioServer(args);
}
