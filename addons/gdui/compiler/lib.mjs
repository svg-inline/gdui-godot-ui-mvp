// tools/gdui/src/index.js
import fs2 from "node:fs";
import path2 from "node:path";

// packages/compiler/src/components.js
var SUPPORTED_TAGS = /* @__PURE__ */ new Map([
  ["gd-screen", { type: "Control", defaultName: "Screen" }],
  ["gd-control", { type: "Control", defaultName: "Control" }],
  ["gd-container", { type: "MarginContainer", defaultName: "Container" }],
  ["gd-vbox", { type: "VBoxContainer", defaultName: "VBox" }],
  ["gd-hbox", { type: "HBoxContainer", defaultName: "HBox" }],
  ["gd-panel", { type: "PanelContainer", defaultName: "Panel", styled: true }],
  ["gd-card", { type: "PanelContainer", defaultName: "Card", styled: true }],
  ["gd-label", { type: "Label", defaultName: "Label" }],
  ["gd-button", { type: "Button", defaultName: "Button" }],
  ["gd-input", { type: "LineEdit", defaultName: "Input" }],
  ["gd-option", { type: "OptionButton", defaultName: "Option" }],
  ["gd-progress", { type: "ProgressBar", defaultName: "Progress" }],
  ["gd-slider", { type: "HSlider", defaultName: "Slider" }],
  ["gd-scroll", { type: "ScrollContainer", defaultName: "Scroll" }],
  ["gd-grid", { type: "GridContainer", defaultName: "Grid" }],
  ["gd-texture", { type: "TextureRect", defaultName: "Texture" }],
  ["gd-spacer", { type: "Control", defaultName: "Spacer" }]
]);
var RESPONSIVE_BREAKPOINTS = /* @__PURE__ */ new Set(["sm", "md", "lg", "xl", "tv"]);
function getComponent(tag) {
  return SUPPORTED_TAGS.get(String(tag).toLowerCase());
}
function isSupportedTag(tag) {
  return SUPPORTED_TAGS.has(String(tag).toLowerCase());
}

