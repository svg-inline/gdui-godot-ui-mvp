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
| `gd-list` | `VBoxContainer` ou `GridContainer` |
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

## `gd-list` v1.1

`gd-list` cobre listas declarativas com contrato pequeno. Ele nao executa JavaScript, nao aceita expressoes livres e nao tenta reproduzir HTML lists.

Mapping:

| Markup | Node Godot |
| --- | --- |
| `gd-list` | `VBoxContainer` |
| `gd-list layout="grid"` | `GridContainer` |
| `gd-list columns="2"` | `GridContainer` |

Props suportadas:

| Prop | Uso |
| --- | --- |
| `items` | Caminho estavel para a colecao, como `inventory.items`. |
| `source` | Alias de `items`. |
| `item-name` | Nome local do item para runtime opcional. |
| `key` | Campo estavel do item para reconciliacao futura. |
| `empty-text` | Texto para estado vazio em runtime opcional. |
| `layout` | `stack` padrao ou `grid`. |
| `columns` | Numero de colunas quando a lista usa `GridContainer`. |
| `gap` | Separacao entre itens. |

O template e composto por filhos `gd-*` normais. Esses filhos continuam editaveis no `.tscn`. A lista exporta `metadata/gdui_list` com os campos acima para um runtime opcional futuro.

Exemplo:

```html
<gd-list name="QuestList" items="quests.active" item-name="quest" key="id" gap="8">
  <gd-card name="QuestItem" padding="12">
    <gd-label name="QuestTitle" bind:text="quest.title" />
  </gd-card>
</gd-list>
```

## Theme `.tres` v1.2

O Theme v1.2 e o caminho preferencial para estilos visuais recorrentes. O markup continua declarativo e pequeno: `variant` seleciona uma variacao de tipo do Godot Theme, enquanto atributos visuais diretos continuam existindo como escape hatch local.

Contrato:

| Markup | Node Godot | Variacao padrao | Variants oficiais |
| --- | --- | --- | --- |
| `gd-button` | `Button` | `Button` | `primary`, `danger`, `ghost` |
| `gd-card` | `PanelContainer` | `Card` | `elevated`, `outlined` |
| `gd-label` | `Label` | `Label` | `title`, `muted` |
| `gd-input` | `LineEdit` | `LineEdit` | `invalid` |

Mapping de variants:

| Markup | `theme_type_variation` |
| --- | --- |
| `<gd-button variant="primary" />` | `PrimaryButton` |
| `<gd-button variant="danger" />` | `DangerButton` |
| `<gd-button variant="ghost" />` | `GhostButton` |
| `<gd-card />` | `Card` |
| `<gd-card variant="elevated" />` | `ElevatedCard` |
| `<gd-card variant="outlined" />` | `OutlinedCard` |
| `<gd-label variant="title" />` | `TitleLabel` |
| `<gd-label variant="muted" />` | `MutedLabel` |
| `<gd-input variant="invalid" />` | `InvalidInput` |

Tokens usados pelo exporter de Theme:

| Secao | Tokens principais |
| --- | --- |
| `colors` | `surface`, `surfaceAlt`, `surfaceHover`, `surfacePressed`, `text`, `muted`, `primary`, `primaryHover`, `primaryPressed`, `primaryText`, `danger`, `dangerHover`, `dangerPressed`, `dangerText`, `disabled`, `disabledText`, `border`, `transparent` |
| `spacing` | `sm`, `md`, `lg` |
| `radius` | `md`, `lg` |
| `fontSizes` | `body`, `title`, `button` |

Somente `surface`, `surfaceAlt`, `text`, `primary`, `primaryText`, `border`, `sm`, `md`, `lg`, `body`, `title` e `button` sao obrigatorios. Os demais tokens tem fallback seguro para preservar `.tscn` editavel.

Exemplo:

```html
<gd-screen name="ThemeVariantsScreen" theme="res://scenes/theme.tres">
  <gd-card variant="elevated">
    <gd-label text="Theme v1.2" variant="title" />
    <gd-button text="Salvar" variant="primary" action="form.save" />
    <gd-button text="Excluir" variant="danger" action="form.delete" />
    <gd-input placeholder="email" variant="invalid" />
  </gd-card>
</gd-screen>
```

Quando uma cena usa `theme="res://scenes/theme.tres"`, estilos inline equivalentes aos variants oficiais de `gd-panel`/`gd-card` sao omitidos do `.tscn`. Se algum valor visual divergir, o exporter preserva `theme_override_styles/panel` para que o override continue editavel no Godot.

## Limites

- Sem HTML generico.
- Sem CSS completo.
- Sem CSS Grid completo.
- Sem `calc()`, `clamp()`, `var()`, `rem`, `em`, `vh`, `vw`.
- Sem JavaScript runtime.
