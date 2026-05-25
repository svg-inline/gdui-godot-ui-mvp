import fs from 'node:fs';
import path from 'node:path';
import { parseMarkup } from './parser.js';
import { normalizeToSceneAst } from './normalizer.js';
import { exportTscn } from './exporters/tscn.js';
import { cloneWithoutPrivateKeys } from './utils.js';

export { parseMarkup } from './parser.js';
export { normalizeToSceneAst } from './normalizer.js';
export { exportTscn } from './exporters/tscn.js';

export function compileSource(source, options = {}) {
  const markupAst = parseMarkup(source);
  const sceneAst = normalizeToSceneAst(markupAst, options);
  const result = exportTscn(sceneAst, options);

  return {
    markupAst,
    sceneAst,
    tscn: result.content,
    warnings: result.warnings,
  };
}

export function compileFile(inputFile, outputFile, options = {}) {
  const source = fs.readFileSync(inputFile, 'utf8');
  const result = compileSource(source, options);

  if (outputFile) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, result.tscn, 'utf8');
  }

  return result;
}

export function compileDirectory(inputDir, outputDir, options = {}) {
  const files = listGduiFiles(inputDir);
  const results = [];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const result = compileSource(source, options);
    const baseName = `${result.sceneAst.name}.tscn`;
    const outFile = path.join(outputDir, baseName);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, result.tscn, 'utf8');
    results.push({ input: file, output: outFile, ...result });
  }

  return results;
}

export function listGduiFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.gdui\.html$/i.test(entry.name)) out.push(full);
    }
  }

  walk(dir);
  return out.sort();
}

export async function runCli(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const cwd = process.cwd();
  const input = path.resolve(cwd, args.input || args.i || 'ui');
  const output = args.output || args.o ? path.resolve(cwd, args.output || args.o) : null;
  const check = Boolean(args.check);

  if (!fs.existsSync(input)) {
    console.error(`[gdui] Input not found: ${input}`);
    process.exitCode = 1;
    return;
  }

  try {
    if (fs.statSync(input).isDirectory()) {
      const outDir = output || path.resolve(cwd, 'scenes');
      const results = compileDirectory(input, outDir, args);
      for (const item of results) {
        printWarnings(item.warnings);
        console.log(`[gdui] ${path.relative(cwd, item.input)} -> ${path.relative(cwd, item.output)}`);
      }
      if (!results.length) console.warn(`[gdui] No .gdui.html files found in ${input}`);
      return;
    }

    const outFile = output || path.resolve(cwd, 'scenes', path.basename(input).replace(/\.gdui\.html$/i, '.tscn'));
    const result = compileFile(input, check ? null : outFile, args);
    printWarnings(result.warnings);

    if (check) {
      console.log(JSON.stringify({
        markupAst: result.markupAst,
        sceneAst: cloneWithoutPrivateKeys(result.sceneAst),
        warnings: result.warnings,
      }, null, 2));
      return;
    }

    console.log(`[gdui] ${path.relative(cwd, input)} -> ${path.relative(cwd, outFile)}`);
  } catch (error) {
    console.error(`[gdui] ${error.message}`);
    if (args.debug) console.error(error.stack);
    process.exitCode = 1;
  }
}

function printWarnings(warnings = []) {
  for (const warning of warnings) console.warn(`[gdui:warning] ${warning}`);
}

function parseArgs(argv) {
  const args = {};
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
  return args;
}