// packages/compiler/src/parser.js
var VOID_TAGS = /* @__PURE__ */ new Set([
  "gd-label",
  "gd-button",
  "gd-input",
  "gd-option",
  "gd-progress",
  "gd-slider",
  "gd-texture",
  "gd-spacer"
]);
var GduiParseError = class extends Error {
  constructor(message, position = 0) {
    super(`${message}${position ? ` at ${position}` : ""}`);
    this.name = "GduiParseError";
    this.position = position;
  }
};
function parseMarkup(source, options = {}) {
  const input = String(source ?? "").replace(/<!--([\s\S]*?)-->/g, "");
  const root = { type: "root", children: [] };
  const stack = [root];
  const tokenRe = /<[^>]+>|[^<]+/g;
  let match;
  while (match = tokenRe.exec(input)) {
    const token = match[0];
    const position = match.index;
    if (!token.startsWith("<")) {
      const value = token.replace(/\s+/g, " ").trim();
      if (value) {
        stack[stack.length - 1].children.push({ type: "text", value });
      }
      continue;
    }
    if (/^<!/.test(token)) continue;
    if (/^<\//.test(token)) {
      const tag2 = token.slice(2, -1).trim().toLowerCase();
      if (!tag2) throw new GduiParseError("Closing tag without name", position);
      const current = stack[stack.length - 1];
      if (!current || current.type === "root") {
        throw new GduiParseError(`Unexpected closing tag </${tag2}>`, position);
      }
      if (current.tag !== tag2) {
        throw new GduiParseError(
          `Tag closed out of order: expected </${current.tag}> but received </${tag2}>`,
          position
        );
      }
      stack.pop();
      continue;
    }
    const selfClosing = /\/\s*>$/.test(token);
    const inner = token.slice(1, token.length - (selfClosing ? 2 : 1)).trim();
    const nameMatch = inner.match(/^([^\s/>]+)/);
    if (!nameMatch)
      throw new GduiParseError("Opening tag without name", position);
    const tag = nameMatch[1].toLowerCase();
    if (!tag.startsWith("gd-")) {
      throw new GduiParseError(
        `Unsupported HTML tag <${tag}>. Use documented gd-* tags only.`,
        position
      );
    }
    if (!isSupportedTag(tag)) {
      throw new GduiParseError(`Unsupported gd-* tag <${tag}>`, position);
    }
    const rawAttrs = inner.slice(nameMatch[0].length).trim();
    const attrs = parseAttributes(rawAttrs, position);
    const node = { type: "element", tag, attrs, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!selfClosing && !VOID_TAGS.has(tag)) {
      stack.push(node);
    }
  }
  if (stack.length > 1) {
    const unclosed = stack[stack.length - 1];
    throw new GduiParseError(`Unclosed tag <${unclosed.tag}>`);
  }
  const elements = root.children.filter((child) => child.type === "element");
  if (elements.length !== 1) {
    throw new GduiParseError(
      `Expected exactly one root component, found ${elements.length}`
    );
  }
  if (options.keepText !== true) {
    removeTextNodes(elements[0]);
  }
  return elements[0];
}
function parseAttributes(raw, basePosition = 0) {
  const attrs = {};
  if (!raw) return attrs;
  const attrRe = /([:@a-zA-Z_][:@a-zA-Z0-9_\-\.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while (match = attrRe.exec(raw)) {
    const key = match[1];
    const value = match[3] ?? match[4] ?? match[5] ?? "true";
    attrs[key] = value;
  }
  const consumed = Array.from(raw.matchAll(attrRe)).map((m) => m[0]).join("");
  if (raw.trim() && Object.keys(attrs).length === 0 && consumed.length === 0) {
    throw new GduiParseError(`Invalid attribute syntax: ${raw}`, basePosition);
  }
  return attrs;
}
function removeTextNodes(node) {
  node.children = node.children.filter((child) => child.type !== "text");
  for (const child of node.children) {
    if (child.type === "element") removeTextNodes(child);
  }
}

// packages/compiler/src/utils.js
function toPascalCase(value) {
  return String(value || "").replace(/^gd-/, "").split(/[^a-zA-Z0-9]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("") || "Node";
}
function sanitizeNodeName(value, fallback = "Node") {
  const raw = String(value || fallback).trim() || fallback;
  const cleaned = raw.replace(/[^a-zA-Z0-9_\- ]+/g, "").replace(/\s+/g, "").replace(/^[^a-zA-Z_]+/, "");
  return cleaned || fallback;
}
function parseNumber(value, fallback = null) {
  if (value === void 0 || value === null || value === "") return fallback;
  const n = Number(String(value).replace("px", "").trim());
  return Number.isFinite(n) ? n : fallback;
}
function parseBoolean(value, fallback = false) {
  if (value === void 0 || value === null || value === "") return fallback;
  const v = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(v)) return true;
  if (["false", "0", "no", "off"].includes(v)) return false;
  return fallback;
}
function parseBox(value, fallback = 0) {
  if (value === void 0 || value === null || value === "") return [fallback, fallback, fallback, fallback];
  const parts = String(value).trim().split(/\s+/).map((part) => parseNumber(part, fallback));
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  return [parts[0], parts[1], parts[2], parts[3]];
}
function parseHexColor(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const match = raw.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3 || hex.length === 4) {
    hex = hex.split("").map((ch) => ch + ch).join("");
  }
  const hasAlpha = hex.length === 8;
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const a = hasAlpha ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a, raw };
}
function colorToGodot(value) {
  const c = parseHexColor(value);
  if (!c) return null;
  const f = (n) => Number(n.toFixed(6)).toString();
  return `Color(${f(c.r)}, ${f(c.g)}, ${f(c.b)}, ${f(c.a)})`;
}
function escapeGodotString(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
}
function godotString(value) {
  return `"${escapeGodotString(value)}"`;
}
function toThemeVariation(value, suffix = "") {
  const base = toPascalCase(value);
  return `${base}${suffix}`;
}
function cloneWithoutPrivateKeys(value) {
  if (Array.isArray(value)) return value.map(cloneWithoutPrivateKeys);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      if (key.startsWith("_")) continue;
      out[key] = cloneWithoutPrivateKeys(item);
    }
    return out;
  }
  return value;
}

