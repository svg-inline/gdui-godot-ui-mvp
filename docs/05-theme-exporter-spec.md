# 05 - Theme Exporter Spec

## Objetivo

Gerar um `Theme .tres` reutilizável para Godot 4.x a partir de tokens declarativos.

O Theme exporter ainda é futuro, mas esta spec define o contrato esperado.

## Arquivo de entrada

Proposta:

```json
{
  "colors": {
    "surface": "#111827",
    "text": "#f8fafc",
    "primary": "#38bdf8"
  },
  "spacing": {
    "sm": 8,
    "md": 16,
    "lg": 24
  },
  "radius": {
    "md": 12,
    "lg": 18
  },
  "fontSizes": {
    "body": 16,
    "title": 28
  }
}
```

## Saída

O exportador deve criar:

```text
theme.tres
```

Com recursos como:

- `Theme`
- `StyleBoxFlat`
- variações para `Button`, `Label` e `PanelContainer`

## Variants

`variant="primary"` em um botão deve apontar para uma variação de tema previsível:

```text
theme_type_variation = &"PrimaryButton"
```

## Regra de prioridade

1. Tokens do tema.
2. Props explícitas no node.
3. Defaults do Godot.

## Restrições

- Não implementar cascade CSS.
- Não aceitar seletores arbitrários.
- Não gerar Theme que dependa de WebView.
- Não esconder estilo em scripts quando `Theme .tres` resolver.
