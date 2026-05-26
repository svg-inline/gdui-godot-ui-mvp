# 12 - Reactivity Spec

## Objetivo

Definir uma base minima de reatividade para UI nativa Godot sem JavaScript runtime e sem expressoes livres.

No MVP, reatividade significa:

```text
estado nomeado + bindings declarativos limitados + runtime Godot opcional
```

## Estado

`state` em `gd-screen` declara o namespace de estado esperado pela cena:

```html
<gd-screen name="InventoryScreen" state="inventory">
  ...
</gd-screen>
```

Exportacao:

```text
metadata/gdui_state = "inventory"
```

Nomes recomendados:

```text
screen
inventory
inventory.session
```

## Bindings MVP

Bindings usam prefixo `bind:` e apontam para caminhos de estado:

```html
<gd-label bind:text="inventory.title" />
<gd-button bind:disabled="inventory.locked" />
<gd-label bind:visible="inventory.has_items" />
```

Exportacao:

```text
metadata/gdui_bindings = "{\"text\":\"inventory.title\"}"
```

Bindings suportados no contrato inicial:

| Binding | Alvo Godot esperado |
| --- | --- |
| `bind:text` | `Label.text` ou `Button.text` |
| `bind:visible` | `CanvasItem.visible` |
| `bind:disabled` | `Button.disabled` |

Bindings fora dessa lista geram warning e nao entram em `metadata/gdui_bindings`.

## Regras

- Sem JavaScript.
- Sem expressoes como `count > 0`.
- Sem chamadas de funcao no markup.
- O markup declara o caminho; o valor real pertence ao runtime/controlador Godot.
- Cenas sem bindings nao precisam de runtime reativo.

## Runtime Godot

O helper inicial fica em:

```text
addons/gdui/runtime/binding_runtime.gd
```

Ele recebe um `Dictionary` de estado e aplica bindings nos nodes abaixo de `root_path`:

```gdscript
var runtime := GduiBindingRuntime.new()
add_child(runtime)
runtime.root_path = NodePath("..")
runtime.set_state({
	"inventory": {
		"title": "Inventario",
		"locked": false
	}
})
```

Tambem e possivel atualizar um caminho especifico:

```gdscript
runtime.set_state_value("inventory.title", "Configuracoes")
```

## Fora do escopo atual

- List rendering.
- Computed values.
- Two-way binding.
- Watchers/effects declarados no markup.
- Validacao de schema de estado.