// packages/compiler/src/normalizer.js
var SUPPORTED_BINDINGS = /* @__PURE__ */ new Set(["text", "visible", "disabled"]);
function normalizeToSceneAst(markupAst, options = {}) {
  const counters = /* @__PURE__ */ new Map();
  const warnings = [];
  function nextName(component, attrs) {
    const explicit = attrs.name || attrs.id;
    if (explicit) return sanitizeNodeName(explicit, component.defaultName);
    const count = (counters.get(component.defaultName) || 0) + 1;
    counters.set(component.defaultName, count);
    return count === 1 ? component.defaultName : `${component.defaultName}${count}`;
  }
  function visit(markupNode, parent = null) {
    const component = getComponent(markupNode.tag);
    if (!component)
      throw new Error(
        `Unsupported tag during normalization: ${markupNode.tag}`
      );
    const attrs = { ...markupNode.attrs };
    const responsive = extractResponsiveAttrs(attrs);
    const sceneNode = {
      tag: markupNode.tag,
      type: component.type,
      name: nextName(component, attrs),
      attrs,
      props: {},
      responsive,
      warnings: [],
      children: [],
      _parent: parent
    };
    applyCommonProps(sceneNode, warnings);
    applySpecificProps(sceneNode, warnings);
    for (const child of markupNode.children || []) {
      if (child.type !== "element") continue;
      sceneNode.children.push(visit(child, sceneNode));
    }
    return sceneNode;
  }
  const scene = visit(markupAst, null);
  scene._warnings = warnings;
  return scene;
}
function extractResponsiveAttrs(attrs) {
  const responsive = {};
  for (const [key, value] of Object.entries({ ...attrs })) {
    const [prefix, prop] = key.split(":");
    if (!prop || !RESPONSIVE_BREAKPOINTS.has(prefix)) continue;
    if (!responsive[prefix]) responsive[prefix] = {};
    responsive[prefix][prop] = value;
    delete attrs[key];
  }
  return responsive;
}
function applyCommonProps(node, warnings) {
  const a = node.attrs;
  const p = node.props;
  if (a.anchor === "full") {
    p.anchor_left = "0.0";
    p.anchor_top = "0.0";
    p.anchor_right = "1.0";
    p.anchor_bottom = "1.0";
    if (a.padding !== void 0 && !["gd-panel", "gd-card", "gd-container"].includes(node.tag)) {
      const [top, right, bottom, left] = parseBox(a.padding, 0);
      p.offset_left = String(left);
      p.offset_top = String(top);
      p.offset_right = String(-right);
      p.offset_bottom = String(-bottom);
    }
  }
  if (a.visible !== void 0 && !parseBoolean(a.visible, true)) {
    p.visible = "false";
  }
  const width = parseNumber(a.width ?? a["min-width"], null);
  const height = parseNumber(a.height ?? a["min-height"], null);
  if (width !== null || height !== null) {
    p.custom_minimum_size = `Vector2(${width ?? 0}, ${height ?? 0})`;
  }
  if (parseBoolean(a.expand, false)) {
    p.size_flags_horizontal = "3";
    p.size_flags_vertical = "3";
  }
  if (a.class) p["metadata/css_class"] = godotString(a.class);
  if (a.action) {
    p["metadata/action"] = godotString(a.action);
    if (!isValidActionName(a.action)) {
      warnings.push(
        `${node.name}: action "${a.action}" should use dotted lowercase names like domain.intent.`
      );
    }
  }
  if (node.tag === "gd-screen" && a.state) {
    p["metadata/gdui_state"] = godotString(a.state);
    if (!isValidStateName(a.state)) {
      warnings.push(
        `${node.name}: state "${a.state}" should use lowercase names like screen or inventory.session.`
      );
    }
  }
  if (a.tooltip) p.tooltip_text = godotString(a.tooltip);
  if (a.variant) {
    const suffix = node.type === "Button" ? "Button" : node.type === "Label" ? "Label" : "";
    p.theme_type_variation = `&${godotString(toThemeVariation(a.variant, suffix))}`;
  } else if (node.tag === "gd-card") {
    p.theme_type_variation = '&"Card"';
  }
  if (Object.keys(node.responsive || {}).length) {
    p["metadata/gdui_responsive"] = godotString(
      JSON.stringify(node.responsive)
    );
  }
  const bindings = extractBindings(a, node, warnings);
  if (Object.keys(bindings).length) {
    p["metadata/gdui_bindings"] = godotString(JSON.stringify(bindings));
  }
}
function extractBindings(attrs, node, warnings) {
  const bindings = {};
  for (const [key, value] of Object.entries(attrs)) {
    const [prefix, prop] = key.split(":");
    if (prefix !== "bind" || !prop) continue;
    if (!SUPPORTED_BINDINGS.has(prop)) {
      warnings.push(
        `${node.name}: bind:${prop} is not supported in the MVP. Supported bindings: ${Array.from(SUPPORTED_BINDINGS).join(", ")}.`
      );
      continue;
    }
    bindings[prop] = value;
  }
  return bindings;
}
function applySpecificProps(node, warnings) {
  const a = node.attrs;
  const p = node.props;
  switch (node.tag) {
    case "gd-screen": {
      if (a.background && !colorToGodot(a.background)) {
        warnings.push(
          `${node.name}: invalid background color ${a.background}. Only hex is supported.`
        );
      }
      break;
    }
    case "gd-label": {
      if (a.text !== void 0) p.text = godotString(a.text);
      const fontSize = parseNumber(a["font-size"], null);
      if (fontSize !== null)
        p["theme_override_font_sizes/font_size"] = String(fontSize);
      const color = colorToGodot(a.color);
      if (color) p["theme_override_colors/font_color"] = color;
      if (a.align) p.horizontal_alignment = alignmentToGodot(a.align);
      if (parseBoolean(a.wrap, false)) p.autowrap_mode = "2";
      break;
    }
    case "gd-button": {
      if (a.text !== void 0) p.text = godotString(a.text);
      if (parseBoolean(a.disabled, false)) p.disabled = "true";
      p.focus_mode = "2";
      break;
    }
    case "gd-vbox":
    case "gd-hbox": {
      const gap = parseNumber(a.gap, null);
      if (gap !== null) p["theme_override_constants/separation"] = String(gap);
      break;
    }
    case "gd-grid": {
      const columns = parseNumber(a.columns, 1);
      p.columns = String(Math.max(1, columns || 1));
      const gap = parseNumber(a.gap, null);
      if (gap !== null) {
        p["theme_override_constants/h_separation"] = String(gap);
        p["theme_override_constants/v_separation"] = String(gap);
      }
      break;
    }
    case "gd-container": {
      if (a.padding !== void 0) {
        const [top, right, bottom, left] = parseBox(a.padding, 0);
        p["theme_override_constants/margin_top"] = String(top);
        p["theme_override_constants/margin_right"] = String(right);
        p["theme_override_constants/margin_bottom"] = String(bottom);
        p["theme_override_constants/margin_left"] = String(left);
      }
      break;
    }
    case "gd-panel":
    case "gd-card": {
      const stylebox = buildStyleBox(node);
      if (stylebox) node.stylebox = stylebox;
      break;
    }
    case "gd-scroll": {
      p.horizontal_scroll_mode = "0";
      p.vertical_scroll_mode = "1";
      break;
    }
    case "gd-input": {
      if (a.placeholder !== void 0)
        p.placeholder_text = godotString(a.placeholder);
      if (a.text !== void 0) p.text = godotString(a.text);
      const maxLength = parseNumber(a["max-length"], null);
      if (maxLength !== null) p.max_length = String(maxLength);
      if (parseBoolean(a.disabled, false)) p.editable = "false";
      if (parseBoolean(a.password, false)) p.secret = "true";
      p.focus_mode = "2";
      break;
    }
    case "gd-option": {
      if (parseBoolean(a.disabled, false)) p.disabled = "true";
      if (a.options) {
        const items = a.options.split(",").map((s) => s.trim()).filter(Boolean);
        if (items.length)
          p["metadata/options"] = godotString(JSON.stringify(items));
      }
      p.focus_mode = "2";
      break;
    }
    case "gd-progress": {
      p.min_value = String(parseNumber(a["min-value"], 0));
      p.max_value = String(parseNumber(a["max-value"], 100));
      p.value = String(parseNumber(a.value, 0));
      const progressStep = parseNumber(a.step, null);
      if (progressStep !== null) p.step = String(progressStep);
      break;
    }
    case "gd-slider": {
      if (a.orientation === "vertical") node.type = "VSlider";
      p.min_value = String(parseNumber(a["min-value"], 0));
      p.max_value = String(parseNumber(a["max-value"], 100));
      p.value = String(parseNumber(a.value, 0));
      const sliderStep = parseNumber(a.step, null);
      if (sliderStep !== null) p.step = String(sliderStep);
      p.focus_mode = "2";
      break;
    }
    case "gd-texture": {
      const src = a.src || a.image;
      if (src) {
        if (src.startsWith("res://")) {
          node.textureSrc = src;
        } else {
          p["metadata/source_image"] = godotString(src);
          warnings.push(
            `${node.name}: gd-texture path "${src}" is not a res:// path; stored as metadata. Use res:// for a real ExtResource.`
          );
        }
      }
      p.expand_mode = "1";
      p.stretch_mode = "5";
      break;
    }
    case "gd-spacer": {
      const width = parseNumber(a.width, 0);
      const height = parseNumber(a.height, 0);
      p.custom_minimum_size = `Vector2(${width}, ${height})`;
      break;
    }
  }
}
function buildStyleBox(node) {
  const a = node.attrs;
  const styleAttrs = [
    "background",
    "radius",
    "border",
    "border-color",
    "padding"
  ];
  if (!styleAttrs.some((attr) => a[attr] !== void 0)) return null;
  const style = {};
  const background = colorToGodot(a.background || "#111827");
  if (background) style.bg_color = background;
  const radius = parseNumber(a.radius, null);
  if (radius !== null) {
    style.corner_radius_top_left = String(radius);
    style.corner_radius_top_right = String(radius);
    style.corner_radius_bottom_right = String(radius);
    style.corner_radius_bottom_left = String(radius);
  }
  const border = parseNumber(a.border, null);
  if (border !== null) {
    style.border_width_left = String(border);
    style.border_width_top = String(border);
    style.border_width_right = String(border);
    style.border_width_bottom = String(border);
  }
  const borderColor = colorToGodot(a["border-color"]);
  if (borderColor) style.border_color = borderColor;
  if (a.padding !== void 0) {
    const [top, right, bottom, left] = parseBox(a.padding, 0);
    style.content_margin_top = String(top);
    style.content_margin_right = String(right);
    style.content_margin_bottom = String(bottom);
    style.content_margin_left = String(left);
  }
  return style;
}
function alignmentToGodot(value) {
  switch (String(value).toLowerCase()) {
    case "center":
      return "1";
    case "right":
    case "end":
      return "2";
    case "fill":
      return "3";
    case "left":
    case "start":
    default:
      return "0";
  }
}
function isValidActionName(value) {
  return /^[a-z][a-z0-9_-]*(\.[a-z][a-z0-9_-]*)+$/.test(String(value || ""));
}
function isValidStateName(value) {
  return /^[a-z][a-z0-9_-]*(\.[a-z][a-z0-9_-]*)*$/.test(String(value || ""));
}

