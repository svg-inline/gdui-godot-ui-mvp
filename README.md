# Gdui — Declarative UI for Godot 4

**Compatível com Godot 4.x LTS (4.1 – 4.4)**

Compilador de UI declarativa que converte arquivos `.gdui.html` em cenas `.tscn` editáveis para Godot 4.

```text
.gdui.html  →  AST  →  Godot Scene AST  →  .tscn editável
```

Usa tags `gd-*` inspiradas em HTML. A saída é cena nativa Godot — não é conversor universal de HTML/CSS e não usa WebView.

## Como usar o addon em um projeto Godot

### 1. Gerar o bundle (apenas uma vez, no repositório de desenvolvimento)

```bash
npm install           # instala devDependencies (esbuild)
npm run build:addon   # empacota compilador em addons/gdui/compiler/
```

### 2. Copiar o addon

Copie **apenas** `addons/gdui/` para a raiz do projeto Godot de destino. Nenhuma outra pasta ou arquivo é necessário.

### 3. Ativar no editor Godot

1. Abra **Project > Project Settings > Plugins**.
2. Ative o plugin **Gdui**.
3. Na primeira ativação, o plugin cria automaticamente `gdui.config.json` e `theme.gdui.json` com valores padrão.
4. Use o dock **Gdui** para criar seus arquivos `.gdui.html`, compilar e ajustar configurações.

> O Node.js precisa estar disponível no PATH.

### Para testar neste repositório

Abra o projeto no Godot normalmente. As cenas de exemplo já estão em `scenes/`.

## Usando pelo editor Godot

Após ativar o plugin, o dock **Gdui** oferece:

- **Compile UI** — compila os `.gdui.html` do `inputDir` para `.tscn`.
- **Compile Theme** — gera `theme.tres` a partir de `theme.gdui.json`.
- **Auto** (checkbox) — ativa auto-compilação ao salvar `.gdui.html` (watcher com guard de loop).
- **Start / Open / Restart / Stop Studio** — servidor local de autoria no navegador.
- **Project Config** — edita `inputDir` e `outputDir` sem abrir JSON.
- **Init Project** — recria `gdui.config.json` e `theme.gdui.json` se necessário.

Os mesmos comandos estão disponíveis em **Project > Tools > Gdui: ...**.

O Node.js precisa estar disponível no PATH.

## Gdui Studio local

O addon pode iniciar um servidor Node local em:

```text
http://127.0.0.1:39147
```

Esse Studio serve para criar, editar e previsualizar arquivos `.gdui.html`. Ele e um apoio de autoria: a saida canonica do projeto continua sendo `.tscn` editavel gerado pelo compilador.

O painel de diagnosticos do Studio usa o parser/compilador para mostrar erros, warnings e atributos ignorados pelo exporter antes da compilacao.
Ele tambem lista diferencas esperadas entre o preview web auxiliar e a saida Godot, como Theme, actions, responsividade runtime e TextureRect metadata.
O preview e renderizado a partir do AST para ajudar na autoria, mas continua sendo aproximado; a saida canonica permanece o `.tscn` editavel.

Tambem e possivel iniciar fora do Godot:

```bash
npm run studio
```

## Comandos

| Comando                   | Descrição                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `npm run compile`         | Compila todos os arquivos de `ui/` para `scenes/`.                                 |
| `npm run compile:sample`  | Compila apenas `ui/inventory.gdui.html`.                                           |
| `npm run compile:theme`   | Gera `scenes/theme.tres` a partir de `theme.gdui.json`.                            |
| `npm run check`           | Imprime AST e Scene AST no terminal.                                               |
| `npm run check:theme`     | Imprime o `Theme .tres` gerado no terminal.                                        |
| `npm run build:addon`     | Empacota o compilador em `addons/gdui/compiler/` para distribuição self-contained. |
| `npm run studio`          | Inicia o Gdui Studio local para editar e previsualizar `.gdui.html`.               |
| `npm test`                | Roda testes básicos do parser/exporter.                                            |
| `npm run test:godot`      | Usa Godot headless para carregar e instanciar as cenas geradas.                    |
| `npm run test:responsive` | Usa Godot headless para validar o runtime responsivo.                              |
| `npm run test:actions`    | Usa Godot headless para validar `metadata/action` com `action_router.gd`.          |
| `npm run test:bindings`   | Usa Godot headless para validar `metadata/gdui_bindings` com `binding_runtime.gd`. |
| `npm run test:studio`     | Usa Godot headless para validar Start/Open/Restart/Stop do Studio local.           |

