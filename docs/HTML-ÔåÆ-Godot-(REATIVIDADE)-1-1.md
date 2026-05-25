Sim, você vai precisar de um **mapa CSS → Godot**.

Mas seja realista: **não existe 1:1 para tudo do CSS**. Godot UI usa `Control`, `Container`, `Theme`, `StyleBox`, anchors, offsets e size flags; CSS usa browser layout engine. O compilador precisa classificar cada propriedade como: **nativo**, **aproximado**, **custom node/script** ou **não suportado**. Godot recomenda anchors/offsets para posicionamento e containers para layouts mais flexíveis. ([Godot Engine documentation][1])

## Mapa principal CSS → Godot

| CSS                               | Godot                                              | Status                           |
| --------------------------------- | -------------------------------------------------- | -------------------------------- |
| `display: none`                   | `Control.visible = false`                          | nativo                           |
| `display: block`                  | `Control`, `PanelContainer`, `MarginContainer`     | aproximado                       |
| `display: flex`                   | `HBoxContainer` / `VBoxContainer` / `BoxContainer` | nativo/aproximado                |
| `flex-direction: row`             | `HBoxContainer` ou `BoxContainer.vertical = false` | nativo                           |
| `flex-direction: column`          | `VBoxContainer` ou `BoxContainer.vertical = true`  | nativo                           |
| `justify-content: flex-start`     | `BoxContainer.alignment = ALIGNMENT_BEGIN`         | nativo                           |
| `justify-content: center`         | `BoxContainer.alignment = ALIGNMENT_CENTER`        | nativo                           |
| `justify-content: flex-end`       | `BoxContainer.alignment = ALIGNMENT_END`           | nativo                           |
| `gap`                             | theme constant `separation` no container           | nativo                           |
| `align-items`                     | `size_flags_horizontal/vertical` nos filhos        | aproximado                       |
| `flex-grow`                       | `SIZE_EXPAND` + `size_flags_stretch_ratio`         | aproximado                       |
| `flex-shrink`                     | size flags + `custom_minimum_size`                 | aproximado                       |
| `flex-basis`                      | `custom_minimum_size`                              | aproximado                       |
| `display: grid`                   | `GridContainer`                                    | limitado                         |
| `grid-template-columns`           | `GridContainer.columns`                            | limitado                         |
| `grid-gap`                        | separação horizontal/vertical do container/theme   | aproximado                       |
| `grid-column`, `grid-row`, `span` | container customizado                              | custom                           |
| `position: absolute`              | `Control.position`, `Control.size`                 | nativo                           |
| `position: relative`              | posição dentro do parent                           | aproximado                       |
| `position: fixed`                 | `CanvasLayer` / root `Control` ancorado            | aproximado                       |
| `top/right/bottom/left`           | anchors + offsets                                  | nativo                           |
| `width`                           | `Control.size.x` ou `custom_minimum_size.x`        | nativo                           |
| `height`                          | `Control.size.y` ou `custom_minimum_size.y`        | nativo                           |
| `min-width`                       | `custom_minimum_size.x`                            | nativo                           |
| `min-height`                      | `custom_minimum_size.y`                            | nativo                           |
| `max-width`                       | script/container customizado                       | custom                           |
| `max-height`                      | script/container customizado                       | custom                           |
| `margin`                          | `MarginContainer` no wrapper                       | aproximado                       |
| `padding`                         | `StyleBox.content_margin_*` ou `MarginContainer`   | aproximado                       |
| `background-color`                | `StyleBoxFlat.bg_color`                            | nativo                           |
| `background-image`                | `TextureRect` / `StyleBoxTexture`                  | aproximado                       |
| `background-size: cover`          | `TextureRect.expand_mode` + stretch mode           | aproximado                       |
| `border`                          | `StyleBoxFlat.border_*`                            | nativo                           |
| `border-radius`                   | `StyleBoxFlat.corner_radius_*`                     | nativo                           |
| `box-shadow`                      | `StyleBoxFlat.shadow_*`                            | aproximado                       |
| `opacity`                         | `CanvasItem.modulate.a` / `self_modulate.a`        | nativo                           |
| `color`                           | theme color / font color override                  | nativo                           |
| `font-family`                     | Theme font / font override                         | nativo                           |
| `font-size`                       | Theme font size override                           | nativo                           |
| `font-weight`                     | fonte separada/variação de fonte                   | aproximado                       |
| `line-height`                     | theme constant / `RichTextLabel`                   | aproximado                       |
| `text-align`                      | `Label.horizontal_alignment`                       | nativo                           |
| `vertical-align`                  | `Label.vertical_alignment`                         | nativo                           |
| `white-space`                     | autowrap/clip settings                             | aproximado                       |
| `overflow: hidden`                | `clip_contents = true`                             | nativo                           |
| `overflow: scroll/auto`           | `ScrollContainer`                                  | nativo                           |
| `transform: translate`            | `position` / tween / animation                     | nativo                           |
| `transform: scale`                | `Control.scale`                                    | nativo, mas melhor para animação |
| `transform: rotate`               | `Control.rotation_degrees`                         | nativo                           |
| `transform-origin`                | `pivot_offset` / `pivot_offset_ratio`              | nativo                           |
| `transition`                      | `Tween`                                            | custom runtime                   |
| `animation`                       | `AnimationPlayer` / Tween                          | custom runtime                   |
| `cursor`                          | mouse cursor shape                                 | aproximado                       |
| `pointer-events: none`            | `mouse_filter = IGNORE/PASS`                       | aproximado                       |
| `:hover`                          | theme state `hover` / signal `mouse_entered`       | nativo/aproximado                |
| `:active`                         | Button pressed state / theme state                 | nativo                           |
| `:focus`                          | focus StyleBox/theme                               | nativo                           |
| `:disabled`                       | `disabled = true` nos controles suportados         | nativo                           |
| `@media`                          | breakpoints no compilador/runtime                  | custom                           |
| CSS variables                     | tokens → Godot Theme / Resource                    | custom                           |
| `z-index`                         | ordem dos nodes / `z_index`                        | aproximado                       |
| `visibility: hidden`              | `visible = false`, mas não preserva espaço         | aproximado                       |
| `object-fit`                      | `TextureRect.stretch_mode`                         | aproximado                       |

