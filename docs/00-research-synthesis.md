# 00 - Research Synthesis

## Fontes usadas

Esta síntese consolida as decisões vindas destes documentos locais:

- `PREVIA.md`
- `MERCADO-ATUAL.md`
- `HTML-→-Godot-(REATIVIDADE)-1-1.md`
- `Análise-Completa-do-GTML-https-github.com-Niekvdm-godot-plugins-gtml.md`

## Tese principal

O produto não deve ser vendido como "HTML para Godot".

O posicionamento correto é:

```text
Godot UI Markup Compiler
```

ou:

```text
Web Components-inspired markup to editable Godot UI scenes
```

A força do projeto está em uma DSL declarativa `gd-*`, baseada nos conceitos nativos do Godot, que compila para `Control`, containers, `Theme`, `StyleBox` e `.tscn` editável.

## Oportunidade de mercado

As alternativas encontradas se dividem em três grupos:

| Categoria | Exemplos | Limite para este projeto |
| --- | --- | --- |
| HTML/CSS dentro da Godot | GTML | Gera UI Godot, mas o diferencial aqui precisa ser `.tscn` editável e contrato `gd-*` mais previsível. |
| WebView | Godot WRY, godot-webview | Roda HTML/CSS/JS como navegador, mas não gera nodes nativos editáveis. |
| Reatividade Godot | Rdot, Bindora, Reactive | Ajuda estado e binding, mas não resolve autoria markup -> cena. |

## Aprendizados do GTML

GTML é a referência competitiva mais próxima. Ele funciona como uma camada tipo mini-browser engine dentro da Godot, parseando HTML/CSS e criando controls nativos.

Pontos fortes a estudar:

- Renderers/builders separados por família de elemento.
- Parser CSS modular por tipo de valor.
- Resolução de estilos antes de criar nodes.
- Signals para cliques, links, inputs, selects e forms.
- API de acesso por ID.
- Live reload.

Limites importantes do GTML que abrem espaço para este projeto:

- O foco é HTML/CSS familiar, não um contrato `gd-*` estrito.
- Não parece priorizar exportação para `.tscn` editável como artefato principal.
- Carrega bastante complexidade de compatibilidade CSS.
- Mesmo sendo amplo, ainda não cobre CSS completo.

## Decisão de produto

Este projeto deve ser mais estreito e mais confiável:

```text
gd-* markup -> AST -> Godot Scene AST -> .tscn editável + Theme .tres
```

O preview web é ferramenta de autoria. A saída principal é Godot nativo versionável.

## Regra de arquitetura

Não fazer:

```text
CSS direto -> Godot
```

Fazer:

```text
Markup/CSS-like props
  -> Normalizer
  -> Design Tokens
  -> Layout AST
  -> Godot Scene AST
  -> .tscn + .tres
```

## Classificação CSS

Cada propriedade precisa ter uma classificação explícita:

- `native`: mapeia diretamente para propriedade Godot.
- `approx`: funciona com aproximação documentada.
- `custom`: exige runtime, script ou custom container.
- `unsupported`: fora do contrato.

## Responsividade

Responsividade deve ser sistema próprio de breakpoints, não media queries completas.

O alvo inclui notebook, desktop, TV e navegação por controle/teclado. Para TV, a spec precisa tratar foco, `focus_mode`, vizinhos de foco e actions `ui_*`.

## Diferencial final

O diferencial não é "usar HTML".

O diferencial é:

- Autoria familiar.
- Contrato limitado.
- Nodes Godot nativos.
- `.tscn` editável.
- `Theme .tres`.
- Addon/importer.
- Menos ambiguidade que HTML/CSS genérico.
