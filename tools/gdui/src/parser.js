import { isSupportedTag } from './components.js';

const VOID_TAGS = new Set(['gd-label', 'gd-button', 'gd-texture', 'gd-spacer']);

export class GduiParseError extends Error {
  constructor(message, position = 0) {
    super(`${message}${position ? ` at ${position}` : ''}`);
    this.name = 'GduiParseError';
    this.position = position;
  }
}

export function parseMarkup(source, options = {}) {
  const input = String(source ?? '').replace(/<!--([\s\S]*?)-->/g, '');
  const root = { type: 'root', children: [] };
  const stack = [root];
  const tokenRe = /<[^>]+>|[^<]+/g;
  let match;

  while ((match = tokenRe.exec(input))) {
    const token = match[0];
    const position = match.index;

    if (!token.startsWith('<')) {
      const value = token.replace(/\s+/g, ' ').trim();
      if (value) {
        stack[stack.length - 1].children.push({ type: 'text', value });
      }
      continue;
    }

    if (/^<!/.test(token)) continue;

    if (/^<\//.test(token)) {
      const tag = token.slice(2, -1).trim().toLowerCase();
      if (!tag) throw new GduiParseError('Closing tag without name', position);
      const current = stack[stack.length - 1];
      if (!current || current.type === 'root') {
        throw new GduiParseError(`Unexpected closing tag </${tag}>`, position);
      }
      if (current.tag !== tag) {
        throw new GduiParseError(`Tag closed out of order: expected </${current.tag}> but received </${tag}>`, position);
      }
      stack.pop();
      continue;
    }

    const selfClosing = /\/\s*>$/.test(token);
    const inner = token.slice(1, token.length - (selfClosing ? 2 : 1)).trim();
    const nameMatch = inner.match(/^([^\s/>]+)/);
    if (!nameMatch) throw new GduiParseError('Opening tag without name', position);

    const tag = nameMatch[1].toLowerCase();
    if (!tag.startsWith('gd-')) {
      throw new GduiParseError(`Unsupported HTML tag <${tag}>. Use documented gd-* tags only.`, position);
    }
    if (!isSupportedTag(tag)) {
      throw new GduiParseError(`Unsupported gd-* tag <${tag}>`, position);
    }

    const rawAttrs = inner.slice(nameMatch[0].length).trim();
    const attrs = parseAttributes(rawAttrs, position);
    const node = { type: 'element', tag, attrs, children: [] };
    stack[stack.length - 1].children.push(node);

    if (!selfClosing && !VOID_TAGS.has(tag)) {
      stack.push(node);
    }
  }

  if (stack.length > 1) {
    const unclosed = stack[stack.length - 1];
    throw new GduiParseError(`Unclosed tag <${unclosed.tag}>`);
  }

  const elements = root.children.filter((child) => child.type === 'element');
  if (elements.length !== 1) {
    throw new GduiParseError(`Expected exactly one root component, found ${elements.length}`);
  }

  if (options.keepText !== true) {
    removeTextNodes(elements[0]);
  }

  return elements[0];
}

export function parseAttributes(raw, basePosition = 0) {
  const attrs = {};
  if (!raw) return attrs;

  const attrRe = /([:@a-zA-Z_][:@a-zA-Z0-9_\-\.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = attrRe.exec(raw))) {
    const key = match[1];
    const value = match[3] ?? match[4] ?? match[5] ?? 'true';
    attrs[key] = value;
  }

  const consumed = Array.from(raw.matchAll(attrRe)).map((m) => m[0]).join('');
  if (raw.trim() && Object.keys(attrs).length === 0 && consumed.length === 0) {
    throw new GduiParseError(`Invalid attribute syntax: ${raw}`, basePosition);
  }

  return attrs;
}

function removeTextNodes(node) {
  node.children = node.children.filter((child) => child.type !== 'text');
  for (const child of node.children) {
    if (child.type === 'element') removeTextNodes(child);
  }
}
