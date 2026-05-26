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
| GDUI-113 | Planned | Adicionar `addons/gdui/icon.png` 128x128 para Asset Library. | Arquivo PNG versionado e README sem pendencia manual. |
| GDUI-114 | Planned | Criar checklist de release do addon. | `docs/RELEASE.md` com build, zip, verificacoes e submissao. |
| GDUI-115 | Planned | Validar bundle distribuivel sem arquivos de desenvolvimento. | Teste ou script que confirma que `addons/gdui/` contem o necessario. |

## v1.1 - Listas declarativas

| ID | Status | Task | Evidencia esperada |
| --- | --- | --- | --- |
| GDUI-120 | Planned | Especificar `gd-list` com contrato limitado. | Spec em `docs/COMPONENTS.md` ou documento dedicado. |
| GDUI-121 | Planned | Mapear `gd-list` para nodes Godot nativos. | Implementacao sem WebView e sem renderer obrigatorio. |
| GDUI-122 | Planned | Definir metadata de item/template para runtime opcional. | AST e `.tscn` preservam contrato de lista. |
| GDUI-123 | Planned | Criar exemplo de lista declarativa. | Novo arquivo em `examples/` e/ou `ui/`. |
| GDUI-124 | Planned | Cobrir lista com testes automatizados. | Teste de parser/normalizer/exporter e smoke Godot se houver runtime. |

## v1.1 - Studio e diagnosticos

| ID | Status | Task | Evidencia esperada |
| --- | --- | --- | --- |
| GDUI-130 | Planned | Melhorar diagnosticos de unsupported props com sugestao de alternativa Godot. | Teste no Studio diagnostics. |
| GDUI-131 | Planned | Documentar limites do preview web auxiliar. | `docs/DEVELOPMENT.md` ou `docs/ROADMAP.md` atualizado. |

## Fora da v1.1

- CSS completo.
- JavaScript runtime.
- WebView.
- Shadow DOM como fonte de verdade.
- Reatividade com expressoes livres.
- Editor drag-and-drop.