### Gerando o script auxiliar de actions

O compilador pode gerar um GDScript de partida com conexão de signals e stubs de handlers:

```bash
# Compila UI e gera <SceneName>Actions.gd junto de cada .tscn
node tools/gdui/bin/gdui.js --input ui --output scenes --gen-script
```

O arquivo gerado (`<SceneName>Actions.gd`) é um ponto de partida — edite os branches `match` com a lógica real da sua cena.

## Distribuição (Godot Asset Library)

Para publicar o addon:

1. Execute `npm run build:addon` para gerar o bundle self-contained em `addons/gdui/compiler/`.
2. Comprima **apenas** a pasta `addons/` em um `.zip`.
3. Submeta no [Godot Asset Library](https://godotengine.org/asset-library/asset) com:
   - **Category**: Tools
   - **Godot version**: 4.1+
   - **License**: MIT
4. Adicione um `icon.png` (128×128) na raiz do addon para exibição na loja.

> O arquivo `plugin.cfg` já declara compatibilidade com Godot 4.1–4.4 LTS.

## CI

O workflow `.github/workflows/gdui-ci.yml` roda em `push` e `pull_request`:

```text
npm test
npm run compile:all
npm run compile:theme
npm run test:godot
npm run test:responsive
npm run test:actions
npm run test:bindings
npm run test:studio
```

Ele baixa versões alvo do Godot 4.x no runner Linux e publica o log headless como artefato quando houver execução.

## Componentes suportados no MVP

| Markup         | Godot                                                  |
| -------------- | ------------------------------------------------------ |
| `gd-screen`    | `Control`                                              |
| `gd-control`   | `Control`                                              |
| `gd-container` | `MarginContainer`                                      |
| `gd-vbox`      | `VBoxContainer`                                        |
| `gd-hbox`      | `HBoxContainer`                                        |
| `gd-panel`     | `PanelContainer`                                       |
| `gd-card`      | `PanelContainer`                                       |
| `gd-label`     | `Label`                                                |
| `gd-button`    | `Button`                                               |
| `gd-scroll`    | `ScrollContainer`                                      |
| `gd-grid`      | `GridContainer`                                        |
| `gd-texture`   | `TextureRect` com `ExtResource` para caminhos `res://` |
| `gd-spacer`    | `Control`                                              |
| `gd-input`     | `LineEdit`                                             |
| `gd-option`    | `OptionButton`                                         |
| `gd-progress`  | `ProgressBar`                                          |
| `gd-slider`    | `HSlider` / `VSlider`                                  |

## Props básicas

Suporte inicial:

```text
name, id, anchor, visible, width, height, min-width, min-height,
expand, class, variant, theme, state, tooltip, action, padding, gap, background,
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

## Reatividade inicial

O contrato inicial preserva estado e bindings como metadata para runtime Godot opcional:

```html
<gd-screen name="InventoryScreen" state="inventory">
  <gd-label bind:text="inventory.title" />
  <gd-button bind:disabled="inventory.locked" />
</gd-screen>
```

No momento, bindings suportados sao `bind:text`, `bind:visible` e `bind:disabled`. O runtime opcional `addons/gdui/runtime/binding_runtime.gd` aplica esses valores em nodes Godot nativos.

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
- `Theme .tres` existe em versão inicial para tokens centrais e variações básicas.

## Estrutura

```text
addons/gdui/                 addon Godot (plugin, dock, runtime)
addons/gdui/compiler/        compilador bundled para distribuição (gerado por build:addon)
addons/gdui/server/          servidor Node local do Gdui Studio
packages/compiler/           parser + normalizer + utils
packages/godot-exporter/     exportador .tscn
packages/theme-exporter/     exportador Theme .tres
tools/gdui/                  CLI de desenvolvimento (fonte dos bundles)
ui/                          arquivos .gdui.html de teste
scenes/                      cenas .tscn geradas
docs/                        documentação técnica
```