// packages/godot-exporter/src/tscn.js
function exportTscn(sceneAst, options = {}) {
  const nodes = [];
  const extResources = [];
  const subResources = [];
  const warnings = [...sceneAst._warnings || []];
  let styleBoxCount = 0;
  const themePath = options.themePath || sceneAst.attrs?.theme || null;
  assignPaths(sceneAst);
  if (themePath) {
    extResources.push({ id: "GduiTheme", type: "Theme", path: themePath });
  }
  function addStyleBox(stylebox) {
    const id = `StyleBoxFlat_${++styleBoxCount}`;
    subResources.push({ id, type: "StyleBoxFlat", props: stylebox });
    return id;
  }
  function walk(node, parentPath = null) {
    const props = { ...node.props };
    if (node.stylebox && Object.keys(node.stylebox).length) {
      const styleId = addStyleBox(node.stylebox);
      props["theme_override_styles/panel"] = `SubResource("${styleId}")`;
    }
    if (node.textureSrc) {
      let texRes = extResources.find(
        (r) => r.path === node.textureSrc && r.type === "Texture2D"
      );
      if (!texRes) {
        const texId = `Texture2D_${extResources.filter((r) => r.type === "Texture2D").length + 1}`;
        extResources.push({
          id: texId,
          type: "Texture2D",
          path: node.textureSrc
        });
        texRes = extResources[extResources.length - 1];
      }
      props.texture = `ExtResource("${texRes.id}")`;
    }
    if (!parentPath && themePath) {
      props.theme = 'ExtResource("GduiTheme")';
    }
    nodes.push({
      name: node.name,
      type: node.type,
      parent: parentPath,
      props
    });
    if (node.tag === "gd-screen" && node.attrs.background) {
      const color = colorToGodot(node.attrs.background);
      if (color) {
        nodes.push({
          name: "Background",
          type: "ColorRect",
          parent: node._path || ".",
          props: {
            anchor_right: "1.0",
            anchor_bottom: "1.0",
            color,
            mouse_filter: "2"
          }
        });
      }
    }
    for (const child of node.children || []) {
      walk(child, node._path || ".");
    }
  }
  walk(sceneAst, null);
  const loadSteps = Math.max(1, extResources.length + subResources.length + 1);
  const lines = [`[gd_scene load_steps=${loadSteps} format=3]`, ""];
  for (const resource of extResources) {
    lines.push(
      `[ext_resource type=${godotString(resource.type)} path=${godotString(resource.path)} id=${godotString(resource.id)}]`
    );
    lines.push("");
  }
  for (const resource of subResources) {
    lines.push(`[sub_resource type="${resource.type}" id="${resource.id}"]`);
    for (const [key, value] of Object.entries(resource.props)) {
      lines.push(`${key} = ${value}`);
    }
    lines.push("");
  }
  for (const node of nodes) {
    const parent = node.parent === null ? "" : ` parent=${godotString(node.parent)}`;
    lines.push(
      `[node name=${godotString(node.name)} type=${godotString(node.type)}${parent}]`
    );
    for (const [key, value] of Object.entries(node.props)) {
      lines.push(`${key} = ${value}`);
    }
    lines.push("");
  }
  return {
    content: `${lines.join("\n").trimEnd()}
`,
    warnings
  };
}
function assignPaths(root) {
  function visit(node, parentPath = "") {
    if (!node._parent) {
      node._path = ".";
    } else if (!node._parent._parent) {
      node._path = node.name;
    } else {
      node._path = `${parentPath}/${node.name}`;
    }
    for (const child of node.children || []) {
      visit(child, node._path === "." ? "" : node._path);
    }
  }
  visit(root, "");
}

