import { getComponent, RESPONSIVE_BREAKPOINTS } from "./components.js";
import {
  colorToGodot,
  godotString,
  parseBoolean,
  parseBox,
  parseNumber,
  sanitizeNodeName,
  toThemeVariation,
} from "./utils.js";

const SUPPORTED_BINDINGS = new Set(["text", "visible", "disabled"]);

export function normalizeToSceneAst(markupAst, options = {}) {
  const counters = new Map();
  const warnings = [];

  function nextName(component, attrs) {
    const explicit = attrs.name || attrs.id;
    if (explicit) return sanitizeNodeName(explicit, component.defaultName);
    const count = (counters.get(component.defaultName) || 0) + 1;
    counters.set(component.defaultName, count);
    return count === 1
      ? component.defaultName
      : `${component.defaultName}${count}`;
  }

  function visit(markupNode, parent = null) {
    const component = getComponent(markupNode.tag);
    if (!component)
      throw new Error(
        `Unsupported tag during normalization: ${markupNode.tag}`,
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
      _parent: parent,
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

    if (
      a.padding !== undefined &&
      !["gd-panel", "gd-card", "gd-container"].includes(node.tag)
    ) {
      const [top, right, bottom, left] = parseBox(a.padding, 0);
      p.offset_left = String(left);
      p.offset_top = String(top);
      p.offset_right = String(-right);
      p.offset_bottom = String(-bottom);
    }
  }

  if (a.visible !== undefined && !parseBoolean(a.visible, true)) {
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
        `${node.name}: action "${a.action}" should use dotted lowercase names like domain.intent.`,
      );
    }
  }
  if (node.tag === "gd-screen" && a.state) {
    p["metadata/gdui_state"] = godotString(a.state);
    if (!isValidStateName(a.state)) {
      warnings.push(
        `${node.name}: state "${a.state}" should use lowercase names like screen or inventory.session.`,
      );
    }
  }
  if (a.tooltip) p.tooltip_text = godotString(a.tooltip);

  if (a.variant) {
    const suffix =
      node.type === "Button" ? "Button" : node.type === "Label" ? "Label" : "";
    p.theme_type_variation = `&${godotString(toThemeVariation(a.variant, suffix))}`;
  } else if (node.tag === "gd-card") {
    p.theme_type_variation = '&"Card"';
  }

  if (Object.keys(node.responsive || {}).length) {
    p["metadata/gdui_responsive"] = godotString(
      JSON.stringify(node.responsive),
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
        `${node.name}: bind:${prop} is not supported in the MVP. Supported bindings: ${Array.from(SUPPORTED_BINDINGS).join(", ")}.`,
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
          `${node.name}: invalid background color ${a.background}. Only hex is supported.`,
        );
      }
      break;
    }

    case "gd-label": {
      if (a.text !== undefined) p.text = godotString(a.text);
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
      if (a.text !== undefined) p.text = godotString(a.text);
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

    case "gd-list": {
      const listMetadata = {};
      const items = a.items || a.source;
      if (items) listMetadata.items = items;
      if (a["item-name"]) listMetadata.itemName = a["item-name"];
      if (a.key) listMetadata.key = a.key;
      if (a["empty-text"]) listMetadata.emptyText = a["empty-text"];

      if (!items) {
        warnings.push(
          `${node.name}: gd-list should declare items="state.collection" for the optional list runtime.`,
        );
      }

      const columns = parseNumber(a.columns, null);
      if (a.layout === "grid" || (columns !== null && columns > 1)) {
        node.type = "GridContainer";
        p.columns = String(Math.max(1, columns || 1));
      }

      const gap = parseNumber(a.gap, null);
      if (gap !== null) {
        if (node.type === "GridContainer") {
          p["theme_override_constants/h_separation"] = String(gap);
          p["theme_override_constants/v_separation"] = String(gap);
        } else {
          p["theme_override_constants/separation"] = String(gap);
        }
      }

      if (Object.keys(listMetadata).length) {
        p["metadata/gdui_list"] = godotString(JSON.stringify(listMetadata));
      }
      break;
    }

    case "gd-container": {
      if (a.padding !== undefined) {
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
      if (a.placeholder !== undefined)
        p.placeholder_text = godotString(a.placeholder);
      if (a.text !== undefined) p.text = godotString(a.text);
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
        const items = a.options
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
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
            `${node.name}: gd-texture path "${src}" is not a res:// path; stored as metadata. Use res:// for a real ExtResource.`,
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
    "padding",
  ];
  if (!styleAttrs.some((attr) => a[attr] !== undefined)) return null;

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

  if (a.padding !== undefined) {
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
