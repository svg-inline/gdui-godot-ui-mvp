export function toPascalCase(value) {
  return String(value || '')
    .replace(/^gd-/, '')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') || 'Node';
}

export function sanitizeNodeName(value, fallback = 'Node') {
  const raw = String(value || fallback).trim() || fallback;
  const cleaned = raw
    .replace(/[^a-zA-Z0-9_\- ]+/g, '')
    .replace(/\s+/g, '')
    .replace(/^[^a-zA-Z_]+/, '');
  return cleaned || fallback;
}

export function parseNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(String(value).replace('px', '').trim());
  return Number.isFinite(n) ? n : fallback;
}

export function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  const v = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(v)) return true;
  if (['false', '0', 'no', 'off'].includes(v)) return false;
  return fallback;
}

export function parseBox(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return [fallback, fallback, fallback, fallback];
  const parts = String(value)
    .trim()
    .split(/\s+/)
    .map((part) => parseNumber(part, fallback));

  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  return [parts[0], parts[1], parts[2], parts[3]];
}

export function parseHexColor(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const match = raw.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3 || hex.length === 4) {
    hex = hex.split('').map((ch) => ch + ch).join('');
  }
  const hasAlpha = hex.length === 8;
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const a = hasAlpha ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a, raw };
}

export function colorToGodot(value) {
  const c = parseHexColor(value);
  if (!c) return null;
  const f = (n) => Number(n.toFixed(6)).toString();
  return `Color(${f(c.r)}, ${f(c.g)}, ${f(c.b)}, ${f(c.a)})`;
}

export function escapeGodotString(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

export function godotString(value) {
  return `"${escapeGodotString(value)}"`;
}

export function toThemeVariation(value, suffix = '') {
  const base = toPascalCase(value);
  return `${base}${suffix}`;
}

export function cloneWithoutPrivateKeys(value) {
  if (Array.isArray(value)) return value.map(cloneWithoutPrivateKeys);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      if (key.startsWith('_')) continue;
      out[key] = cloneWithoutPrivateKeys(item);
    }
    return out;
  }
  return value;
}
