# 05 - Theme Exporter Spec

## Objetivo

Gerar um `Theme .tres` reutilizável para Godot 4.x a partir de tokens declarativos.

O Theme exporter ja existe em versao inicial. Esta spec define o contrato esperado para evoluir de MVP para ferramenta mais completa.

## Arquivo de entrada

Implementado inicialmente em `theme.gdui.json`:

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

O schema formal fica em:

```text
theme.gdui.schema.json
```

## Saída

O exportador deve criar:

```text
theme.tres
```

Com recursos como:

- `Theme`
- `StyleBoxFlat`
- variações para `Button`, `Label`, `PanelContainer`, `Card` e `PrimaryButton`

Comando atual:

```bash
npm run compile:theme
```

## Variants

`variant="primary"` em um botão deve apontar para uma variação de tema previsível:

```text
theme_type_variation = &"PrimaryButton"
```

Estado atual:

- `PrimaryButton/base_type = &"Button"` e estilo normal sao gerados.
- Estados `hover`, `pressed` e `disabled` sao gerados para `Button`.
- Estados `hover`, `pressed` e `disabled` sao gerados para `PrimaryButton`.
- `Card/base_type = &"PanelContainer"` e estilo de panel sao gerados.

## Regra de prioridade

1. Tokens do tema.
2. Props explícitas no node.
3. Defaults do Godot.

## Restrições

- Não implementar cascade CSS.
- Não aceitar seletores arbitrários.
- Não gerar Theme que dependa de WebView.
- Não esconder estilo em scripts quando `Theme .tres` resolver.

## Pendencias

- Reduzir overrides locais no `.tscn` quando houver token equivalente.