// packages/godot-exporter/src/script.js
function generateActionScript(sceneAst, options = {}) {
  const actions = collectActions(sceneAst);
  const sourceName = options.sourceName || `${sceneAst.name}.gdui.html`;
  const content = buildScript(sceneAst, actions, sourceName);
  return { content, actions };
}
function collectActions(node, found = /* @__PURE__ */ new Set()) {
  if (node.attrs?.action) found.add(node.attrs.action);
  for (const child of node.children || []) {
    collectActions(child, found);
  }
  return [...found].sort();
}
function rootExtends(sceneAst) {
  const typeMap = {
    Control: "Control",
    Panel: "Panel",
    Node: "Node"
  };
  return typeMap[sceneAst.type] ?? "Control";
}
function buildScript(sceneAst, actions, sourceName) {
  const lines = [];
  const ext = rootExtends(sceneAst);
  const hasActions = actions.length > 0;
  lines.push(`# Generated by GDUI \u2014 feel free to edit`);
  lines.push(`# Source: ${sourceName}`);
  lines.push(`extends ${ext}`);
  lines.push(``);
  if (hasActions) {
    lines.push(
      `const _ROUTER_SCRIPT := preload("res://addons/gdui/runtime/action_router.gd")`
    );
    lines.push(``);
    lines.push(`var _router: GduiActionRouter`);
    lines.push(``);
  }
  lines.push(`func _ready() -> void:`);
  if (hasActions) {
    lines.push(`	_router = _ROUTER_SCRIPT.new()`);
    lines.push(`	add_child(_router)`);
    lines.push(`	_router.action_triggered.connect(_on_gdui_action)`);
    lines.push(`	_router.connect_actions(self)`);
  } else {
    lines.push(`	pass`);
  }
  if (hasActions) {
    lines.push(``);
    lines.push(
      `func _on_gdui_action(action: String, source: Node, _meta: Dictionary) -> void:`
    );
    lines.push(`	match action:`);
    for (const action of actions) {
      lines.push(`		"${action}":`);
      lines.push(`			pass  # TODO: handle ${action}`);
    }
    lines.push(`		_:`);
    lines.push(
      `			push_warning("GduiActions: unhandled action '%s'" % action)`
    );
  }
  lines.push(``);
  return lines.join("\n");
}

