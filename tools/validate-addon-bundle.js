#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const REQUIRED_ADDON_FILES = [
  "plugin.cfg",
  "plugin.gd",
  "dock.gd",
  "studio_controller.gd",
  "import_plugin.gd",
  "icon.png",
  "compiler/gdui.js",
  "compiler/lib.mjs",
  "server/studio-server.js",
  "runtime/action_router.gd",
  "runtime/binding_runtime.gd",
  "runtime/responsive_runtime.gd",
];

const DEV_ONLY_PATTERNS = [
  /^node_modules\//,
  /^tools\//,
  /^packages\//,
  /^examples\//,
  /^ui\//,
  /^tasks\//,
  /^docs\//,
  /(?:^|\/)\.git(?:\/|$)/,
  /(?:^|\/).*\.test\.[cm]?js$/,
  /(?:^|\/)package-lock\.json$/,
  /(?:^|\/)yarn\.lock$/,
];

export function validateAddonBundle(addonDir = path.resolve("addons/gdui")) {
  const errors = [];

  if (!fs.existsSync(addonDir)) {
    return { ok: false, errors: [`Missing addon directory: ${addonDir}`] };
  }

  for (const required of REQUIRED_ADDON_FILES) {
    const absolute = path.join(addonDir, required);
    if (!fs.existsSync(absolute)) {
      errors.push(`Missing required addon file: ${required}`);
    }
  }

  const iconPath = path.join(addonDir, "icon.png");
  if (fs.existsSync(iconPath)) {
    const size = readPngSize(iconPath);
    if (!size) {
      errors.push("icon.png is not a valid PNG file");
    } else if (size.width !== 128 || size.height !== 128) {
      errors.push(`icon.png must be 128x128, found ${size.width}x${size.height}`);
    }
  }

  for (const file of listFiles(addonDir)) {
    const relative = path.relative(addonDir, file).replaceAll(path.sep, "/");
    if (DEV_ONLY_PATTERNS.some((pattern) => pattern.test(relative))) {
      errors.push(`Development-only file found in addon bundle: ${relative}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  const signature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== signature) {
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function listFiles(root) {
  const out = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(full);
    }
  }

  walk(root);
  return out;
}

function main() {
  const addonDir = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.resolve("addons/gdui");
  const result = validateAddonBundle(addonDir);

  if (!result.ok) {
    for (const error of result.errors) console.error(`[gdui:addon] ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`[gdui:addon] Bundle OK: ${path.relative(process.cwd(), addonDir) || addonDir}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
