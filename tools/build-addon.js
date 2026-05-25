#!/usr/bin/env node
/**
 * build-addon.js — Empacota o compilador GDUI em addons/gdui/compiler/
 *
 * Saída:
 *   addons/gdui/compiler/gdui.js   — CLI completo (CJS, sem dependências externas)
 *   addons/gdui/compiler/lib.mjs   — Biblioteca para import() dinâmico (ESM)
 *
 * Depois do build, apenas a pasta addons/gdui/ precisa ser distribuída.
 * O usuário instala o plugin no Godot sem precisar de npm install ou tools/.
 *
 * Uso: npm run build:addon
 */
import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "addons/gdui/compiler");

mkdirSync(outDir, { recursive: true });

// ── 1. CLI bundle ─────────────────────────────────────────────────────────────
// Executado pelo plugin via OS.execute("node", [cliPath, "--input", ...])
await build({
  entryPoints: [path.join(root, "tools/gdui/bin/gdui.js")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: path.join(outDir, "gdui.js"),
  logLevel: "info",
});

// ── 2. Library bundle ─────────────────────────────────────────────────────────
// Carregado via import() pelo studio-server.js em tempo de execução
await build({
  entryPoints: [path.join(root, "tools/gdui/src/index.js")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: path.join(outDir, "lib.mjs"),
  logLevel: "info",
});

console.log(
  "\n✓ addons/gdui/compiler/ pronto. Copie addons/gdui/ para qualquer projeto Godot.\n",
);
