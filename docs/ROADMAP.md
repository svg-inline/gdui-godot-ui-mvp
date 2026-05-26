# Roadmap

## Estado atual

v1.0 esta funcional como MVP:

```text
.gdui.html -> AST -> Godot Scene AST -> .tscn editavel
```

O projeto ja cobre:

- Parser restrito para `gd-*`.
- Exportacao `.tscn`.
- Theme `.tres` inicial.
- Props responsivas com runtime Godot.
- Actions via metadata e router.
- Bindings limitados.
- Addon Godot com dock.
- Studio local como ferramenta auxiliar.
- CI com testes Node e smoke Godot.

## v1.1 fechada

v1.1 consolidou a base publicavel:

- Publicacao: icon, checklist de release e validacao do bundle distribuivel.
- Governanca: docs novas e tasks versionadas.
- Listas declarativas: `gd-list` com contrato pequeno e runtime opcional.
- Studio: diagnosticos melhores para limites e props nao suportadas.

Tasks detalhadas ficam em `tasks/v1.1/TASKS.md`.

## v1.2 proposta

Prioridade sugerida:

1. Theme `.tres`: contrato de tokens/variants e menos estilo inline recorrente.
2. Release automation: comando unico de verify e zip distribuivel validado.
3. Studio web editor: catalogo de componentes, copy de snippets e inspector de atributos.
4. Responsividade controlada: alinhar Theme/listas com o runtime Godot.

O Studio web continua auxiliar. Clicar no preview ou no codigo pode ajudar autoria, mas a fonte de verdade segue sendo `.gdui.html -> AST -> .tscn`.

Tasks detalhadas ficam em `tasks/v1.2/TASKS.md`.

## Candidatos futuros

- Eventos declarativos alem de `action`, como `on-changed` e `on-selected`.
- Reatividade com listas, computed values seguros ou validacao de schema.
- Comparacao visual assistida do Studio, sem transformar preview web em fonte de verdade.
- Mais variacoes de Theme `.tres`.
- Empacotamento automatizado para Asset Library.
- Drag-and-drop no Studio apos catalogo, snippets e inspector estarem estaveis.

## Nao objetivos

- WebView como saida principal.
- Mini-browser runtime.
- Compatibilidade total com HTML.
- Compatibilidade total com CSS.
- Shadow DOM como fonte de verdade.
- Editor drag-and-drop no curto prazo.
