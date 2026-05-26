# Architecture

## Fluxo principal

```text
.gdui.html
  -> parser restrito
  -> AST de markup
  -> Godot Scene AST
  -> .tscn editavel
```

O compilador nao renderiza HTML no Godot. Ele traduz um contrato declarativo pequeno para nodes Godot nativos.

## Pacotes

| Caminho | Responsabilidade |
| --- | --- |
| `packages/compiler` | Parser, normalizacao e Scene AST. |
| `packages/godot-exporter` | Exportacao de `.tscn` e scripts auxiliares. |
| `packages/theme-exporter` | Exportacao de `Theme .tres`. |
| `tools/gdui` | CLI de desenvolvimento. |
| `addons/gdui` | Plugin Godot, dock, runtime opcional e Studio local. |
| `addons/gdui/compiler` | Bundle gerado para distribuicao do addon. |

## Addon Godot

O addon oferece:

- Compilacao manual de UI.
- Compilacao de Theme.
- Auto-compile com guard de loop.
- Studio local.
- Configuracao de `inputDir` e `outputDir`.
- Inicializacao de `gdui.config.json` e `theme.gdui.json`.

## Runtime opcional

Os runtimes em `addons/gdui/runtime/` aplicam comportamentos que nao cabem apenas no `.tscn`:

- `responsive_runtime.gd`: aplica props responsivas por breakpoint.
- `action_router.gd`: conecta `metadata/action` a sinais Godot.
- `binding_runtime.gd`: aplica bindings declarativos limitados.

Cenas sem responsividade, action ou binding devem continuar utilizaveis como cenas Godot comuns.

## Contratos que nao devem mudar

- Nao usar WebView como saida principal.
- Nao prometer HTML/CSS completo.
- Nao depender de Shadow DOM para exportar.
- Nao adicionar componente sem mapping para node Godot nativo.
- Nao adicionar feature sem exemplo e teste.

