# 03 - AST Spec

## Markup AST

O parser gera uma árvore próxima do markup original.

```json
{
  "type": "element",
  "tag": "gd-screen",
  "attrs": {
    "name": "MainMenu",
    "anchor": "full"
  },
  "children": []
}
```

## Campos

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `type` | string | `element` ou `text`. |
| `tag` | string | Nome da tag `gd-*`. |
| `attrs` | object | Atributos crus do markup. |
| `children` | array | Filhos na ordem declarada. |
| `value` | string | Valor de node de texto. |

## Regras

- A AST deve ter uma raiz única.
- Tags devem estar normalizadas em minúsculas.
- Atributos preservam nomes como escritos, incluindo `min-width`.
- Comentários não entram na AST.
- Text nodes vazios não entram na AST.

## Godot Scene AST

Antes de exportar `.tscn`, a Markup AST é normalizada para uma árvore orientada ao Godot.

```json
{
  "tag": "gd-button",
  "type": "Button",
  "name": "PlayButton",
  "props": {
    "text": "\"Jogar\"",
    "metadata/action": "\"menu.play\""
  },
  "attrs": {
    "text": "Jogar",
    "action": "menu.play"
  },
  "children": []
}
```

## Regras da Scene AST

- `type` é o tipo de node Godot.
- `name` deve ser seguro para `.tscn`.
- `props` guarda propriedades já traduzidas.
- `attrs` preserva os atributos originais para diagnósticos e exportadores futuros.
- Referências circulares como `parent` não devem aparecer no JSON impresso.
