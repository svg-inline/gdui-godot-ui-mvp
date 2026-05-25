# 11 - Implementation Gap

Este documento lista o que ainda falta para o projeto cumprir as specs atuais. Cada item referencia uma task em `TASKS.md`.

## Resumo executivo

O nucleo do MVP esta funcional:

```text
.gdui.html -> AST -> Godot Scene AST -> .tscn editavel
```

O que ainda impede o projeto de ser uma ferramenta solida nao e o parser basico, mas sim validacao, Theme `.tres`, melhor integracao com o editor Godot e testes de contrato.

## Fechar confiabilidade do `.tscn`

Prioridade maxima. A primeira camada de CI ja existe.

| Task | Estado | Resultado |
| --- | --- | --- |
| GDUI-007 | Done | `.github/workflows/gdui-ci.yml` roda testes Node, recompila cenas/tema e valida as cenas com Godot headless. |

Notas:

- Os testes atuais cobrem parser, trechos de exporter e snapshots completos de `scenes/*.tscn`.
- `npm run test:godot` carrega e instancia as cenas geradas via Godot headless, e tambem carrega `scenes/theme.tres`.
- A matriz de Godot no CI cobre `4.4.1` e `4.6.2`; novas versoes alvo podem ser adicionadas conforme o projeto decidir o suporte oficial.

## Responsividade

Existe base tecnica, mas ainda nao esta fechada como feature confiavel.

| Task | Falta | Resultado esperado |
| --- | --- | --- |
| GDUI-026 | Expandir cobertura do runtime responsivo. | Validar mais propriedades e casos reais de viewport/foco. |

Notas:

- A sintaxe responsiva e a metadata no Scene AST ja estao testadas.
- `npm run test:responsive` valida `columns`, `gap`, `font-size` e `visible` em Godot headless.
- Navegacao por foco para TV ainda deve ser tratada depois.

## Theme `.tres`

A base de Theme esta funcional.

| Task | Estado | Resultado |
| --- | --- | --- |
| GDUI-033 | Done | `theme="res://scenes/theme.tres"` referencia o Theme gerado; `PrimaryButton` e `Card` usam `theme_type_variation`; cards sem estilo inline nao geram `StyleBoxFlat` local. |

Notas:

- `theme.gdui.json`, `theme.gdui.schema.json`, exporter e `scenes/theme.tres` ja existem.
- O Theme atual cobre Label, Button, estados de Button, PrimaryButton, PanelContainer e Card.
- Overrides locais continuam permitidos quando o markup declara `background`, `radius`, `border`, `border-color` ou `padding`.

## Actions e eventos

O fluxo `metadata/action -> action_router.gd -> action_triggered` ja e validado em Godot headless.

| Task | Falta | Resultado esperado |
| --- | --- | --- |
| GDUI-040 | Fechar contrato de eventos suportados. | `action` fica estavel e eventos futuros ficam delimitados. |

Notas:

- `metadata/action` ja e gerado no `.tscn`.
- `npm run test:actions` carrega `MainMenuScreen.tscn`, conecta `action_router.gd` e valida o sinal `action_triggered`.
- `examples/main_menu_actions.gd` mostra a conexao minima em cena.

## Addon Godot e Studio

O fluxo manual, dock e Studio local existem. O importer automatico ficou adiado por seguranca.

Tasks adiadas de proposito:

| Task | Motivo |
| --- | --- |
| GDUI-051 | Importer automatico causou loop de reimportacao ao escrever `.tscn` editavel. |
| GDUI-055 | Live reimport deve voltar apenas com contrato seguro e sem escrever artefatos em loop durante scan. |

## Reatividade

Ainda nao deve ser prioridade.

| Task | Falta | Resultado esperado |
| --- | --- | --- |
| GDUI-060 | Modelo de estado. | Escopo minimo de estado declarativo. |
| GDUI-061 | Bindings limitados. | Sintaxe previsivel sem virar JavaScript runtime. |
| GDUI-062 | Runtime Godot controlado. | Atualizacao de UI sem WebView. |

Notas:

- So avancar depois de `.tscn`, Theme, actions e addon estarem mais confiaveis.

## Preview Studio avancado

O preview atual e util, mas ainda e aproximado.

| Task | Falta | Resultado esperado |
| --- | --- | --- |
| GDUI-070 | Melhorar preview web auxiliar. | Autoria mais confortavel. |
| GDUI-071 | Comparar preview com cena Godot. | Usuario entende diferencas entre preview e saida real. |
| GDUI-072 | Diagnosticos visuais. | Props/tags sem suporte ficam claras. |

Notas:

- O preview web nao deve virar fonte de verdade.
- A fonte de verdade continua sendo `.gdui.html -> .tscn`.

## Ordem recomendada

1. `GDUI-026`: ampliar cobertura de responsividade/foco.
2. `GDUI-040`: fechar contrato de eventos suportados.
3. `GDUI-070`, `GDUI-071`, `GDUI-072`: melhorar diagnosticos do preview auxiliar.
4. `GDUI-060`, `GDUI-061`, `GDUI-062`: iniciar reatividade apenas depois das validacoes acima.

## Nao fazer agora

- Reativar importer automatico sem resolver o loop de reimportacao.
- Prometer CSS completo.
- Adicionar WebView como runtime.
- Comecar reatividade antes de Theme e validacao Godot.
