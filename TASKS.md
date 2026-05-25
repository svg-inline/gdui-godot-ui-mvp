# TASKS

Este arquivo rastreia o estado real do MVP. Use os IDs `GDUI-*` para referenciar pendencias em docs, commits e issues.

Status:

- `Done`: implementado e coberto minimamente.
- `Partial`: existe implementacao, mas falta teste, validacao Godot ou acabamento.
- `Planned`: especificado, ainda nao implementado.
- `Deferred`: adiado de proposito por risco ou mudanca de direcao.

## v0.1 - TSCN confiavel

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-001 | Done | Criar parser restrito para tags `gd-*`. | `tools/gdui/src/parser.js` |
| GDUI-002 | Done | Gerar AST intermediaria. | `parseMarkup` + `normalizeToSceneAst` |
| GDUI-003 | Done | Exportar `.tscn` textual. | `tools/gdui/src/exporters/tscn.js` |
| GDUI-004 | Done | Criar exemplos basicos. | `examples/` e `ui/` |
| GDUI-005 | Done | Cobrir parser/exporter com testes automatizados. | Testes basicos + snapshot de `.tscn` em `tools/gdui/tests/tscn-snapshot.test.js`. |
| GDUI-006 | Done | Validar cena gerada no Godot 4.x. | `npm run test:godot` carrega/instancia cenas geradas e o Theme gerado via Godot headless. |
| GDUI-007 | Done | Rodar smoke test Godot em CI e versoes alvo. | `.github/workflows/gdui-ci.yml` roda testes Node, recompila cenas/tema e executa smoke Godot headless. |

## v0.2 - Design Tokens + Responsive Props basicas

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-020 | Done | Definir tokens minimos de cor, espacamento, raio, tipografia e escala. | `theme.gdui.json` |
| GDUI-021 | Done | Definir sintaxe responsiva para props com prefixos. | `md:*`, `lg:*`, `tv:*` aceitos pelo parser de atributos. |
| GDUI-022 | Done | Normalizar props responsivas para metadata. | `metadata/gdui_responsive` gerado e testado em `tools/gdui/tests/responsive.test.js`. |
| GDUI-023 | Done | Implementar breakpoints documentados. | `responsive_runtime.gd` validado por `npm run test:responsive`. |
| GDUI-024 | Done | Adicionar exemplo de grid responsivo. | `examples/responsive-grid.gdui.html` |
| GDUI-025 | Done | Criar testes de AST responsiva. | `tools/gdui/tests/responsive.test.js` |
| GDUI-026 | Done | Validar runtime minimo aplicando breakpoint correto. | `tools/godot/test_responsive_runtime.gd` cobre `lg`, `tv`, retorno para `sm`, `columns`, `gap`, `font-size`, `visible`, `padding`, `min-size` e foco inicial em TV. |

## v0.3 - Theme `.tres`

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-030 | Done | Criar `theme.gdui.json`. | `theme.gdui.json` |
| GDUI-031 | Done | Definir schema de tokens. | `theme.gdui.schema.json` + `validateThemeTokens`. |
| GDUI-032 | Done | Implementar exportador `Theme .tres`. | `tools/gdui/src/exporters/theme.js` + `scenes/theme.tres` |
| GDUI-033 | Done | Migrar variants para Theme. | Cenas podem referenciar `theme.gdui.json` via `theme`; `PrimaryButton` e `Card` usam `theme_type_variation`, e cards sem estilo inline nao geram `StyleBoxFlat` local. |
| GDUI-034 | Done | Adicionar exemplo com tema compartilhado. | `examples/themed-menu.gdui.html` |

## v0.4 - Eventos e actions

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-040 | Done | Formalizar contrato de `action`. | `docs/08-events-actions-spec.md` define o contrato MVP, matriz futura e naming; o compilador avisa nomes fora do padrão pontuado. |
| GDUI-041 | Done | Gerar metadata de eventos no `.tscn`. | `metadata/action` no normalizer/exporter. |
| GDUI-042 | Done | Criar helper Godot para conectar actions. | `addons/gdui/runtime/action_router.gd` validado por `npm run test:actions`. |
| GDUI-043 | Done | Criar exemplo de menu com actions. | `main-menu.gdui.html` usa actions e `examples/main_menu_actions.gd` demonstra o router conectado. |

## v0.5 - Addon Godot + Studio

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-050 | Done | Criar estrutura `addons/gdui`. | `addons/gdui/` |
| GDUI-051 | Deferred | Implementar importer automatico de `.gdui.html`. | Desativado no MVP por causar loop de reimportacao. |
| GDUI-052 | Done | Compilar UI pelo editor Godot. | Menu e dock `Gdui` compilam UI/Theme e exibem logs/warnings. |
| GDUI-053 | Done | Iniciar Studio local pelo addon. | Dock e menu fazem Start/Open/Stop do Studio local. |
| GDUI-054 | Done | Mostrar warnings no editor. | Dock mostra output/warnings do compilador. |
| GDUI-055 | Deferred | Reimportar cena automaticamente quando arquivo mudar. | Adiado ate existir contrato seguro sem loop. |
| GDUI-056 | Done | Criar dock Godot para status, logs e comandos. | `addons/gdui/dock.gd` |

## v0.6 - Reatividade

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-060 | Planned | Definir estado declarativo minimo. | Nao implementado. |
| GDUI-061 | Planned | Definir bindings limitados. | Nao implementado. |
| GDUI-062 | Planned | Atualizar UI por runtime Godot, nao WebView. | Nao implementado. |

## v0.7 - Preview Studio avancado

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-070 | Partial | Preview web como ferramenta de autoria. | Studio tem preview auxiliar com diagnósticos; ainda é aproximação web, não fonte de verdade. |
| GDUI-071 | Planned | Comparar preview web com saida Godot. | Nao implementado. |
| GDUI-072 | Done | Diagnosticar componentes nao suportados visualmente. | Studio mostra erros de parse/compile, warnings do compilador e atributos ignorados pelo exporter. |

## Higiene continua

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-900 | Partial | Manter README alinhado com o estado real. | Atualizado, mas deve acompanhar cada release. |
| GDUI-901 | Partial | Atualizar exemplos a cada componente novo. | Exemplos atuais cobrem MVP principal. |
| GDUI-902 | Partial | Nao adicionar tags sem atualizar specs. | Specs existem; precisa disciplina em PRs. |
| GDUI-903 | Partial | Nao adicionar comportamento sem teste. | Algumas features ainda estao sem teste dedicado. |
