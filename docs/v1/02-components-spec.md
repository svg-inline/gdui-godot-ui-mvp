# 02 - Components Spec

## Componentes base

| Componente     | Node Godot                     | Uso                                                   |
| -------------- | ------------------------------ | ----------------------------------------------------- |
| `gd-screen`    | `Control`                      | Raiz de tela.                                         |
| `gd-vbox`      | `VBoxContainer`                | Layout vertical.                                      |
| `gd-hbox`      | `HBoxContainer`                | Layout horizontal.                                    |
| `gd-container` | `MarginContainer` ou `Control` | Limita largura, aplica padding e centraliza conteúdo. |
| `gd-panel`     | `PanelContainer`               | Caixa visual com estilo.                              |
| `gd-card`      | `PanelContainer`               | Cartão semântico para itens repetidos.                |
| `gd-label`     | `Label`                        | Texto.                                                |
| `gd-button`    | `Button`                       | Botão acionável.                                      |
| `gd-grid`      | `GridContainer`                | Grade simples por colunas.                            |

## Componentes adicionais

| Componente   | Node Godot        | Observação                                                                                  |
| ------------ | ----------------- | ------------------------------------------------------------------------------------------- |
| `gd-scroll`  | `ScrollContainer` | Scroll vertical com horizontal desativado.                                                  |
| `gd-texture` | `TextureRect`     | Caminho `res://` gera `ExtResource` real; outros caminhos ficam em `metadata/source_image`. |
| `gd-spacer`  | `Control`         | Espaçador de layout.                                                                        |
| `gd-control` | `Control`         | Controle genérico.                                                                          |

## Componentes de Input (v0.8)

| Componente    | Node Godot            | Uso                                                                              |
| ------------- | --------------------- | -------------------------------------------------------------------------------- |
| `gd-input`    | `LineEdit`            | Campo de texto de linha única.                                                   |
| `gd-option`   | `OptionButton`        | Dropdown de opções. Items via `metadata/options`; popular em runtime via helper. |
| `gd-progress` | `ProgressBar`         | Barra de progresso.                                                              |
| `gd-slider`   | `HSlider` / `VSlider` | Controle deslizante; `orientation="vertical"` gera `VSlider`.                    |

## Props comuns

| Prop                      | Tipo    | Saída                               |
| ------------------------- | ------- | ----------------------------------- |
| `name`                    | string  | Nome do node.                       |
| `id`                      | string  | Nome do node se `name` não existir. |
| `anchor`                  | enum    | `full` aplica anchors full rect.    |
| `visible`                 | boolean | `visible = false`.                  |
| `width`, `height`         | number  | `custom_minimum_size`.              |
| `min-width`, `min-height` | number  | `custom_minimum_size`.              |
| `expand`                  | boolean | Size flags expand/fill.             |
| `class`                   | string  | `metadata/css_class`.               |
| `variant`                 | string  | `theme_type_variation`.             |
| `tooltip`                 | string  | `tooltip_text`.                     |
| `action`                  | string  | `metadata/action`.                  |

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

- `src` / `image` — caminho da imagem. Prefixo `res://` gera `ExtResource` no `.tscn`; outros caminhos ficam em `metadata/source_image` com aviso.

`gd-input`:

- `placeholder` — `placeholder_text`
- `text` — valor inicial
- `max-length` — `max_length`
- `disabled` — `editable = false`
- `password` — `secret = true`

`gd-option`:

- `options` — lista separada por vírgula; gerada como `metadata/options` (JSON array)
- `disabled` — `disabled = true`

`gd-progress`:

- `min-value` — `min_value` (padrão `0`)
- `max-value` — `max_value` (padrão `100`)
- `value` — valor atual (padrão `0`)
- `step` — incremento

`gd-slider`:

- `orientation` — `vertical` gera `VSlider`; padrão `HSlider`
- `min-value`, `max-value`, `value`, `step` — igual a `gd-progress`
