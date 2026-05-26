# Components

## Componentes v1.0

| Markup | Node Godot |
| --- | --- |
| `gd-screen` | `Control` |
| `gd-control` | `Control` |
| `gd-container` | `MarginContainer` |
| `gd-vbox` | `VBoxContainer` |
| `gd-hbox` | `HBoxContainer` |
| `gd-panel` | `PanelContainer` |
| `gd-card` | `PanelContainer` |
| `gd-label` | `Label` |
| `gd-button` | `Button` |
| `gd-scroll` | `ScrollContainer` |
| `gd-grid` | `GridContainer` |
| `gd-texture` | `TextureRect` |
| `gd-spacer` | `Control` |
| `gd-input` | `LineEdit` |
| `gd-option` | `OptionButton` |
| `gd-progress` | `ProgressBar` |
| `gd-slider` | `HSlider` ou `VSlider` |

## Props comuns

```text
name, id, anchor, visible, width, height, min-width, min-height,
expand, class, variant, theme, state, tooltip, action, padding, gap,
background, radius, border, border-color, color, font-size, align,
wrap, columns
```

Props responsivas usam prefixos:

```html
<gd-grid columns="2" md:columns="3" lg:columns="4" tv:columns="6" />
```

## Actions

No contrato atual, `action` e suportado oficialmente em `gd-button`:

```html
<gd-button text="Play" action="menu.play" />
```

A action vira `metadata/action` no `.tscn`. O helper `action_router.gd` conecta o sinal `pressed` e emite `action_triggered`.

## Bindings

Bindings suportados:

| Binding | Alvo Godot |
| --- | --- |
| `bind:text` | `Label.text` ou `Button.text` |
| `bind:visible` | `CanvasItem.visible` |
| `bind:disabled` | `Button.disabled` |

Exemplo:

```html
<gd-screen name="InventoryScreen" state="inventory">
  <gd-label bind:text="inventory.title" />
  <gd-button bind:disabled="inventory.locked" />
</gd-screen>
```

## Candidato v1.1: `gd-list`

`gd-list` deve ser a primeira expansao pos-MVP se a prioridade for dados repetidos.

Contrato inicial proposto:

- Mapping para node Godot nativo, provavelmente `VBoxContainer` ou `GridContainer`.
- Template declarativo limitado.
- Dados aplicados por runtime opcional, nao por JavaScript.
- Sem expressoes livres no markup.
- Exemplo obrigatorio em `examples/`.
- Testes de parser, normalizer, exporter e runtime se existir comportamento dinamico.

## Limites

- Sem HTML generico.
- Sem CSS completo.
- Sem CSS Grid completo.
- Sem `calc()`, `clamp()`, `var()`, `rem`, `em`, `vh`, `vw`.
- Sem JavaScript runtime.

