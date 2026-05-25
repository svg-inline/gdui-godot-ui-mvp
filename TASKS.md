# TASKS

Este arquivo rastreia o estado real do MVP. Use os IDs `GDUI-*` para referenciar pendencias em docs, commits e issues.

Status:

- `Done`: implementado e coberto minimamente.
- `Partial`: existe implementacao, mas falta teste, validacao Godot ou acabamento.
- `Planned`: especificado, ainda nao implementado.
- `Deferred`: adiado de proposito por risco ou mudanca de direcao.

## v0.1 - TSCN confiavel

| ID       | Status | Task                                             | Evidencia                                                                                              |
| -------- | ------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| GDUI-001 | Done   | Criar parser restrito para tags `gd-*`.          | `tools/gdui/src/parser.js`                                                                             |
| GDUI-002 | Done   | Gerar AST intermediaria.                         | `parseMarkup` + `normalizeToSceneAst`                                                                  |
| GDUI-003 | Done   | Exportar `.tscn` textual.                        | `tools/gdui/src/exporters/tscn.js`                                                                     |
| GDUI-004 | Done   | Criar exemplos basicos.                          | `examples/` e `ui/`                                                                                    |
| GDUI-005 | Done   | Cobrir parser/exporter com testes automatizados. | Testes basicos + snapshot de `.tscn` em `tools/gdui/tests/tscn-snapshot.test.js`.                      |
| GDUI-006 | Done   | Validar cena gerada no Godot 4.x.                | `npm run test:godot` carrega/instancia cenas geradas e o Theme gerado via Godot headless.              |
| GDUI-007 | Done   | Rodar smoke test Godot em CI e versoes alvo.     | `.github/workflows/gdui-ci.yml` roda testes Node, recompila cenas/tema e executa smoke Godot headless. |

## v0.2 - Design Tokens + Responsive Props basicas

| ID       | Status | Task                                                                   | Evidencia                                                                                                                                                           |
| -------- | ------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GDUI-020 | Done   | Definir tokens minimos de cor, espacamento, raio, tipografia e escala. | `theme.gdui.json`                                                                                                                                                   |
| GDUI-021 | Done   | Definir sintaxe responsiva para props com prefixos.                    | `md:*`, `lg:*`, `tv:*` aceitos pelo parser de atributos.                                                                                                            |
| GDUI-022 | Done   | Normalizar props responsivas para metadata.                            | `metadata/gdui_responsive` gerado e testado em `tools/gdui/tests/responsive.test.js`.                                                                               |
| GDUI-023 | Done   | Implementar breakpoints documentados.                                  | `responsive_runtime.gd` validado por `npm run test:responsive`.                                                                                                     |
| GDUI-024 | Done   | Adicionar exemplo de grid responsivo.                                  | `examples/responsive-grid.gdui.html`                                                                                                                                |
| GDUI-025 | Done   | Criar testes de AST responsiva.                                        | `tools/gdui/tests/responsive.test.js`                                                                                                                               |
| GDUI-026 | Done   | Validar runtime minimo aplicando breakpoint correto.                   | `tools/godot/test_responsive_runtime.gd` cobre `lg`, `tv`, retorno para `sm`, `columns`, `gap`, `font-size`, `visible`, `padding`, `min-size` e foco inicial em TV. |

## v0.3 - Theme `.tres`

| ID       | Status | Task                                      | Evidencia                                                                                                                                                              |
| -------- | ------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GDUI-030 | Done   | Criar `theme.gdui.json`.                  | `theme.gdui.json`                                                                                                                                                      |
| GDUI-031 | Done   | Definir schema de tokens.                 | `theme.gdui.schema.json` + `validateThemeTokens`.                                                                                                                      |
| GDUI-032 | Done   | Implementar exportador `Theme .tres`.     | `tools/gdui/src/exporters/theme.js` + `scenes/theme.tres`                                                                                                              |
| GDUI-033 | Done   | Migrar variants para Theme.               | Cenas podem referenciar `theme.gdui.json` via `theme`; `PrimaryButton` e `Card` usam `theme_type_variation`, e cards sem estilo inline nao geram `StyleBoxFlat` local. |
| GDUI-034 | Done   | Adicionar exemplo com tema compartilhado. | `examples/themed-menu.gdui.html`                                                                                                                                       |

## v0.4 - Eventos e actions

