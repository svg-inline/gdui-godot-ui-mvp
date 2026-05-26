# Tasks - v1.1

Objetivo da v1.1: transformar a v1.0 em uma base publicavel e preparar a primeira expansao controlada apos o MVP, sem quebrar o contrato principal:

```text
gd-* previsivel + AST estavel + .tscn editavel + Theme .tres
```

## Status

- `Done`: implementado e coberto minimamente.
- `Partial`: existe implementacao, mas falta teste, validacao Godot ou acabamento.
- `Planned`: especificado, ainda nao implementado.
- `Deferred`: adiado de proposito por risco ou mudanca de direcao.

## v1.1 - Documentacao e governanca

| ID | Status | Task | Evidencia esperada |
| --- | --- | --- | --- |
| GDUI-110 | Done | Arquivar documentacao v1.0 em `docs/v1/`. | Docs antigos movidos para `docs/v1/`. |
| GDUI-111 | Done | Criar documentacao atual enxuta na raiz de `docs/`. | `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/COMPONENTS.md`, `docs/DEVELOPMENT.md`, `docs/ROADMAP.md`. |
| GDUI-112 | Done | Versionar tasks por pasta de plugin. | `tasks/v1.0/TASKS.md`, `tasks/v1.1/TASKS.md` e indice em `TASKS.md`. |

## v1.1 - Publicacao

| ID | Status | Task | Evidencia esperada |
| --- | --- | --- | --- |
| GDUI-113 | Done | Adicionar `addons/gdui/icon.png` 128x128 para Asset Library. | Arquivo PNG versionado e README sem pendencia manual. |
| GDUI-114 | Done | Criar checklist de release do addon. | `docs/RELEASE.md` com build, zip, verificacoes e submissao. |
| GDUI-115 | Done | Validar bundle distribuivel sem arquivos de desenvolvimento. | `tools/validate-addon-bundle.js`, `npm run validate:addon` e teste Node. |

## v1.1 - Listas declarativas

| ID | Status | Task | Evidencia esperada |
| --- | --- | --- | --- |
| GDUI-120 | Done | Especificar `gd-list` com contrato limitado. | Spec em `docs/COMPONENTS.md`. |
| GDUI-121 | Done | Mapear `gd-list` para nodes Godot nativos. | `VBoxContainer` ou `GridContainer`, sem WebView e sem renderer obrigatorio. |
| GDUI-122 | Done | Definir metadata de item/template para runtime opcional. | `metadata/gdui_list` preservado no `.tscn`. |
| GDUI-123 | Done | Criar exemplo de lista declarativa. | `examples/quest-list.gdui.html`. |
| GDUI-124 | Done | Cobrir lista com testes automatizados. | Testes de parser/normalizer/exporter em `tools/gdui/tests/parser.test.js`. |

## v1.1 - Studio e diagnosticos

| ID | Status | Task | Evidencia esperada |
| --- | --- | --- | --- |
| GDUI-130 | Done | Melhorar diagnosticos de unsupported props com sugestao de alternativa Godot. | Teste no Studio diagnostics. |
| GDUI-131 | Done | Documentar limites do preview web auxiliar. | `docs/DEVELOPMENT.md` atualizado. |

## Fora da v1.1

- CSS completo.
- JavaScript runtime.
- WebView.
- Shadow DOM como fonte de verdade.
- Reatividade com expressoes livres.
- Editor drag-and-drop.
