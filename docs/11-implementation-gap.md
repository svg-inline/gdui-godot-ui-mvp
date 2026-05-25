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
| GDUI-005 | Snapshot tests para `.tscn` gerado. | Mudancas no exporter ficam visiveis e intencionais. |
| GDUI-006 | Smoke test Godot abrindo cenas geradas. | Garantia de que `.tscn` abre editavel no Godot 4.x. |

Notas:

- Os testes atuais cobrem parser e alguns trechos de exporter.
- Falta testar arquivos completos como `InventoryScreen.tscn`.
- O smoke test pode usar `godot.exe --headless` quando disponivel.

## Responsividade

Existe base tecnica, mas ainda nao esta fechada como feature confiavel.

| Task | Falta | Resultado esperado |
| --- | --- | --- |
| GDUI-022 | Testar metadata responsiva no Scene AST. | `md:*`, `lg:*`, `tv:*` ficam estaveis no contrato. |
| GDUI-023 | Validar breakpoints no runtime. | `responsive_runtime.gd` aplica overrides sem erro. |
| GDUI-025 | Testes dedicados de AST responsiva. | Parser/normalizer nao quebram props responsivas. |
| GDUI-026 | Cena ou teste de runtime responsivo. | Grid muda colunas conforme viewport. |

Notas:

- A sintaxe responsiva ja existe.
- O runtime existe, mas precisa prova em Godot real.
- Navegacao por foco para TV ainda deve ser tratada depois.

## Theme `.tres`

Esta e a maior lacuna de produto.

| Task | Falta | Resultado esperado |
| --- | --- | --- |
| GDUI-020 | Tokens minimos. | Base compartilhada para cor, spacing, radius e font size. |
| GDUI-030 | `theme.gdui.json`. | Arquivo de autoria de tema. |
| GDUI-031 | Schema de tokens. | Validacao previsivel. |
| GDUI-032 | Exportador `Theme .tres`. | Godot recebe Theme nativo editavel. |
| GDUI-033 | Variants usando Theme. | `variant="primary"` deixa de depender so de override local. |
| GDUI-034 | Exemplo com tema compartilhado. | Demonstra valor real do Theme. |

Notas:

- Hoje `StyleBoxFlat` e overrides locais resolvem o MVP visual.
- O diferencial de longo prazo pede Theme `.tres`.
- Comecar pequeno: Label, Button, PanelContainer e Card.

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
| GDUI-052 | Melhor retorno visual do compile no editor. | Usuario ve sucesso/erro sem depender so do console. |
| GDUI-053 | Robustez do lifecycle do Studio. | Start/Open/Stop previsiveis no editor. |
| GDUI-054 | Painel de warnings. | Warnings do compilador aparecem no Godot. |
| GDUI-056 | Dock Godot. | Comandos e status em UI propria do addon. |

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

1. `GDUI-005`, `GDUI-006`: fechar confiabilidade do `.tscn`.
2. `GDUI-020`, `GDUI-030`, `GDUI-031`, `GDUI-032`: iniciar Theme `.tres`.
3. `GDUI-054`, `GDUI-056`: criar dock e warnings no Godot.
4. `GDUI-025`, `GDUI-026`: testar responsividade.
5. `GDUI-042`, `GDUI-043`: validar actions em cena real.

## Nao fazer agora

- Reativar importer automatico sem resolver o loop de reimportacao.
- Prometer CSS completo.
- Adicionar WebView como runtime.
- Comecar reatividade antes de Theme e validacao Godot.
