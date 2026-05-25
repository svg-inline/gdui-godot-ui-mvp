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
| GDUI-007 | Planned | Rodar smoke test Godot em CI e versoes alvo. | Teste local existe; falta automacao externa. |

## v0.2 - Design Tokens + Responsive Props basicas

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-020 | Done | Definir tokens minimos de cor, espacamento, raio, tipografia e escala. | `theme.gdui.json` |
| GDUI-021 | Done | Definir sintaxe responsiva para props com prefixos. | `md:*`, `lg:*`, `tv:*` aceitos pelo parser de atributos. |
| GDUI-022 | Done | Normalizar props responsivas para metadata. | `metadata/gdui_responsive` gerado e testado em `tools/gdui/tests/responsive.test.js`. |
| GDUI-023 | Partial | Implementar breakpoints documentados. | `responsive_runtime.gd` existe; falta teste Godot automatizado. |
| GDUI-024 | Done | Adicionar exemplo de grid responsivo. | `examples/responsive-grid.gdui.html` |
| GDUI-025 | Done | Criar testes de AST responsiva. | `tools/gdui/tests/responsive.test.js` |
| GDUI-026 | Planned | Validar runtime minimo aplicando breakpoint correto. | Ainda sem cena/teste de runtime. |

## v0.3 - Theme `.tres`

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-030 | Done | Criar `theme.gdui.json`. | `theme.gdui.json` |
| GDUI-031 | Partial | Definir schema de tokens. | Contrato inicial existe no exporter/spec; falta JSON Schema formal. |
| GDUI-032 | Done | Implementar exportador `Theme .tres`. | `tools/gdui/src/exporters/theme.js` + `scenes/theme.tres` |
| GDUI-033 | Partial | Migrar variants para Theme. | `PrimaryButton` e `Card` existem no Theme; falta reduzir overrides locais e ampliar estados. |
| GDUI-034 | Done | Adicionar exemplo com tema compartilhado. | `examples/themed-menu.gdui.html` |

## v0.4 - Eventos e actions

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-040 | Partial | Formalizar contrato de `action`. | Spec existe e exporter gera metadata; falta matriz de eventos futura. |
| GDUI-041 | Done | Gerar metadata de eventos no `.tscn`. | `metadata/action` no normalizer/exporter. |
| GDUI-042 | Partial | Criar helper Godot para conectar actions. | `addons/gdui/runtime/action_router.gd`; falta validacao em cena real. |
| GDUI-043 | Partial | Criar exemplo de menu com actions. | `main-menu.gdui.html` usa actions; falta demonstracao com router conectado. |

## v0.5 - Addon Godot + Studio

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-050 | Done | Criar estrutura `addons/gdui`. | `addons/gdui/` |
| GDUI-051 | Deferred | Implementar importer automatico de `.gdui.html`. | Desativado no MVP por causar loop de reimportacao. |
| GDUI-052 | Partial | Compilar UI pelo editor Godot. | Menu `Gdui: Compile all UI`; falta painel de logs. |
| GDUI-053 | Partial | Iniciar Studio local pelo addon. | `addons/gdui/server/studio-server.js` e menu `Start Studio`. |
| GDUI-054 | Planned | Mostrar warnings no editor. | Hoje warnings aparecem no output/terminal. |
| GDUI-055 | Deferred | Reimportar cena automaticamente quando arquivo mudar. | Adiado ate existir contrato seguro sem loop. |
| GDUI-056 | Planned | Criar dock Godot para status, logs e comandos. | Nao implementado. |

## v0.6 - Reatividade

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-060 | Planned | Definir estado declarativo minimo. | Nao implementado. |
| GDUI-061 | Planned | Definir bindings limitados. | Nao implementado. |
| GDUI-062 | Planned | Atualizar UI por runtime Godot, nao WebView. | Nao implementado. |

## v0.7 - Preview Studio avancado

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-070 | Partial | Preview web como ferramenta de autoria. | Studio tem preview auxiliar simples. |
| GDUI-071 | Planned | Comparar preview web com saida Godot. | Nao implementado. |
| GDUI-072 | Planned | Diagnosticar componentes nao suportados visualmente. | Nao implementado. |

## Higiene continua

| ID | Status | Task | Evidencia |
| --- | --- | --- | --- |
| GDUI-900 | Partial | Manter README alinhado com o estado real. | Atualizado, mas deve acompanhar cada release. |
| GDUI-901 | Partial | Atualizar exemplos a cada componente novo. | Exemplos atuais cobrem MVP principal. |
| GDUI-902 | Partial | Nao adicionar tags sem atualizar specs. | Specs existem; precisa disciplina em PRs. |
| GDUI-903 | Partial | Nao adicionar comportamento sem teste. | Algumas features ainda estao sem teste dedicado. |
