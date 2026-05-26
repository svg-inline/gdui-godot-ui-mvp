# Tasks - v1.2

Objetivo da v1.2: aprofundar o diferencial de Theme `.tres`, preparar release automatizado do addon e melhorar o Studio web como ferramenta de autoria sem mudar a fonte de verdade:

```text
gd-* previsivel + AST estavel + .tscn editavel + Theme .tres
```

## Status

- `Done`: implementado e coberto minimamente.
- `Partial`: existe implementacao, mas falta teste, validacao Godot ou acabamento.
- `Planned`: especificado, ainda nao implementado.
- `Deferred`: adiado de proposito por risco ou mudanca de direcao.

## v1.2 - Theme `.tres` e variantes

| ID | Status | Task | Evidencia esperada |
| --- | --- | --- | --- |
| GDUI-200 | Done | Especificar contrato de Theme v1.2 por componente. | `docs/COMPONENTS.md` documenta tokens, variants e limites. |
| GDUI-201 | Done | Migrar estilos visuais recorrentes para Theme `.tres`. | Exporter reduz inline stylebox quando houver `theme`/`variant` equivalente. |
| GDUI-202 | Done | Definir variants oficiais para `gd-button`, `gd-card`, `gd-label` e inputs. | Exemplos com `variant` e snapshots `.tscn` editaveis. |
| GDUI-203 | Done | Cobrir Theme v1.2 com testes de exporter. | Testes Node cobrem tokens, variants e fallback seguro. |
| GDUI-204 | Done | Criar exemplo tematico v1.2. | `examples/theme-variants.gdui.html` e `scenes/ThemeVariantsScreen.tscn`. |

## v1.2 - Release automation

| ID | Status | Task | Evidencia esperada |
| --- | --- | --- | --- |
| GDUI-210 | Planned | Criar comando unico de verificacao local. | Script `verify` combinando testes Node, compile, theme, Godot smoke e bundle validation. |
| GDUI-211 | Planned | Automatizar pacote zip do addon. | Script gera zip com apenas arquivos permitidos pelo checklist de release. |
| GDUI-212 | Planned | Validar zip distribuivel em CI. | Workflow roda build, validate e inspeção do zip. |
| GDUI-213 | Planned | Documentar fluxo final de release v1.2. | `docs/RELEASE.md` atualizado com comandos finais e criterio de aceite. |

## v1.2 - Studio web editor

Esta trilha melhora a autoria web sem transformar o Studio em fonte de verdade. O Studio continua auxiliar; a saida canonica segue sendo `.tscn` editavel.

| ID | Status | Task | Evidencia esperada |
| --- | --- | --- | --- |
| GDUI-220 | Planned | Listar todos os componentes `gd-*` suportados no Studio. | Painel lateral gerado a partir de um catalogo unico de componentes. |
| GDUI-221 | Planned | Criar catalogo de snippets base por componente. | Cada componente possui snippet minimo valido e atributos documentados. |
| GDUI-222 | Planned | Ao clicar em componente da lista, copiar o codigo base. | Botao/list item copia snippet para clipboard com feedback visual. |
| GDUI-223 | Planned | Selecionar componente pelo codigo fonte. | Clique/cursor em tag `gd-*` identifica o node atual e sincroniza o inspector. |
| GDUI-224 | Planned | Selecionar componente pelo preview web auxiliar. | Clique no preview marca o elemento aproximado e sincroniza o inspector. |
| GDUI-225 | Planned | Mostrar inspector de atributos do componente selecionado. | Inspector lista props suportadas, tipos simples, defaults e descricoes. |
| GDUI-226 | Planned | Editar atributos pelo inspector com escrita no markup. | Alteracoes atualizam a tag selecionada sem quebrar o `.gdui.html`. |
| GDUI-227 | Planned | Testar catalogo, snippet copy e inspector. | Testes Node do Studio para catalogo, diagnosticos e transformacao de markup. |

## v1.2 - Responsividade controlada

| ID | Status | Task | Evidencia esperada |
| --- | --- | --- | --- |
| GDUI-230 | Planned | Revisar contrato responsivo para Theme e listas. | Docs deixam claro o que e responsivo no Godot runtime. |
| GDUI-231 | Planned | Cobrir `gd-list` grid responsivo. | Teste parser/exporter e smoke Godot se runtime aplicar metadata. |

## Fora da v1.2

- Drag-and-drop no Studio.
- WebView como saida principal.
- Mini-browser runtime.
- CSS completo.
- JavaScript runtime livre.
- Shadow DOM como fonte de verdade.
- Compatibilidade total com HTML/CSS.
