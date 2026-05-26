import { colorToGodot, godotString } from "@gdui/compiler";

export function exportTscn(sceneAst, options = {}) {
  const nodes = [];
  const extResources = [];
  const subResources = [];
  const warnings = [...(sceneAst._warnings || [])];
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

    if (
      node.stylebox &&
      Object.keys(node.stylebox).length &&
      !usesThemeEquivalentStylebox(node, themePath)
    ) {
      const styleId = addStyleBox(node.stylebox);
      props["theme_override_styles/panel"] = `SubResource("${styleId}")`;
    }

    if (node.textureSrc) {
      let texRes = extResources.find(
        (r) => r.path === node.textureSrc && r.type === "Texture2D",
      );
      if (!texRes) {
        const texId = `Texture2D_${extResources.filter((r) => r.type === "Texture2D").length + 1}`;
        extResources.push({
          id: texId,
          type: "Texture2D",
          path: node.textureSrc,
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
      props,
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
            mouse_filter: "2",
          },
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
      `[ext_resource type=${godotString(resource.type)} path=${godotString(resource.path)} id=${godotString(resource.id)}]`,
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
    const parent =
      node.parent === null ? "" : ` parent=${godotString(node.parent)}`;
    lines.push(
      `[node name=${godotString(node.name)} type=${godotString(node.type)}${parent}]`,
    );
    for (const [key, value] of Object.entries(node.props)) {
      lines.push(`${key} = ${value}`);
    }
    lines.push("");
  }

  return {
    content: `${lines.join("\n").trimEnd()}\n`,
    warnings,
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

function usesThemeEquivalentStylebox(node, themePath) {
  if (!themePath) return false;
  const variant = String(node.attrs?.variant || "").trim().toLowerCase();
  const expected = themeEquivalentStylebox(node.tag, variant);
  if (!expected) return false;
  return styleboxesEqual(node.stylebox, expected);
}

function themeEquivalentStylebox(tag, variant) {
  if (tag === "gd-panel" && !variant) {
    return stylebox({
      background: "#111827",
      borderColor: "#334155",
      radius: 18,
      borderWidth: 1,
      padding: 16,
    });
  }

  if (tag !== "gd-card") return null;

  if (!variant) {
    return stylebox({
      background: "#1e293b",
      borderColor: "#334155",
      radius: 12,
      borderWidth: 1,
      padding: 16,
    });
  }

  if (variant === "elevated") {
    return stylebox({
      background: "#1e293b",
      borderColor: "#38bdf8",
      radius: 18,
      borderWidth: 1,
      padding: 24,
    });
  }

  if (variant === "outlined") {
    return stylebox({
      background: "#111827",
      borderColor: "#334155",
      radius: 12,
      borderWidth: 1,
      padding: 16,
    });
  }

  return null;
}

function stylebox({ background, borderColor, radius, borderWidth, padding }) {
  return {
    bg_color: colorToGodot(background),
    corner_radius_top_left: String(radius),
    corner_radius_top_right: String(radius),
    corner_radius_bottom_right: String(radius),
    corner_radius_bottom_left: String(radius),
    border_width_left: String(borderWidth),
    border_width_top: String(borderWidth),
    border_width_right: String(borderWidth),
    border_width_bottom: String(borderWidth),
    border_color: colorToGodot(borderColor),
    content_margin_top: String(padding),
    content_margin_right: String(padding),
    content_margin_bottom: String(padding),
    content_margin_left: String(padding),
  };
}

function styleboxesEqual(actual = {}, expected = {}) {
  const actualEntries = Object.entries(actual).filter(
    ([, value]) => value !== undefined && value !== null,
  );
  if (actualEntries.length !== Object.keys(expected).length) return false;

  return actualEntries.every(([key, value]) => expected[key] === value);
}
