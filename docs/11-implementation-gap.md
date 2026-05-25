# 11 - Implementation Gap

Este documento lista o que ainda falta para o projeto cumprir as specs atuais. Cada item referencia uma task em `TASKS.md`.

## Resumo executivo

O nucleo do MVP esta funcional:

```text
.gdui.html -> AST -> Godot Scene AST -> .tscn editavel
```

O que ainda impede o projeto de ser uma ferramenta solida nao e o parser basico, mas sim validacao, Theme `.tres`, melhor integracao com o editor Godot e testes de contrato.

## Fechar confiabilidade do `.tscn`

Prioridade maxima.

| Task | Falta | Resultado esperado |
| --- | --- | --- |
| GDUI-007 | Rodar smoke test Godot em CI e versoes alvo. | Garantia continua de que `.tscn` abre editavel no Godot 4.x. |

Notas:

- Os testes atuais cobrem parser, trechos de exporter e snapshots completos de `scenes/*.tscn`.
- `npm run test:godot` carrega e instancia as cenas geradas via Godot headless, e tambem carrega `scenes/theme.tres`.
- Falta transformar o smoke test em rotina de CI e validar em mais de uma versao Godot 4.x.

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

Esta e a maior lacuna de produto.

| Task | Falta | Resultado esperado |
| --- | --- | --- |
| GDUI-033 | Ampliar variants usando Theme. | `variant="primary"` deixa de depender so de override local. |

Notas:

- `theme.gdui.json`, `theme.gdui.schema.json`, exporter inicial e `scenes/theme.tres` ja existem.
- O Theme atual cobre Label, Button, estados de Button, PrimaryButton, PanelContainer e Card.
- Falta reducao gradual de overrides locais no `.tscn` quando houver token equivalente.

## Actions e eventos

Boa base, mas falta demonstrar o fluxo completo dentro do Godot.

| Task | Falta | Resultado esperado |
| --- | --- | --- |
| GDUI-040 | Fechar contrato de eventos suportados. | `action` fica estavel e eventos futuros ficam delimitados. |
| GDUI-042 | Validar `action_router.gd` em cena real. | Botao com metadata emite `action_triggered`. |
| GDUI-043 | Exemplo conectado ao router. | Menu de exemplo mostra actions funcionando. |

Notas:

- `metadata/action` ja e gerado no `.tscn`.
- O router existe, mas precisa exemplo de uso e validacao.

## Addon Godot e Studio

O fluxo manual e o Studio local existem. O importer automatico ficou adiado por seguranca.

| Task | Falta | Resultado esperado |
| --- | --- | --- |
| GDUI-053 | Robustez do lifecycle do Studio. | Start/Open/Stop previsiveis no editor. |

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

1. `GDUI-007`: levar smoke test Godot para CI/versoes alvo.
2. `GDUI-033`: reduzir overrides locais usando Theme `.tres`.
3. `GDUI-052`, `GDUI-053`: melhorar feedback e lifecycle do Studio no dock.
4. `GDUI-026`: ampliar cobertura de responsividade/foco.
5. `GDUI-042`, `GDUI-043`: validar actions em cena real.

## Nao fazer agora

- Reativar importer automatico sem resolver o loop de reimportacao.
- Prometer CSS completo.
- Adicionar WebView como runtime.
- Comecar reatividade antes de Theme e validacao Godot.