// packages/theme-exporter/src/theme.js
import fs from "node:fs";
import path from "node:path";
var REQUIRED_THEME_SECTIONS = ["colors", "spacing", "radius", "fontSizes"];
var REQUIRED_COLOR_TOKENS = [
  "surface",
  "surfaceAlt",
  "text",
  "primary",
  "primaryText",
  "border"
];
var REQUIRED_NUMBER_TOKENS = {
  spacing: ["sm", "md", "lg"],
  radius: ["md", "lg"],
  fontSizes: ["body", "title", "button"]
};
function exportTheme(themeTokens = {}, options = {}) {
  const warnings = [];
  const validation = validateThemeTokens(themeTokens);
  if (validation.errors.length) {
    throw new Error(
      `Invalid theme tokens:
${validation.errors.map((error) => `- ${error}`).join("\n")}`
    );
  }
  warnings.push(...validation.warnings);
  const resources = [];
  function styleBox(id, values) {
    const props2 = {};
    const background = colorToken(
      themeTokens,
      values.background,
      values.backgroundFallback,
      warnings
    );
    const borderColor = colorToken(
      themeTokens,
      values.borderColor,
      values.borderFallback,
      warnings
    );
    const radius = numberToken(
      themeTokens.radius,
      values.radius,
      values.radiusFallback
    );
    const border = parseNumber(values.borderWidth, 0);
    const padding = numberToken(
      themeTokens.spacing,
      values.padding,
      values.paddingFallback
    );
    if (background) props2.bg_color = background;
    if (borderColor) props2.border_color = borderColor;
    props2.corner_radius_top_left = String(radius);
    props2.corner_radius_top_right = String(radius);
    props2.corner_radius_bottom_right = String(radius);
    props2.corner_radius_bottom_left = String(radius);
    props2.border_width_left = String(border);
    props2.border_width_top = String(border);
    props2.border_width_right = String(border);
    props2.border_width_bottom = String(border);
    props2.content_margin_top = String(padding);
    props2.content_margin_right = String(padding);
    props2.content_margin_bottom = String(padding);
    props2.content_margin_left = String(padding);
    resources.push({ id, type: "StyleBoxFlat", props: props2 });
    return id;
  }
  const panelStyle = styleBox("GduiPanel", {
    background: "surface",
    backgroundFallback: "#111827",
    borderColor: "border",
    borderFallback: "#334155",
    radius: "lg",
    radiusFallback: 18,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16
  });
  const buttonStyle = styleBox("GduiButton", {
    background: "surfaceAlt",
    backgroundFallback: "#1e293b",
    borderColor: "border",
    borderFallback: "#334155",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16
  });
  const buttonHoverStyle = styleBox("GduiButtonHover", {
    background: "surfaceHover",
    backgroundFallback: "#263449",
    borderColor: "border",
    borderFallback: "#334155",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16
  });
  const buttonPressedStyle = styleBox("GduiButtonPressed", {
    background: "surfacePressed",
    backgroundFallback: "#0f172a",
    borderColor: "border",
    borderFallback: "#334155",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16
  });
  const buttonDisabledStyle = styleBox("GduiButtonDisabled", {
    background: "disabled",
    backgroundFallback: "#475569",
    borderColor: "border",
    borderFallback: "#334155",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16
  });
  const cardStyle = styleBox("GduiCard", {
    background: "surfaceAlt",
    backgroundFallback: "#1e293b",
    borderColor: "border",
    borderFallback: "#334155",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16
  });
  const primaryButtonStyle = styleBox("GduiPrimaryButton", {
    background: "primary",
    backgroundFallback: "#38bdf8",
    borderColor: "primary",
    borderFallback: "#38bdf8",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16
  });
  const primaryButtonHoverStyle = styleBox("GduiPrimaryButtonHover", {
    background: "primaryHover",
    backgroundFallback: "#7dd3fc",
    borderColor: "primaryHover",
    borderFallback: "#7dd3fc",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16
  });
  const primaryButtonPressedStyle = styleBox("GduiPrimaryButtonPressed", {
    background: "primaryPressed",
    backgroundFallback: "#0284c7",
    borderColor: "primaryPressed",
    borderFallback: "#0284c7",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16
  });
  const props = {
    "Label/colors/font_color": colorToken(
      themeTokens,
      "text",
      "#f8fafc",
      warnings
    ),
    "Label/font_sizes/font_size": String(
      numberToken(themeTokens.fontSizes, "body", 16)
    ),
    "Button/colors/font_color": colorToken(
      themeTokens,
      "text",
      "#f8fafc",
      warnings
    ),
    "Button/colors/font_disabled_color": colorToken(
      themeTokens,
      "disabledText",
      "#94a3b8",
      warnings
    ),
    "Button/font_sizes/font_size": String(
      numberToken(themeTokens.fontSizes, "button", 16)
    ),
    "Button/styles/normal": `SubResource(${godotString(buttonStyle)})`,
    "Button/styles/hover": `SubResource(${godotString(buttonHoverStyle)})`,
    "Button/styles/pressed": `SubResource(${godotString(buttonPressedStyle)})`,
    "Button/styles/disabled": `SubResource(${godotString(buttonDisabledStyle)})`,
    "PanelContainer/styles/panel": `SubResource(${godotString(panelStyle)})`,
    "Card/base_type": '&"PanelContainer"',
    "Card/styles/panel": `SubResource(${godotString(cardStyle)})`,
    "PrimaryButton/base_type": '&"Button"',
    "PrimaryButton/colors/font_color": colorToken(
      themeTokens,
      "primaryText",
      "#020617",
      warnings
    ),
    "PrimaryButton/colors/font_hover_color": colorToken(
      themeTokens,
      "primaryText",
      "#020617",
      warnings
    ),
    "PrimaryButton/colors/font_pressed_color": colorToken(
      themeTokens,
      "primaryText",
      "#020617",
      warnings
    ),
    "PrimaryButton/font_sizes/font_size": String(
      numberToken(themeTokens.fontSizes, "button", 16)
    ),
    "PrimaryButton/styles/normal": `SubResource(${godotString(primaryButtonStyle)})`,
    "PrimaryButton/styles/hover": `SubResource(${godotString(primaryButtonHoverStyle)})`,
    "PrimaryButton/styles/pressed": `SubResource(${godotString(primaryButtonPressedStyle)})`,
    "PrimaryButton/styles/disabled": `SubResource(${godotString(buttonDisabledStyle)})`
  };
  const lines = [
    `[gd_resource type="Theme" load_steps=${resources.length + 1} format=3]`,
    ""
  ];
  for (const resource of resources) {
    lines.push(
      `[sub_resource type=${godotString(resource.type)} id=${godotString(resource.id)}]`
    );
    for (const [key, value] of Object.entries(resource.props)) {
      lines.push(`${key} = ${value}`);
    }
    lines.push("");
  }
  lines.push("[resource]");
  for (const [key, value] of Object.entries(props)) {
    if (value !== null && value !== void 0) lines.push(`${key} = ${value}`);
  }
  return {
    content: `${lines.join("\n").trimEnd()}
`,
    warnings
  };
}
function compileThemeFile(inputFile, outputFile, options = {}) {
  const source = fs.readFileSync(inputFile, "utf8");
  const themeTokens = JSON.parse(source);
  const result = exportTheme(themeTokens, options);
  if (outputFile) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, result.content, "utf8");
  }
  return result;
}
function validateThemeTokens(themeTokens = {}) {
  const errors = [];
  const warnings = [];
  if (!themeTokens || typeof themeTokens !== "object" || Array.isArray(themeTokens)) {
    return {
      errors: ["theme root must be an object"],
      warnings
    };
  }
  for (const section of REQUIRED_THEME_SECTIONS) {
    if (!themeTokens[section] || typeof themeTokens[section] !== "object" || Array.isArray(themeTokens[section])) {
      errors.push(`${section} must be an object`);
    }
  }
  for (const token of REQUIRED_COLOR_TOKENS) {
    if (!themeTokens.colors?.[token]) {
      errors.push(`colors.${token} is required`);
    }
  }
  if (themeTokens.colors && typeof themeTokens.colors === "object") {
    for (const [name, value] of Object.entries(themeTokens.colors)) {
      if (typeof value !== "string" || !parseHexColor(value)) {
        errors.push(`colors.${name} must be a hex color`);
      }
    }
  }
  for (const [section, names] of Object.entries(REQUIRED_NUMBER_TOKENS)) {
    for (const name of names) {
      if (themeTokens[section]?.[name] === void 0) {
        errors.push(`${section}.${name} is required`);
      }
    }
    if (themeTokens[section] && typeof themeTokens[section] === "object") {
      for (const [name, value] of Object.entries(themeTokens[section])) {
        if (!Number.isFinite(Number(value))) {
          errors.push(`${section}.${name} must be a number`);
        }
      }
    }
  }
  return { errors, warnings };
}
function colorToken(themeTokens, name, fallback, warnings) {
  const value = themeTokens.colors?.[name] ?? fallback;
  const color = colorToGodot(value);
  if (!color) {
    warnings.push(`Invalid theme color for ${name}: ${value}`);
    return colorToGodot(fallback);
  }
  return color;
}
function numberToken(tokens = {}, name, fallback) {
  return parseNumber(tokens?.[name], fallback);
}

