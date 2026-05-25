# 02 - Components Spec

## Componentes base

| Componente | Node Godot | Uso |
| --- | --- | --- |
| `gd-screen` | `Control` | Raiz de tela. |
| `gd-vbox` | `VBoxContainer` | Layout vertical. |
| `gd-hbox` | `HBoxContainer` | Layout horizontal. |
| `gd-container` | `MarginContainer` ou `Control` | Limita largura, aplica padding e centraliza conteúdo. |
| `gd-panel` | `PanelContainer` | Caixa visual com estilo. |
| `gd-card` | `PanelContainer` | Cartão semântico para itens repetidos. |
| `gd-label` | `Label` | Texto. |
| `gd-button` | `Button` | Botão acionável. |
| `gd-grid` | `GridContainer` | Grade simples por colunas. |

## Componentes adicionais do MVP atual

| Componente | Node Godot | Observação |
| --- | --- | --- |
| `gd-scroll` | `ScrollContainer` | Scroll vertical com horizontal desativado. |
| `gd-texture` | `TextureRect` | Imagem como metadata no MVP. |
| `gd-spacer` | `Control` | Espaçador de layout. |
| `gd-control` | `Control` | Controle genérico. |

## Props comuns

| Prop | Tipo | Saída |
| --- | --- | --- |
| `name` | string | Nome do node. |
| `id` | string | Nome do node se `name` não existir. |
| `anchor` | enum | `full` aplica anchors full rect. |
| `visible` | boolean | `visible = false`. |
| `width`, `height` | number | `custom_minimum_size`. |
| `min-width`, `min-height` | number | `custom_minimum_size`. |
| `expand` | boolean | Size flags expand/fill. |
| `class` | string | `metadata/css_class`. |
| `variant` | string | `theme_type_variation`. |
| `tooltip` | string | `tooltip_text`. |
| `action` | string | `metadata/action`. |

## Props específicas

`gd-label`:

- `text`
- `font-size`
- `color`
- `align`
- `wrap`

`gd-button`:

- `text`
- `disabled`
- `action`

`gd-vbox` e `gd-hbox`:

- `gap`

`gd-container`:

- `max-width`
- `padding`
- `align`
- `full-height`

`gd-grid`:

- `columns`
- `gap`

`gd-panel`:

- `padding`
- `background`
- `radius`
- `border`
- `border-color`

`gd-screen`:

- `background`

`gd-texture`:

- `src`
- `image`
