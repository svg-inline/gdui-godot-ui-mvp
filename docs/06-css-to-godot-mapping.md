# 06 - CSS to Godot Mapping

## Princípio

O projeto usa nomes familiares para quem vem de HTML/CSS, mas cada propriedade precisa mapear para um conceito nativo do Godot.

Cada regra deve ter suporte classificado como:

| Nível | Significado |
| --- | --- |
| `native` | Mapeia diretamente para Godot. |
| `approx` | Funciona com aproximação documentada. |
| `custom` | Exige runtime, script ou custom container. |
| `unsupported` | Fora do contrato. |

## Matriz

| Entrada | Godot | Suporte | Status |
| --- | --- | --- | --- |
| `display: none` | `visible = false` | `native` | MVP via `visible="false"` |
| `background` | `StyleBoxFlat.bg_color` ou `ColorRect.color` | `native` | MVP |
| `color` | `theme_override_colors/font_color` | `native` | MVP |
| `font-size` | `theme_override_font_sizes/font_size` | `native` | MVP |
| `padding` | `StyleBoxFlat.content_margin_*` | `approx` | MVP |
| `padding` em `anchor="full"` | `offset_left/top/right/bottom` | `approx` | MVP |
| `radius` / `border-radius` | `StyleBoxFlat.corner_radius_*` | `native` | MVP |
| `border` | `StyleBoxFlat.border_width_*` | `native` | MVP |
| `border-color` | `StyleBoxFlat.border_color` | `native` | MVP |
| `gap` | `theme_override_constants/separation` | `native` | MVP |
| `gap` em grid | `h_separation` e `v_separation` | `native` | MVP |
| `width` | `custom_minimum_size.x` | `approx` | MVP parcial |
| `height` | `custom_minimum_size.y` | `approx` | MVP parcial |
| `min-width` | `custom_minimum_size.x` | `native` | MVP |
| `min-height` | `custom_minimum_size.y` | `native` | MVP |
| `opacity` | `modulate.a` ou `self_modulate.a` | `native` | Futuro |
| `overflow: hidden` | `clip_contents = true` | `native` | Futuro |
| `overflow: auto/scroll` | `ScrollContainer` | `native` | Por componente |
| `pointer-events: none` | `mouse_filter` | `approx` | Futuro |
| `display: flex` | `gd-hbox` ou `gd-vbox` | `approx` | Por estrutura |
| `flex-direction` | `gd-vbox` ou `gd-hbox` | `native` | Por estrutura |
| `justify-content` | `BoxContainer.alignment` | `native` | Futuro |
| `align-items` | size flags nos filhos | `approx` | Futuro |
| `flex-grow` | expand/fill + stretch ratio | `approx` | Futuro |
| `display: grid` | `GridContainer` | `approx` | Por componente |
| `grid-template-columns` | `gd-grid columns` | `approx` | Simplificado |
| `grid-column`, `grid-row`, `span` | custom container | `custom` | Fora do MVP |
| `position: absolute` | `position` e `size` | `native` | Futuro limitado |
| `position: fixed` | `CanvasLayer` ou root ancorado | `approx` | Futuro |
| `position: sticky` | sem alvo simples | `unsupported` | Fora |
| `z-index` | ordem de nodes ou `z_index` | `approx` | Futuro |
| `box-shadow` | `StyleBoxFlat.shadow_*` | `approx` | Futuro |
| `transition` | `Tween` | `custom` | Futuro runtime |
| `animation` | `AnimationPlayer` ou `Tween` | `custom` | Fora do MVP |
| `@media` | breakpoints do runtime | `custom` | Futuro |
| CSS variables | tokens -> Theme/Resource | `custom` | Futuro |
| `calc()`, `clamp()` | normalizer ou unsupported | `custom` | Fora do MVP |
| `::before`, `::after` | nodes explícitos | `unsupported` | Fora |

## Cores

No MVP, usar hex:

```html
<gd-panel background="#111827" />
```

Não usar ainda:

```text
rgb()
hsl()
var()
color-mix()
```

## Espaçamento

Valores aceitos seguem formato curto:

```html
<gd-panel padding="16" />
<gd-panel padding="8 12" />
<gd-panel padding="8 12 16 20" />
```

## Regra geral

Se uma propriedade não tiver equivalente Godot claro, ela deve virar erro, warning ou ser ignorada explicitamente. Nunca inventar compatibilidade silenciosa.

## Diferença para GTML

GTML tenta aceitar HTML/CSS familiar em amplitude maior. Esta matriz existe para fazer o oposto: classificar suporte antes de implementar, mantendo a linguagem pequena.
