# 08 - Events and Actions Spec

## Objetivo

Definir como markup declara intenção de interação sem embutir JavaScript.

O sistema deve aprender com ferramentas como GTML, que expõem sinais para clique, link, input, select e submit. A diferença é que aqui o contrato principal é `metadata/action` em nodes Godot editáveis.

## Action

`action` é uma string estável que identifica uma intenção:

```html
<gd-button text="Equipar" action="inventory.equip" />
```

No `.tscn`, ela vira metadata:

```text
metadata/action = "inventory.equip"
```

## Contrato MVP

No MVP, apenas `action` em `gd-button` tem comportamento runtime oficial.

| Markup | Node Godot | Metadata | Sinal conectado pelo router |
| --- | --- | --- | --- |
| `gd-button action="menu.play"` | `Button` | `metadata/action = "menu.play"` | `pressed` |

O compilador exporta metadata mesmo quando o nome foge do padrão, mas emite warning. Isso preserva cenas existentes e ainda orienta o contrato recomendado.

## Nomes de action

Usar padrão pontuado:

```text
domain.intent
domain.intent.target
```

Formato recomendado:

```text
[a-z][a-z0-9_-]*(.[a-z][a-z0-9_-]*)+
```

Exemplos:

- `menu.play`
- `menu.settings`
- `inventory.close`
- `inventory.use.potion`

## Eventos declarativos futuros

Proposta:

```html
<gd-button text="Jogar" on-pressed="menu.play" />
```

No MVP, preferir `action`.

## Famílias de eventos futuras

| Caso | Prop proposta | Sinal Godot provável |
| --- | --- | --- |
| Botão | `on-pressed` | `pressed` |
| Link | `on-link` | `pressed` em `LinkButton` futuro |
| Input texto | `on-changed` | `text_changed` |
| Select | `on-selected` | `item_selected` |
| Formulário | `on-submit` | helper runtime |

Esses eventos continuam fora do MVP até terem mapping, exemplo e teste.

## Metadata

Metadados futuros podem incluir:

```html
<gd-button action="inventory.equip" item-id="sword" />
```

Exportação proposta:

```text
metadata/action = "inventory.equip"
metadata/item_id = "sword"
```

## Sinais Godot

O runtime inicial procura nodes com `metadata/action` e conecta `pressed` para botões.

API atual:

```gdscript
signal action_triggered(action: String, source: Node, metadata: Dictionary)
```

Uso mínimo:

```gdscript
var router := GduiActionRouter.new()
add_child(router)
router.action_triggered.connect(_on_action)
router.connect_actions(self)
```

## Restrições

- Não executar JavaScript.
- Não gerar scripts complexos sem pedido explícito.
- Não esconder lógica de jogo dentro do markup.
- Não exigir runtime para cenas sem interação dinâmica.
- Não adicionar nova família de evento sem mapping para node nativo, exemplo e teste.
