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

## v1.1 proposta

Prioridade sugerida:

1. Publicacao: icon, checklist de release e validacao do bundle distribuivel.
2. Governanca: docs novas e tasks versionadas.
3. Listas declarativas: `gd-list` com contrato pequeno e runtime opcional.
4. Studio: diagnosticos melhores para limites e props nao suportadas.

Tasks detalhadas ficam em `tasks/v1.1/TASKS.md`.

## Candidatos futuros

- Eventos declarativos alem de `action`, como `on-changed` e `on-selected`.
- Reatividade com listas, computed values seguros ou validacao de schema.
- Comparacao visual assistida do Studio, sem transformar preview web em fonte de verdade.
- Mais variacoes de Theme `.tres`.
- Empacotamento automatizado para Asset Library.

## Nao objetivos

- WebView como saida principal.
- Mini-browser runtime.
- Compatibilidade total com HTML.
- Compatibilidade total com CSS.
- Shadow DOM como fonte de verdade.
- Editor drag-and-drop no curto prazo.

