# 09 - Godot Addon Spec

## Objetivo

Criar um addon Godot para importar `.gdui.html` direto no editor e gerar `.tscn` editável.

## Estrutura alvo

```text
addons/gdui/
  plugin.cfg
  plugin.gd
  import_plugin.gd
  runtime/
    action_router.gd
```

## Fluxo de importação

1. Usuário adiciona arquivo `.gdui.html`.
2. Addon detecta o arquivo.
3. Addon chama o compilador.
4. Addon grava `.tscn`.
5. Editor Godot importa a cena gerada.
6. Warnings aparecem no painel do addon ou no output.

Live reload é desejável, inspirado no fluxo de ferramentas como GTML, mas não pode substituir o arquivo `.tscn` gerado.

## Contrato do importer

Entrada:

```text
res://ui/inventory.gdui.html
```

Saída:

```text
res://ui/inventory.tscn
```

## Configuração

Opções futuras:

- Caminho do compilador.
- Pasta de saída.
- Gerar Theme.
- Falhar em warnings.
- Mostrar AST.

## Runtime opcional

`action_router.gd` pode conectar botões por metadata:

```gdscript
if node.has_meta("action"):
    node.pressed.connect(_on_action.bind(node.get_meta("action")))
```

Ele também pode aplicar breakpoints e foco de controle/teclado quando o `.tscn` estático não for suficiente.

## Restrições

- O addon não deve usar WebView como saída.
- A cena gerada precisa continuar editável.
- O usuário deve conseguir versionar `.gdui.html` e `.tscn`.
- O addon não deve esconder a UI dentro de um único node renderer.
