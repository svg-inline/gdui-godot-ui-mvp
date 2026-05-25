# Godot UI MVP

Compilador experimental de UI declarativa para Godot 4.x.

```text
.gdui.html -> AST -> Godot Scene AST -> .tscn editável
```

Este projeto usa tags `gd-*` inspiradas em HTML, mas a saída é cena nativa Godot. Não é conversor universal de HTML/CSS e não usa WebView como saída principal.

## Como testar dentro de um projeto Godot

Copie estas pastas/arquivos para a raiz do seu projeto Godot:

```text
addons/gdui/
tools/gdui/
ui/
scenes/
package.json
gdui.config.json
```

Depois rode na raiz do projeto Godot:

```bash
npm run compile
```

Isso compila os arquivos em `ui/*.gdui.html` para `scenes/*.tscn`.

Abra no Godot:

```text
scenes/InventoryScreen.tscn
scenes/MainMenuScreen.tscn
scenes/SettingsScreen.tscn
scenes/ResponsiveGridScreen.tscn
```

## Usando pelo editor Godot

1. Copie o projeto para a raiz do Godot.
2. Abra `Project > Project Settings > Plugins`.
3. Ative o plugin `Gdui`.
4. Use o menu `Project > Tools > Gdui: Compile all UI`.

O addon chama o compilador Node. Então o `node` precisa estar disponível no PATH.

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm run compile` | Compila todos os arquivos de `ui/` para `scenes/`. |
| `npm run compile:sample` | Compila apenas `ui/inventory.gdui.html`. |
| `npm run check` | Imprime AST e Scene AST no terminal. |
| `npm test` | Roda testes básicos do parser/exporter. |

## Componentes suportados no MVP

| Markup | Godot |
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
| `gd-texture` | `TextureRect` com `metadata/source_image` |
| `gd-spacer` | `Control` |

## Props básicas

Suporte inicial:

```text
name, id, anchor, visible, width, height, min-width, min-height,
expand, class, variant, tooltip, action, padding, gap, background,
radius, border, border-color, color, font-size, align, wrap, columns
```

Props responsivas são preservadas como metadata para runtime futuro:

```html
<gd-grid columns="2" md:columns="3" lg:columns="4" tv:columns="6" />
```

## Limites

- Sem HTML genérico.
- Sem CSS completo.
- Sem JavaScript runtime.
- Sem CSS Grid completo.
- Sem `calc()`, `clamp()`, `var()`, `rem`, `em`, `vh`, `vw`.
- `gd-texture` ainda não cria `ExtResource`.
- `Theme .tres` ainda é etapa futura.

## Estrutura

```text
addons/gdui/                 addon Godot básico
tools/gdui/                  compilador Node
ui/                          arquivos .gdui.html de teste
scenes/                      cenas .tscn geradas
docs/                        documentação técnica
playground/                  preview web simples
```
