#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 39147;
const RESPONSIVE_PREFIXES = new Set(['sm', 'md', 'lg', 'xl', 'tv']);
const SUPPORTED_ATTRS = new Set([
  'name',
  'id',
  'anchor',
  'visible',
  'width',
  'height',
  'min-width',
  'min-height',
  'expand',
  'class',
  'variant',
  'theme',
  'tooltip',
  'action',
  'padding',
  'gap',
  'background',
  'radius',
  'border',
  'border-color',
  'color',
  'font-size',
  'align',
  'wrap',
  'columns',
  'src',
  'image',
  'disabled',
  'text',
]);

export function resolveProjectPath(root, requestedPath) {
  const value = String(requestedPath || '').replaceAll('\\', '/');

  if (!value || value.includes('\0') || path.isAbsolute(value)) {
    throw new Error('Invalid project path');
  }

  const resolved = path.resolve(root, value);
  const relative = path.relative(root, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Project path escapes project root');
  }

  return resolved;
}

export function assertGduiMarkupPath(filePath) {
  if (!/\.gdui\.html$/i.test(filePath)) {
    throw new Error('Only .gdui.html files can be edited by Gdui Studio');
  }
}

export function toProjectPath(root, filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, '/');
}

export function collectMarkupDiagnostics(source, compiler) {
  const diagnostics = {
    ok: true,
    errors: [],
    warnings: [],
  };

  try {
    const markupAst = compiler.parseMarkup(source);
    collectUnsupportedAttrs(markupAst, diagnostics.warnings);
    const result = compiler.compileSource(source);
    for (const warning of result.warnings || []) {
      diagnostics.warnings.push({ kind: 'compiler-warning', message: warning });
    }
  } catch (error) {
    diagnostics.ok = false;
    diagnostics.errors.push({
      kind: 'compile-error',
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return diagnostics;
}

function parseArgs(argv) {
  const args = {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    root: process.cwd(),
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
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
  const sourceDirs = ['ui', 'examples'];

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
  const compilerPath = path.join(root, 'tools/gdui/src/index.js');
  if (!fs.existsSync(compilerPath)) {
    throw new Error(`Compiler not found: ${compilerPath}`);
  }

  return import(pathToFileURL(compilerPath).href);
}

async function readRequestJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(body);
}

function sendHtml(res, html) {
  res.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
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
  const outputFile = path.join(root, 'scenes', `${dryRun.sceneAst.name}.tscn`);
  const result = compileFile(inputFile, outputFile);

  return {
    input: toProjectPath(root, inputFile),
    output: toProjectPath(root, outputFile),
    warnings: result.warnings,
  };
}

async function compileAll(root) {
  const inputDir = path.join(root, 'ui');
  const outputDir = path.join(root, 'scenes');
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
  return collectMarkupDiagnostics(String(source || ''), compiler);
}

function collectUnsupportedAttrs(node, warnings) {
  for (const attr of Object.keys(node.attrs || {})) {
    const [prefix, prop] = attr.split(':');
    const isResponsive = Boolean(prop) && RESPONSIVE_PREFIXES.has(prefix);
    const attrName = isResponsive ? prop : attr;

    if (!SUPPORTED_ATTRS.has(attrName)) {
      warnings.push({
        kind: 'unsupported-attr',
        node: node.tag,
        attr,
        message: `${node.tag}: unsupported attribute "${attr}" is ignored by the Godot exporter.`,
      });
    }
  }

  for (const child of node.children || []) {
    if (child.type === 'element') collectUnsupportedAttrs(child, warnings);
  }
}

function createServer(root) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://localhost');

      if (req.method === 'GET' && url.pathname === '/') {
        sendHtml(res, renderStudioHtml());
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/status') {
        sendJson(res, 200, { ok: true, root, files: listGduiFiles(root) });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/files') {
        sendJson(res, 200, { ok: true, files: listGduiFiles(root) });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/file') {
        const projectPath = url.searchParams.get('path');
        const filePath = resolveProjectPath(root, projectPath);
        assertGduiMarkupPath(filePath);
        sendJson(res, 200, {
          ok: true,
          path: toProjectPath(root, filePath),
          source: fs.readFileSync(filePath, 'utf8'),
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/file') {
        const body = await readRequestJson(req);
        const filePath = resolveProjectPath(root, body.path);
        assertGduiMarkupPath(filePath);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, String(body.source || ''), 'utf8');
        sendJson(res, 200, { ok: true, path: toProjectPath(root, filePath) });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/compile') {
        const body = await readRequestJson(req);
        const result = body.all ? await compileAll(root) : await compileSingle(root, body.path);
        sendJson(res, 200, { ok: true, result });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/diagnostics') {
        const body = await readRequestJson(req);
        const result = await diagnoseSource(root, body.source);
        sendJson(res, 200, { ok: true, result });
        return;
      }

      sendJson(res, 404, { ok: false, error: 'Route not found' });
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
      preview.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \\'none\\'; style-src \\'unsafe-inline\\'; img-src data: file:;"><style>' + previewCss() + '</style></head><body>' + source.value + '</body></html>';
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

    function previewCss() {
      return [
        'body{margin:0;font-family:Inter,system-ui,sans-serif;background:#0f172a;color:#f8fafc;}',
        'gd-screen,gd-vbox,gd-hbox,gd-panel,gd-card,gd-grid,gd-label,gd-button,gd-scroll,gd-texture,gd-spacer{box-sizing:border-box;}',
        'gd-screen{min-height:100vh;display:block;padding:32px;background:#0f172a;}',
        'gd-vbox{display:flex;flex-direction:column;gap:18px;}',
        'gd-hbox{display:flex;align-items:center;gap:16px;}',
        'gd-panel,gd-card{display:block;background:#111827;border:1px solid #334155;border-radius:12px;padding:18px;}',
        'gd-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;}',
        'gd-label{display:block;color:#f8fafc;}',
        'gd-button{display:inline-flex;justify-content:center;align-items:center;min-height:42px;padding:0 16px;border-radius:6px;background:#2f8f83;color:#06110f;font-weight:700;}',
        'gd-scroll{display:block;overflow:auto;}',
        'gd-spacer{display:block;flex:1 1 auto;}',
        '@media (min-width:1025px){gd-grid{grid-template-columns:repeat(4,minmax(0,1fr));}}'
      ].join('');
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parseArgs(process.argv.slice(2));
  startStudioServer(args);
}
