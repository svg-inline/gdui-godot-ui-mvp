import fs from 'node:fs';
import path from 'node:path';
import { colorToGodot, godotString, parseNumber } from '../utils.js';

export function exportTheme(themeTokens = {}, options = {}) {
  const warnings = [];
  const resources = [];

  function styleBox(id, values) {
    const props = {};
    const background = colorToken(themeTokens, values.background, values.backgroundFallback, warnings);
    const borderColor = colorToken(themeTokens, values.borderColor, values.borderFallback, warnings);
    const radius = numberToken(themeTokens.radius, values.radius, values.radiusFallback);
    const border = parseNumber(values.borderWidth, 0);
    const padding = numberToken(themeTokens.spacing, values.padding, values.paddingFallback);

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

    resources.push({ id, type: 'StyleBoxFlat', props });
    return id;
  }

  const panelStyle = styleBox('GduiPanel', {
    background: 'surface',
    backgroundFallback: '#111827',
    borderColor: 'border',
    borderFallback: '#334155',
    radius: 'lg',
    radiusFallback: 18,
    borderWidth: 1,
    padding: 'md',
    paddingFallback: 16,
  });

  const buttonStyle = styleBox('GduiButton', {
    background: 'surfaceAlt',
    backgroundFallback: '#1e293b',
    borderColor: 'border',
    borderFallback: '#334155',
    radius: 'md',
    radiusFallback: 12,
    borderWidth: 1,
    padding: 'md',
    paddingFallback: 16,
  });

  const primaryButtonStyle = styleBox('GduiPrimaryButton', {
    background: 'primary',
    backgroundFallback: '#38bdf8',
    borderColor: 'primary',
    borderFallback: '#38bdf8',
    radius: 'md',
    radiusFallback: 12,
    borderWidth: 1,
    padding: 'md',
    paddingFallback: 16,
  });

  const props = {
    'Label/colors/font_color': colorToken(themeTokens, 'text', '#f8fafc', warnings),
    'Label/font_sizes/font_size': String(numberToken(themeTokens.fontSizes, 'body', 16)),
    'Button/colors/font_color': colorToken(themeTokens, 'text', '#f8fafc', warnings),
    'Button/font_sizes/font_size': String(numberToken(themeTokens.fontSizes, 'button', 16)),
    'Button/styles/normal': `SubResource(${godotString(buttonStyle)})`,
    'PanelContainer/styles/panel': `SubResource(${godotString(panelStyle)})`,
    'Card/base_type': '&"PanelContainer"',
    'Card/styles/panel': `SubResource(${godotString(panelStyle)})`,
    'PrimaryButton/base_type': '&"Button"',
    'PrimaryButton/colors/font_color': colorToken(themeTokens, 'primaryText', '#020617', warnings),
    'PrimaryButton/font_sizes/font_size': String(numberToken(themeTokens.fontSizes, 'button', 16)),
    'PrimaryButton/styles/normal': `SubResource(${godotString(primaryButtonStyle)})`,
  };

  const lines = [`[gd_resource type="Theme" load_steps=${resources.length + 1} format=3]`, ''];

  for (const resource of resources) {
    lines.push(`[sub_resource type=${godotString(resource.type)} id=${godotString(resource.id)}]`);
    for (const [key, value] of Object.entries(resource.props)) {
      lines.push(`${key} = ${value}`);
    }
    lines.push('');
  }

  lines.push('[resource]');
  for (const [key, value] of Object.entries(props)) {
    if (value !== null && value !== undefined) lines.push(`${key} = ${value}`);
  }

  return {
    content: `${lines.join('\n').trimEnd()}\n`,
    warnings,
  };
}

export function compileThemeFile(inputFile, outputFile, options = {}) {
  const source = fs.readFileSync(inputFile, 'utf8');
  const themeTokens = JSON.parse(source);
  const result = exportTheme(themeTokens, options);

  if (outputFile) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, result.content, 'utf8');
  }

  return result;
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
