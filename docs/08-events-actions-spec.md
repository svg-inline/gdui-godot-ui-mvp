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

## Nomes de action

Usar padrão pontuado:

```text
domain.intent
domain.intent.target
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

O MVP não conecta sinais. O runtime ou addon futuro pode procurar nodes com `metadata/action` e conectar `pressed` para botões.

API conceitual:

```gdscript
signal action_triggered(action: String, source: Node, metadata: Dictionary)
signal input_changed(action: String, value: Variant, source: Node)
```

## Restrições

- Não executar JavaScript.
- Não gerar scripts complexos sem pedido explícito.
- Não esconder lógica de jogo dentro do markup.
- Não exigir runtime para cenas sem interação dinâmica.