`BoxContainer` organiza filhos horizontal/verticalmente, tem `alignment`, propriedade `vertical` e theme property `separation`, então ele é o alvo mais próximo para `flex-direction`, `justify-content` e `gap`. ([Godot Engine documentation][2])

`GridContainer` existe, mas é bem mais limitado que CSS Grid: ele organiza filhos em grade e usa uma propriedade `columns`; linhas são derivadas da quantidade de filhos. Então `grid-template-areas`, `minmax()`, `auto-fit`, `auto-fill` e `span` precisam virar container customizado. ([Godot Engine documentation][3])

Para visual, o alvo principal é `StyleBoxFlat`: ele cobre background, bordas, border radius, antialiasing, sombra e skew básico. `StyleBox` é usado em painéis, botões, `LineEdit`, `Tree` e outros controles. ([Godot Engine documentation][4])

## Arquitetura correta do mapper

Não faça:

```text
CSS direto → Godot
```

Faça:

```text
CSS/Markup
→ Normalizer
→ Design Tokens
→ Layout AST
→ Godot Scene AST
→ .tscn + .tres
```

Exemplo de entrada:

```css
.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: #111827;
  border-radius: 16px;
}
```

Saída lógica:

```json
{
  "node": "PanelContainer",
  "theme": {
    "stylebox": {
      "bg_color": "#111827",
      "corner_radius": 16,
      "content_margin": 24
    }
  },
  "child": {
    "node": "VBoxContainer",
    "theme_constants": {
      "separation": 16
    }
  }
}
```

## Classes de suporte

Use uma tabela interna assim:

```ts
type SupportLevel = "native" | "approx" | "custom" | "unsupported";

type CssToGodotRule = {
  css: string;
  godot: string;
  support: SupportLevel;
  notes?: string;
};
```

Exemplo:

```ts
const rules = [
  {
    css: "display:flex",
    godot: "HBoxContainer | VBoxContainer",
    support: "approx",
    notes: "Depende de flex-direction.",
  },
  {
    css: "border-radius",
    godot: "StyleBoxFlat.corner_radius_*",
    support: "native",
  },
  {
    css: "grid-template-areas",
    godot: "CustomContainer",
    support: "custom",
  },
];
```

## O que não prometer

Não prometa suporte completo a:

```text
CSS Grid completo
subgrid
container queries reais
pseudo-elements ::before/::after
complex selectors
calc() avançado
clamp() completo
CSS animations complexas
backdrop-filter
mix-blend-mode
position: sticky
browser layout idêntico
```

## O alvo responsivo não é baseado apenas em polegadas físicas, mas em viewport, resolução, escala de UI e distância de leitura.

Você precisa converter CSS responsivo para **breakpoints de runtime**:

```text
sm  = até 640
md  = até 1024
lg  = até 1440
xl  = até 1920
tv  = acima de 1920
```

Na Godot, múltiplas resoluções passam por stretch settings, base resolution, scale e `canvas_items`; a própria doc fala que `canvas_items` escala elementos 2D relativos ao tamanho base da janela e pode ser combinado com fator de escala para acessibilidade. ([Godot Engine documentation][5])

Exemplo:

```css
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 1920px) {
  .inventory-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
```

Vira:

```gdscript
if width >= 1920:
    grid.columns = 6
elif width >= 1024:
    grid.columns = 4
else:
    grid.columns = 2
```

Para TV, também precisa mapear foco. Godot tem navegação por teclado/controle baseada em focus nos nodes `Control`, ações como `ui_up`, `ui_down`, `ui_focus_next`, e `focus_neighbor_*`. ([Godot Engine documentation][6])

## Veredito

Sim: o coração do projeto será esse **CSS → Godot Mapping Layer**.

Mas o nome certo disso é:

```text
CSS Compatibility Matrix
```

ou:

```text
CSS to Godot UI Mapping Spec
```

E a regra principal:

```text
CSS visual simples → Theme/StyleBox
CSS layout → Container/anchors/size_flags
CSS responsivo → runtime breakpoint system
CSS interativo → signals/focus/theme states
CSS avançado → custom container ou unsupported
```

[1]: https://docs.godotengine.org/en/stable/tutorials/ui/size_and_anchors.html "Size and anchors — Godot Engine (stable) documentation in English"
[2]: https://docs.godotengine.org/en/4.4/classes/class_boxcontainer.html "BoxContainer — Godot Engine (4.4) documentation in English"
[3]: https://docs.godotengine.org/en/4.4/classes/class_gridcontainer.html?utm_source=chatgpt.com "GridContainer — Godot Engine (4.4) documentation in English"
[4]: https://docs.godotengine.org/en/stable/classes/class_styleboxflat.html "StyleBoxFlat — Godot Engine (stable) documentation in English"
[5]: https://docs.godotengine.org/en/stable/tutorials/rendering/multiple_resolutions.html "Multiple resolutions — Godot Engine (stable) documentation in English"
[6]: https://docs.godotengine.org/en/stable/tutorials/ui/gui_navigation.html?utm_source=chatgpt.com "Keyboard/Controller Navigation and Focus - Godot Docs"