// tools/gdui/src/index.js
function compileSource(source, options = {}) {
  const markupAst = parseMarkup(source);
  const sceneAst = normalizeToSceneAst(markupAst, options);
  const result = exportTscn(sceneAst, options);
  return {
    markupAst,
    sceneAst,
    tscn: result.content,
    warnings: result.warnings
  };
}
function compileFile(inputFile, outputFile, options = {}) {
  const source = fs2.readFileSync(inputFile, "utf8");
  const result = compileSource(source, options);
  if (outputFile) {
    fs2.mkdirSync(path2.dirname(outputFile), { recursive: true });
    fs2.writeFileSync(outputFile, result.tscn, "utf8");
    if (options.genScript) {
      const scriptResult = generateActionScript(result.sceneAst, {
        sourceName: path2.basename(inputFile)
      });
      const scriptFile = outputFile.replace(/\.tscn$/i, "Actions.gd");
      fs2.writeFileSync(scriptFile, scriptResult.content, "utf8");
      result.scriptFile = scriptFile;
      result.actions = scriptResult.actions;
    }
  }
  return result;
}
function compileDirectory(inputDir, outputDir, options = {}) {
  const files = listGduiFiles(inputDir);
  const results = [];
  for (const file of files) {
    const source = fs2.readFileSync(file, "utf8");
    const result = compileSource(source, options);
    const baseName = `${result.sceneAst.name}.tscn`;
    const outFile = path2.join(outputDir, baseName);
    fs2.mkdirSync(path2.dirname(outFile), { recursive: true });
    fs2.writeFileSync(outFile, result.tscn, "utf8");
    if (options.genScript) {
      const scriptResult = generateActionScript(result.sceneAst, {
        sourceName: path2.basename(file)
      });
      const scriptFile = outFile.replace(/\.tscn$/i, "Actions.gd");
      fs2.writeFileSync(scriptFile, scriptResult.content, "utf8");
      result.scriptFile = scriptFile;
      result.actions = scriptResult.actions;
    }
    results.push({ input: file, output: outFile, ...result });
  }
  return results;
}
function listGduiFiles(dir) {
  if (!fs2.existsSync(dir)) return [];
  const out = [];
  function walk(current) {
    for (const entry of fs2.readdirSync(current, { withFileTypes: true })) {
      const full = path2.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.gdui\.html$/i.test(entry.name)) out.push(full);
    }
  }
  walk(dir);
  return out.sort();
}
async function runCli(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const cwd = process.cwd();
  const theme = args.theme ? path2.resolve(cwd, args.theme) : null;
  const input = path2.resolve(cwd, args.input || args.i || "ui");
  const output = args.output || args.o ? path2.resolve(cwd, args.output || args.o) : null;
  const check = Boolean(args.check);
  const genScript = Boolean(args["gen-script"]);
  if (theme) {
    if (!fs2.existsSync(theme)) {
      console.error(`[gdui] Theme input not found: ${theme}`);
      process.exitCode = 1;
      return;
    }
    try {
      const outFile = output || path2.resolve(cwd, "scenes", "theme.tres");
      const result = compileThemeFile(theme, check ? null : outFile, args);
      printWarnings(result.warnings);
      if (check) {
        console.log(result.content);
        return;
      }
      console.log(
        `[gdui] ${path2.relative(cwd, theme)} -> ${path2.relative(cwd, outFile)}`
      );
    } catch (error) {
      console.error(`[gdui] ${error.message}`);
      if (args.debug) console.error(error.stack);
      process.exitCode = 1;
    }
    return;
  }
  if (!fs2.existsSync(input)) {
    console.error(`[gdui] Input not found: ${input}`);
    process.exitCode = 1;
    return;
  }
  try {
    if (fs2.statSync(input).isDirectory()) {
      const outDir = output || path2.resolve(cwd, "scenes");
      const results = compileDirectory(input, outDir, { ...args, genScript });
      for (const item of results) {
        printWarnings(item.warnings);
        console.log(
          `[gdui] ${path2.relative(cwd, item.input)} -> ${path2.relative(cwd, item.output)}`
        );
        if (item.scriptFile)
          console.log(
            `[gdui] script -> ${path2.relative(cwd, item.scriptFile)} (${item.actions?.length ?? 0} actions)`
          );
      }
      if (!results.length)
        console.warn(`[gdui] No .gdui.html files found in ${input}`);
      return;
    }
    const outFile = output || path2.resolve(
      cwd,
      "scenes",
      path2.basename(input).replace(/\.gdui\.html$/i, ".tscn")
    );
    const result = compileFile(input, check ? null : outFile, {
      ...args,
      genScript: check ? false : genScript
    });
    printWarnings(result.warnings);
    if (check) {
      console.log(
        JSON.stringify(
          {
            markupAst: result.markupAst,
            sceneAst: cloneWithoutPrivateKeys(result.sceneAst),
            warnings: result.warnings
          },
          null,
          2
        )
      );
      return;
    }
    console.log(
      `[gdui] ${path2.relative(cwd, input)} -> ${path2.relative(cwd, outFile)}`
    );
    if (result.scriptFile)
      console.log(
        `[gdui] script -> ${path2.relative(cwd, result.scriptFile)} (${result.actions?.length ?? 0} actions)`
      );
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
  return args;
}
export {
  compileDirectory,
  compileFile,
  compileSource,
  compileThemeFile,
  exportTheme,
  exportTscn,
  generateActionScript,
  listGduiFiles,
  normalizeToSceneAst,
  parseMarkup,
  runCli,
  validateThemeTokens
};
