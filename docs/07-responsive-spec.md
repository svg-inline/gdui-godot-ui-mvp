# 07 - Responsive Spec

## Objetivo

Permitir que uma UI declarativa gere cenas Godot adaptáveis sem copiar o modelo inteiro de CSS media queries.

O alvo responsivo não é baseado apenas em polegadas físicas, mas em viewport, resolução, escala de UI e distância de leitura.

## Breakpoints

| Nome | Faixa alvo | Uso |
| --- | --- | --- |
| `sm` | até 640 | Celular e janelas estreitas. |
| `md` | 641-1024 | Tablet, notebooks pequenos e Steam Deck-like. |
| `lg` | 1025-1440 | Desktop e notebooks em viewport padrão. |
| `xl` | 1441-1919 | Desktop amplo. |
| `tv` | 1920+ | TV, sofá, controle e leitura distante. |

## Sintaxe proposta

Proposta para evolução:

```html
<gd-grid columns="2" md:columns="3" lg:columns="4" tv:columns="6">
  ...
</gd-grid>
```

## Props responsivas candidatas

- `columns`
- `gap`
- `padding`
- `visible`
- `min-width`
- `min-height`
- `font-size`

## Exportação

O `.tscn` estático deve conter defaults seguros. Comportamento responsivo real pode exigir runtime Godot ou script auxiliar.

Exemplo de lógica runtime:

```gdscript
if width >= 1920:
    grid.columns = 6
elif width >= 1024:
    grid.columns = 4
else:
    grid.columns = 2
```

## Regras

- O breakpoint menor é o default.
- Breakpoints maiores sobrescrevem apenas a prop declarada.
- A sintaxe deve ser validada no parser.
- O preview web pode simular breakpoints, mas não é fonte de verdade.
- Breakpoints devem considerar stretch settings do projeto Godot.
- Telas `tv` devem preservar navegação por foco.

## Foco para TV e controle

Layouts para TV precisam tratar:

- `focus_mode` em botões e inputs;
- `focus_neighbor_top/right/bottom/left` quando o layout não for linear;
- ações Godot como `ui_up`, `ui_down`, `ui_left`, `ui_right` e `ui_accept`;
- tamanho mínimo e espaçamento maiores para leitura distante.

## Fora do escopo

- Container queries.
- `calc()`, `clamp()` e expressões CSS.
- Reflow igual ao browser.
- CSS Grid completo.