| ID       | Status | Task                                      | Evidencia                                                                                                                         |
| -------- | ------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| GDUI-040 | Done   | Formalizar contrato de `action`.          | `docs/08-events-actions-spec.md` define o contrato MVP, matriz futura e naming; o compilador avisa nomes fora do padrão pontuado. |
| GDUI-041 | Done   | Gerar metadata de eventos no `.tscn`.     | `metadata/action` no normalizer/exporter.                                                                                         |
| GDUI-042 | Done   | Criar helper Godot para conectar actions. | `addons/gdui/runtime/action_router.gd` validado por `npm run test:actions`.                                                       |
| GDUI-043 | Done   | Criar exemplo de menu com actions.        | `main-menu.gdui.html` usa actions e `examples/main_menu_actions.gd` demonstra o router conectado.                                 |

## v0.5 - Addon Godot + Studio

| ID       | Status   | Task                                                  | Evidencia                                                    |
| -------- | -------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| GDUI-050 | Done     | Criar estrutura `addons/gdui`.                        | `addons/gdui/`                                               |
| GDUI-051 | Deferred | Implementar importer automatico de `.gdui.html`.      | Desativado no MVP por causar loop de reimportacao.           |
| GDUI-052 | Done     | Compilar UI pelo editor Godot.                        | Menu e dock `Gdui` compilam UI/Theme e exibem logs/warnings. |
| GDUI-053 | Done     | Iniciar Studio local pelo addon.                      | Dock e menu fazem Start/Open/Stop do Studio local.           |
| GDUI-054 | Done     | Mostrar warnings no editor.                           | Dock mostra output/warnings do compilador.                   |
| GDUI-055 | Deferred | Reimportar cena automaticamente quando arquivo mudar. | Adiado ate existir contrato seguro sem loop.                 |
| GDUI-056 | Done     | Criar dock Godot para status, logs e comandos.        | `addons/gdui/dock.gd`                                        |

## v0.6 - Reatividade

| ID       | Status | Task                                         | Evidencia                                                                                                    |
| -------- | ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| GDUI-060 | Done   | Definir estado declarativo minimo.           | `state` em `gd-screen` gera `metadata/gdui_state`; contrato em `docs/12-reactivity-spec.md`.                 |
| GDUI-061 | Done   | Definir bindings limitados.                  | `bind:text`, `bind:visible` e `bind:disabled` geram `metadata/gdui_bindings` com testes.                     |
| GDUI-062 | Done   | Atualizar UI por runtime Godot, nao WebView. | `addons/gdui/runtime/binding_runtime.gd` aplica bindings e `npm run test:bindings` valida em Godot headless. |

## v0.7 - Preview Studio avancado

| ID       | Status | Task                                                 | Evidencia                                                                                                                                          |
| -------- | ------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| GDUI-070 | Done   | Preview web como ferramenta de autoria.              | Studio renderiza preview auxiliar a partir do AST, com diagnósticos e comparação textual; `.tscn` segue como fonte de verdade.                     |
| GDUI-071 | Done   | Comparar preview web com saida Godot.                | Studio mostra comparacao textual entre preview auxiliar e comportamento Godot/exporter para Theme, actions, responsividade e TextureRect metadata. |
| GDUI-072 | Done   | Diagnosticar componentes nao suportados visualmente. | Studio mostra erros de parse/compile, warnings do compilador e atributos ignorados pelo exporter.                                                  |

## Higiene continua

| ID       | Status | Task                                       | Evidencia                                           |
| -------- | ------ | ------------------------------------------ | --------------------------------------------------- |
| GDUI-900 | Done   | Manter README alinhado com o estado real.  | README refatorado e alinhado com v1.0.              |
| GDUI-901 | Done   | Atualizar exemplos a cada componente novo. | Exemplos cobrem todos os componentes do MVP.        |
| GDUI-902 | Done   | Nao adicionar tags sem atualizar specs.    | Specs atualizadas ate v1.0; contrato gd-\* estavel. |
| GDUI-903 | Done   | Nao adicionar comportamento sem teste.     | Todos os comportamentos do MVP cobertos em testes.  |

---

## v0.8 - Componentes de Input

