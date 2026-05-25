import { colorToGodot, godotString } from '../utils.js';

export function exportTscn(sceneAst, options = {}) {
  const nodes = [];
  const subResources = [];
  const warnings = [...(sceneAst._warnings || [])];
  let styleBoxCount = 0;

  assignPaths(sceneAst);

  function addStyleBox(stylebox) {
    const id = `StyleBoxFlat_${++styleBoxCount}`;
    subResources.push({ id, type: 'StyleBoxFlat', props: stylebox });
    return id;
  }

  function walk(node, parentPath = null) {
    const props = { ...node.props };

    if (node.stylebox && Object.keys(node.stylebox).length) {
      const styleId = addStyleBox(node.stylebox);
      props['theme_override_styles/panel'] = `SubResource("${styleId}")`;
    }

    nodes.push({
      name: node.name,
      type: node.type,
      parent: parentPath,
      props,
    });

    if (node.tag === 'gd-screen' && node.attrs.background) {
      const color = colorToGodot(node.attrs.background);
      if (color) {
        nodes.push({
          name: 'Background',
          type: 'ColorRect',
          parent: node._path || '.',
          props: {
            anchor_right: '1.0',
            anchor_bottom: '1.0',
            color,
            mouse_filter: '2',
          },
        });
      }
    }

    for (const child of node.children || []) {
      walk(child, node._path || '.');
    }
  }

  walk(sceneAst, null);

  const loadSteps = Math.max(1, subResources.length + 1);
  const lines = [`[gd_scene load_steps=${loadSteps} format=3]`, ''];

  for (const resource of subResources) {
    lines.push(`[sub_resource type="${resource.type}" id="${resource.id}"]`);
    for (const [key, value] of Object.entries(resource.props)) {
      lines.push(`${key} = ${value}`);
    }
    lines.push('');
  }

  for (const node of nodes) {
    const parent = node.parent === null ? '' : ` parent=${godotString(node.parent)}`;
    lines.push(`[node name=${godotString(node.name)} type=${godotString(node.type)}${parent}]`);
    for (const [key, value] of Object.entries(node.props)) {
      lines.push(`${key} = ${value}`);
    }
    lines.push('');
  }

  return {
    content: `${lines.join('\n').trimEnd()}\n`,
    warnings,
  };
}

function assignPaths(root) {
  function visit(node, parentPath = '') {
    if (!node._parent) {
      node._path = '.';
    } else if (!node._parent._parent) {
      node._path = node.name;
    } else {
      node._path = `${parentPath}/${node.name}`;
    }
    for (const child of node.children || []) {
      visit(child, node._path === '.' ? '' : node._path);
    }
  }
  visit(root, '');
}
