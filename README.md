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
5. Opcionalmente use `Project > Tools > Gdui: Start Studio` para abrir o editor local no navegador.

O addon chama o compilador Node. Então o `node` precisa estar disponível no PATH.

O addon tambem adiciona um dock `Gdui` com comandos para compilar UI, compilar Theme, iniciar/parar o Studio e ver logs/warnings do compilador.

## Gdui Studio local

O addon pode iniciar um servidor Node local em:

```text
http://127.0.0.1:39147
```

Esse Studio serve para criar, editar e previsualizar arquivos `.gdui.html`. Ele e um apoio de autoria: a saida canonica do projeto continua sendo `.tscn` editavel gerado pelo compilador.

O painel de diagnosticos do Studio usa o parser/compilador para mostrar erros, warnings e atributos ignorados pelo exporter antes da compilacao.

Tambem e possivel iniciar fora do Godot:

```bash
npm run studio
```

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm run compile` | Compila todos os arquivos de `ui/` para `scenes/`. |
| `npm run compile:sample` | Compila apenas `ui/inventory.gdui.html`. |
| `npm run compile:theme` | Gera `scenes/theme.tres` a partir de `theme.gdui.json`. |
| `npm run check` | Imprime AST e Scene AST no terminal. |
| `npm run check:theme` | Imprime o `Theme .tres` gerado no terminal. |
| `npm run studio` | Inicia o Gdui Studio local para editar e previsualizar `.gdui.html`. |
| `npm test` | Roda testes básicos do parser/exporter. |
| `npm run test:godot` | Usa Godot headless para carregar e instanciar as cenas geradas. |
| `npm run test:responsive` | Usa Godot headless para validar o runtime responsivo. |
| `npm run test:actions` | Usa Godot headless para validar `metadata/action` com `action_router.gd`. |

## CI

O workflow `.github/workflows/gdui-ci.yml` roda em `push` e `pull_request`:

```text
npm test
npm run compile:all
npm run compile:theme
npm run test:godot
npm run test:responsive
npm run test:actions
```

Ele baixa versões alvo do Godot 4.x no runner Linux e publica o log headless como artefato quando houver execução.

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
expand, class, variant, theme, tooltip, action, padding, gap, background,
radius, border, border-color, color, font-size, align, wrap, columns
```

Props responsivas são preservadas como metadata para runtime futuro:

```html
<gd-grid columns="2" md:columns="3" lg:columns="4" tv:columns="6" />
```

O runtime responsivo inicial existe em `addons/gdui/runtime/responsive_runtime.gd` e e validado por Godot headless para breakpoints, retorno ao tamanho base, tamanho minimo, padding e foco inicial em TV.

`gd-screen` tambem pode referenciar um Theme Godot gerado:

```html
<gd-screen name="Menu" theme="res://scenes/theme.tres">
  <gd-button text="Jogar" variant="primary" />
  <gd-card><gd-label text="Perfil" /></gd-card>
</gd-screen>
```

`gd-card` sem estilo inline usa a variação `Card` do Theme. Se `background`, `radius`, `border`, `border-color` ou `padding` forem declarados no markup, o compilador ainda gera um `StyleBoxFlat` local para preservar a intenção da cena.

Actions declaradas em `gd-button action="..."` sao exportadas como `metadata/action`. O helper `addons/gdui/runtime/action_router.gd` conecta botões e emite `action_triggered`; veja `examples/main_menu_actions.gd`.

## Status e pendencias

Use estes documentos para acompanhar o que esta implementado e o que ainda falta:

- `TASKS.md`: task list com IDs e status real.
- `docs/11-implementation-gap.md`: lacunas atuais referenciando as tasks.

## Limites

- Sem HTML genérico.
- Sem CSS completo.
- Sem JavaScript runtime.
- Sem CSS Grid completo.
- Sem `calc()`, `clamp()`, `var()`, `rem`, `em`, `vh`, `vw`.
- `gd-texture` ainda não cria `ExtResource`.
- `Theme .tres` existe em versão inicial para tokens centrais e variações básicas.

## Estrutura

```text
addons/gdui/                 addon Godot básico
addons/gdui/server/          servidor Node local do Gdui Studio
tools/gdui/                  compilador Node
ui/                          arquivos .gdui.html de teste
scenes/                      cenas .tscn geradas
docs/                        documentação técnica
playground/                  preview web simples
```
