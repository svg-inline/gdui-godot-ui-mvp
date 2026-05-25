export const SUPPORTED_TAGS = new Map([
  ['gd-screen', { type: 'Control', defaultName: 'Screen' }],
  ['gd-control', { type: 'Control', defaultName: 'Control' }],
  ['gd-container', { type: 'MarginContainer', defaultName: 'Container' }],
  ['gd-vbox', { type: 'VBoxContainer', defaultName: 'VBox' }],
  ['gd-hbox', { type: 'HBoxContainer', defaultName: 'HBox' }],
  ['gd-panel', { type: 'PanelContainer', defaultName: 'Panel', styled: true }],
  ['gd-card', { type: 'PanelContainer', defaultName: 'Card', styled: true }],
  ['gd-label', { type: 'Label', defaultName: 'Label' }],
  ['gd-button', { type: 'Button', defaultName: 'Button' }],
  ['gd-scroll', { type: 'ScrollContainer', defaultName: 'Scroll' }],
  ['gd-grid', { type: 'GridContainer', defaultName: 'Grid' }],
  ['gd-texture', { type: 'TextureRect', defaultName: 'Texture' }],
  ['gd-spacer', { type: 'Control', defaultName: 'Spacer' }],
]);

export const RESPONSIVE_BREAKPOINTS = new Set(['sm', 'md', 'lg', 'xl', 'tv']);

export function getComponent(tag) {
  return SUPPORTED_TAGS.get(String(tag).toLowerCase());
}

export function isSupportedTag(tag) {
  return SUPPORTED_TAGS.has(String(tag).toLowerCase());
}