| ID       | Status | Task                                                   | Evidencia                                                                                                         |
| -------- | ------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| GDUI-080 | Done   | `gd-input` → `LineEdit`.                               | `tools/gdui/src/components.js` + `normalizer.js`; testes em `parser.test.js`.                                     |
| GDUI-081 | Done   | `gd-option` → `OptionButton`.                          | Items via `metadata/options`; testes em `parser.test.js`.                                                         |
| GDUI-082 | Done   | `gd-progress` → `ProgressBar`.                         | Props `min_value`, `max_value`, `value`, `step`; testes em `parser.test.js`.                                      |
| GDUI-083 | Done   | `gd-slider` → `HSlider` / `VSlider` via `orientation`. | `orientation="vertical"` muda tipo para `VSlider`; testes em `parser.test.js`.                                    |
| GDUI-084 | Done   | `gd-texture`: gerar `ExtResource` real no `.tscn`.     | Caminhos `res://` geram `ExtResource`; outros ficam em `metadata/source_image`; testes em `parser.test.js`.       |
| GDUI-085 | Done   | Specs, testes e exemplos para componentes de v0.8.     | `docs/02-components-spec.md` atualizado; `ui/form-components.gdui.html` + snapshot em `scenes/`; 10 testes novos. |

## v0.9 - Reestruturação de Pacotes

| ID       | Status | Task                                                            | Evidencia                                                                                                                                  |
| -------- | ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| GDUI-090 | Done   | Extrair `packages/compiler` (parser + normalizer).              | `packages/compiler/src/` com index.js, 31 testes passando.                                                                                 |
| GDUI-091 | Done   | Extrair `packages/godot-exporter`.                              | `packages/godot-exporter/src/tscn.js` + index.js.                                                                                          |
| GDUI-092 | Done   | Extrair `packages/theme-exporter`.                              | `packages/theme-exporter/src/theme.js` + index.js.                                                                                         |
| GDUI-093 | Done   | CLI `tools/gdui/bin/` usa pacotes como dependências explícitas. | npm workspaces; `@gdui/cli` depende de `@gdui/compiler` etc.                                                                               |
| GDUI-094 | Done   | Revisitar GDUI-051/055 com guard de loop seguro.                | `set_watcher_enabled()` em `plugin.gd`: checkbox "Auto" na dock, duplo guard (cooldown 3 s + mtime comparado), desconecta em `_exit_tree`. |

## v0.10 - Setup Automático do Projeto

| ID       | Status | Task                                                                                          | Evidencia                                                                         |
| -------- | ------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| GDUI-095 | Done   | Gerar `gdui.config.json` padrão automaticamente na primeira ativação do plugin.               | `_ensure_project_files()` em `plugin.gd`; escreve defaults se arquivo não existe. |
| GDUI-096 | Done   | Gerar `theme.gdui.json` inicial com tokens padrão na primeira ativação do plugin.             | Mesmo `_ensure_project_files()`; escreve `_get_default_theme()`.                  |
| GDUI-097 | Done   | Tela de configuração na dock: editar `inputDir`/`outputDir` e tokens de tema sem editar JSON. | Seção "Project Config" na dock com LineEdit + "Save Config".                      |
| GDUI-098 | Done   | Botão "Inicializar Projeto Gdui" na dock para projetos existentes sem configuração.           | Botão "Init Project" chama `initialize_project_files()`.                          |
| GDUI-099 | Done   | Validar `gdui.config.json` e `theme.gdui.json` na ativação e exibir erros no painel.          | `_validate_project_files()` — erros aparecem no log e status da dock.             |

## v1.0 - Publicação

| ID       | Status | Task                                                                | Evidencia                                                                                                                                           |
| -------- | ------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| GDUI-100 | Done   | Preparar addon para o Asset Library do Godot.                       | `LICENSE` MIT criada; `plugin.cfg` v1.0.0 com nota de compatibilidade Godot 4.1–4.4 LTS; seção "Distribuição" no README.                            |
| GDUI-101 | Done   | Gerar GDScript auxiliar de conexão de signals a partir de `action`. | `packages/godot-exporter/src/script.js` + `generateActionScript`; flag `--gen-script` no CLI; 8 testes em `tools/gdui/tests/action-script.test.js`. |
| GDUI-102 | Done   | Documentação pública completa (README, guia, referência).           | README refatorado: intro com compatibilidade, flag `--gen-script`, toggle Auto-compile, seção Distribuição para Asset Library.                      |
| GDUI-103 | Done   | Declarar compatibilidade com Godot 4.x LTS.                         | `plugin.cfg` description e version bumped para 1.0.0; README declara "Compatível com Godot 4.x LTS (4.1 – 4.4)"; `package.json` version 1.0.0.      |
