import fs from "node:fs";
import path from "node:path";
import {
  colorToGodot,
  godotString,
  parseHexColor,
  parseNumber,
} from "@gdui/compiler";

const REQUIRED_THEME_SECTIONS = ["colors", "spacing", "radius", "fontSizes"];
const REQUIRED_COLOR_TOKENS = [
  "surface",
  "surfaceAlt",
  "text",
  "primary",
  "primaryText",
  "border",
];
const REQUIRED_NUMBER_TOKENS = {
  spacing: ["sm", "md", "lg"],
  radius: ["md", "lg"],
  fontSizes: ["body", "title", "button"],
};

export function exportTheme(themeTokens = {}, options = {}) {
  const warnings = [];
  const validation = validateThemeTokens(themeTokens);
  if (validation.errors.length) {
    throw new Error(
      `Invalid theme tokens:\n${validation.errors.map((error) => `- ${error}`).join("\n")}`,
    );
  }
  warnings.push(...validation.warnings);

  const resources = [];

  function styleBox(id, values) {
    const props = {};
    const background = colorToken(
      themeTokens,
      values.background,
      values.backgroundFallback,
      warnings,
    );
    const borderColor = colorToken(
      themeTokens,
      values.borderColor,
      values.borderFallback,
      warnings,
    );
    const radius = numberToken(
      themeTokens.radius,
      values.radius,
      values.radiusFallback,
    );
    const border = parseNumber(values.borderWidth, 0);
    const padding = numberToken(
      themeTokens.spacing,
      values.padding,
      values.paddingFallback,
    );

    if (background) props.bg_color = background;
    if (borderColor) props.border_color = borderColor;

    props.corner_radius_top_left = String(radius);
    props.corner_radius_top_right = String(radius);
    props.corner_radius_bottom_right = String(radius);
    props.corner_radius_bottom_left = String(radius);
    props.border_width_left = String(border);
    props.border_width_top = String(border);
    props.border_width_right = String(border);
    props.border_width_bottom = String(border);
    props.content_margin_top = String(padding);
    props.content_margin_right = String(padding);
    props.content_margin_bottom = String(padding);
    props.content_margin_left = String(padding);

    resources.push({ id, type: "StyleBoxFlat", props });
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
    paddingFallback: 16,
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
    paddingFallback: 16,
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
    paddingFallback: 16,
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
    paddingFallback: 16,
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
    paddingFallback: 16,
  });
  const ghostButtonStyle = styleBox("GduiGhostButton", {
    background: "transparent",
    backgroundFallback: "#00000000",
    borderColor: "transparent",
    borderFallback: "#00000000",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16,
  });
  const ghostButtonHoverStyle = styleBox("GduiGhostButtonHover", {
    background: "surfaceHover",
    backgroundFallback: "#263449",
    borderColor: "transparent",
    borderFallback: "#00000000",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16,
  });
  const ghostButtonPressedStyle = styleBox("GduiGhostButtonPressed", {
    background: "surfacePressed",
    backgroundFallback: "#0f172a",
    borderColor: "transparent",
    borderFallback: "#00000000",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16,
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
    paddingFallback: 16,
  });
  const elevatedCardStyle = styleBox("GduiElevatedCard", {
    background: "surfaceAlt",
    backgroundFallback: "#1e293b",
    borderColor: "primary",
    borderFallback: "#38bdf8",
    radius: "lg",
    radiusFallback: 18,
    borderWidth: 1,
    padding: "lg",
    paddingFallback: 24,
  });
  const outlinedCardStyle = styleBox("GduiOutlinedCard", {
    background: "surface",
    backgroundFallback: "#111827",
    borderColor: "border",
    borderFallback: "#334155",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16,
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
    paddingFallback: 16,
  });
  const dangerButtonStyle = styleBox("GduiDangerButton", {
    background: "danger",
    backgroundFallback: "#ef4444",
    borderColor: "danger",
    borderFallback: "#ef4444",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16,
  });
  const dangerButtonHoverStyle = styleBox("GduiDangerButtonHover", {
    background: "dangerHover",
    backgroundFallback: "#f87171",
    borderColor: "dangerHover",
    borderFallback: "#f87171",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16,
  });
  const dangerButtonPressedStyle = styleBox("GduiDangerButtonPressed", {
    background: "dangerPressed",
    backgroundFallback: "#b91c1c",
    borderColor: "dangerPressed",
    borderFallback: "#b91c1c",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "md",
    paddingFallback: 16,
  });

  const inputStyle = styleBox("GduiInput", {
    background: "surface",
    backgroundFallback: "#111827",
    borderColor: "border",
    borderFallback: "#334155",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "sm",
    paddingFallback: 8,
  });
  const inputFocusStyle = styleBox("GduiInputFocus", {
    background: "surface",
    backgroundFallback: "#111827",
    borderColor: "primary",
    borderFallback: "#38bdf8",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "sm",
    paddingFallback: 8,
  });
  const inputReadOnlyStyle = styleBox("GduiInputReadOnly", {
    background: "surfacePressed",
    backgroundFallback: "#0f172a",
    borderColor: "disabled",
    borderFallback: "#475569",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "sm",
    paddingFallback: 8,
  });
  const invalidInputStyle = styleBox("GduiInvalidInput", {
    background: "surface",
    backgroundFallback: "#111827",
    borderColor: "danger",
    borderFallback: "#ef4444",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "sm",
    paddingFallback: 8,
  });
  const invalidInputFocusStyle = styleBox("GduiInvalidInputFocus", {
    background: "surface",
    backgroundFallback: "#111827",
    borderColor: "dangerHover",
    borderFallback: "#f87171",
    radius: "md",
    radiusFallback: 12,
    borderWidth: 1,
    padding: "sm",
    paddingFallback: 8,
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
    paddingFallback: 16,
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
    paddingFallback: 16,
  });

  const props = {
    "Label/colors/font_color": colorToken(
      themeTokens,
      "text",
      "#f8fafc",
      warnings,
    ),
    "Label/font_sizes/font_size": String(
      numberToken(themeTokens.fontSizes, "body", 16),
    ),
    "TitleLabel/base_type": '&"Label"',
    "TitleLabel/colors/font_color": colorToken(
      themeTokens,
      "text",
      "#f8fafc",
      warnings,
    ),
    "TitleLabel/font_sizes/font_size": String(
      numberToken(themeTokens.fontSizes, "title", 28),
    ),
    "MutedLabel/base_type": '&"Label"',
    "MutedLabel/colors/font_color": colorToken(
      themeTokens,
      "muted",
      "#cbd5e1",
      warnings,
    ),
    "MutedLabel/font_sizes/font_size": String(
      numberToken(themeTokens.fontSizes, "body", 16),
    ),
    "Button/colors/font_color": colorToken(
      themeTokens,
      "text",
      "#f8fafc",
      warnings,
    ),
    "Button/colors/font_disabled_color": colorToken(
      themeTokens,
      "disabledText",
      "#94a3b8",
      warnings,
    ),
    "Button/font_sizes/font_size": String(
      numberToken(themeTokens.fontSizes, "button", 16),
    ),
    "Button/styles/normal": `SubResource(${godotString(buttonStyle)})`,
    "Button/styles/hover": `SubResource(${godotString(buttonHoverStyle)})`,
    "Button/styles/pressed": `SubResource(${godotString(buttonPressedStyle)})`,
    "Button/styles/disabled": `SubResource(${godotString(buttonDisabledStyle)})`,
    "LineEdit/colors/font_color": colorToken(
      themeTokens,
      "text",
      "#f8fafc",
      warnings,
    ),
    "LineEdit/colors/font_placeholder_color": colorToken(
      themeTokens,
      "muted",
      "#cbd5e1",
      warnings,
    ),
    "LineEdit/colors/caret_color": colorToken(
      themeTokens,
      "primary",
      "#38bdf8",
      warnings,
    ),
    "LineEdit/font_sizes/font_size": String(
      numberToken(themeTokens.fontSizes, "body", 16),
    ),
    "LineEdit/styles/normal": `SubResource(${godotString(inputStyle)})`,
    "LineEdit/styles/focus": `SubResource(${godotString(inputFocusStyle)})`,
    "LineEdit/styles/read_only": `SubResource(${godotString(inputReadOnlyStyle)})`,
    "PanelContainer/styles/panel": `SubResource(${godotString(panelStyle)})`,
    "Card/base_type": '&"PanelContainer"',
    "Card/styles/panel": `SubResource(${godotString(cardStyle)})`,
    "ElevatedCard/base_type": '&"PanelContainer"',
    "ElevatedCard/styles/panel": `SubResource(${godotString(elevatedCardStyle)})`,
    "OutlinedCard/base_type": '&"PanelContainer"',
    "OutlinedCard/styles/panel": `SubResource(${godotString(outlinedCardStyle)})`,
    "PrimaryButton/base_type": '&"Button"',
    "PrimaryButton/colors/font_color": colorToken(
      themeTokens,
      "primaryText",
      "#020617",
      warnings,
    ),
    "PrimaryButton/colors/font_hover_color": colorToken(
      themeTokens,
      "primaryText",
      "#020617",
      warnings,
    ),
    "PrimaryButton/colors/font_pressed_color": colorToken(
      themeTokens,
      "primaryText",
      "#020617",
      warnings,
    ),
    "PrimaryButton/font_sizes/font_size": String(
      numberToken(themeTokens.fontSizes, "button", 16),
    ),
    "PrimaryButton/styles/normal": `SubResource(${godotString(primaryButtonStyle)})`,
    "PrimaryButton/styles/hover": `SubResource(${godotString(primaryButtonHoverStyle)})`,
    "PrimaryButton/styles/pressed": `SubResource(${godotString(primaryButtonPressedStyle)})`,
    "PrimaryButton/styles/disabled": `SubResource(${godotString(buttonDisabledStyle)})`,
    "DangerButton/base_type": '&"Button"',
    "DangerButton/colors/font_color": colorToken(
      themeTokens,
      "dangerText",
      "#ffffff",
      warnings,
    ),
    "DangerButton/colors/font_hover_color": colorToken(
      themeTokens,
      "dangerText",
      "#ffffff",
      warnings,
    ),
    "DangerButton/colors/font_pressed_color": colorToken(
      themeTokens,
      "dangerText",
      "#ffffff",
      warnings,
    ),
    "DangerButton/font_sizes/font_size": String(
      numberToken(themeTokens.fontSizes, "button", 16),
    ),
    "DangerButton/styles/normal": `SubResource(${godotString(dangerButtonStyle)})`,
    "DangerButton/styles/hover": `SubResource(${godotString(dangerButtonHoverStyle)})`,
    "DangerButton/styles/pressed": `SubResource(${godotString(dangerButtonPressedStyle)})`,
    "DangerButton/styles/disabled": `SubResource(${godotString(buttonDisabledStyle)})`,
    "GhostButton/base_type": '&"Button"',
    "GhostButton/colors/font_color": colorToken(
      themeTokens,
      "text",
      "#f8fafc",
      warnings,
    ),
    "GhostButton/colors/font_hover_color": colorToken(
      themeTokens,
      "text",
      "#f8fafc",
      warnings,
    ),
    "GhostButton/colors/font_pressed_color": colorToken(
      themeTokens,
      "text",
      "#f8fafc",
      warnings,
    ),
    "GhostButton/font_sizes/font_size": String(
      numberToken(themeTokens.fontSizes, "button", 16),
    ),
    "GhostButton/styles/normal": `SubResource(${godotString(ghostButtonStyle)})`,
    "GhostButton/styles/hover": `SubResource(${godotString(ghostButtonHoverStyle)})`,
    "GhostButton/styles/pressed": `SubResource(${godotString(ghostButtonPressedStyle)})`,
    "GhostButton/styles/disabled": `SubResource(${godotString(buttonDisabledStyle)})`,
    "InvalidInput/base_type": '&"LineEdit"',
    "InvalidInput/colors/font_color": colorToken(
      themeTokens,
      "text",
      "#f8fafc",
      warnings,
    ),
    "InvalidInput/colors/font_placeholder_color": colorToken(
      themeTokens,
      "muted",
      "#cbd5e1",
      warnings,
    ),
    "InvalidInput/colors/caret_color": colorToken(
      themeTokens,
      "danger",
      "#ef4444",
      warnings,
    ),
    "InvalidInput/font_sizes/font_size": String(
      numberToken(themeTokens.fontSizes, "body", 16),
    ),
    "InvalidInput/styles/normal": `SubResource(${godotString(invalidInputStyle)})`,
    "InvalidInput/styles/focus": `SubResource(${godotString(invalidInputFocusStyle)})`,
    "InvalidInput/styles/read_only": `SubResource(${godotString(inputReadOnlyStyle)})`,
  };

  const lines = [
    `[gd_resource type="Theme" load_steps=${resources.length + 1} format=3]`,
    "",
  ];

  for (const resource of resources) {
    lines.push(
      `[sub_resource type=${godotString(resource.type)} id=${godotString(resource.id)}]`,
    );
    for (const [key, value] of Object.entries(resource.props)) {
      lines.push(`${key} = ${value}`);
    }
    lines.push("");
  }

  lines.push("[resource]");
  for (const [key, value] of Object.entries(props)) {
    if (value !== null && value !== undefined) lines.push(`${key} = ${value}`);
  }

  return {
    content: `${lines.join("\n").trimEnd()}\n`,
    warnings,
  };
}

export function compileThemeFile(inputFile, outputFile, options = {}) {
  const source = fs.readFileSync(inputFile, "utf8");
  const themeTokens = JSON.parse(source);
  const result = exportTheme(themeTokens, options);

  if (outputFile) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, result.content, "utf8");
  }

  return result;
}

export function validateThemeTokens(themeTokens = {}) {
  const errors = [];
  const warnings = [];

  if (
    !themeTokens ||
    typeof themeTokens !== "object" ||
    Array.isArray(themeTokens)
  ) {
    return {
      errors: ["theme root must be an object"],
      warnings,
    };
  }

  for (const section of REQUIRED_THEME_SECTIONS) {
    if (
      !themeTokens[section] ||
      typeof themeTokens[section] !== "object" ||
      Array.isArray(themeTokens[section])
    ) {
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
      if (themeTokens[section]?.[name] === undefined) {
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
