# ROADMAP

## v0.1 - TSCN confiável

- Parser para tags `gd-*` suportadas.
- AST intermediária.
- Exportador `.tscn` textual.
- Exemplos básicos em `examples/`.
- Comando `npm run compile`.
- Síntese de pesquisa e posicionamento vs GTML/WebView.

## v0.2 - Design Tokens + Responsive Props básicas

- Tokens mínimos de cor, espaçamento, raio, tipografia e escala.
- Breakpoints `sm`, `md`, `lg`, `xl`, `tv`.
- Sintaxe responsiva para props como `columns`, `gap`, `padding`, `visible`, `min-width`, `min-height` e `font-size`.
- Exemplo de grid responsivo.
- Runtime mínimo para aplicar breakpoints quando `.tscn` estático não bastar.
- Navegação por teclado/controle preservada em layouts de TV.

## v0.3 - Theme .tres completo

- Arquivo `theme.gdui.json`.
- Schema de tokens completo.
- Exportador de `Theme .tres`.
- Redução de overrides locais quando houver token equivalente.
- Matriz de suporte `native`, `approx`, `custom`, `unsupported` para propriedades visuais.

## v0.4 - Eventos e actions

- Contrato de `action`.
- Metadados gerados no `.tscn`.
- Convenção para conectar sinais no Godot.
- Plano para geração auxiliar de script opcional.
- API inspirada nos aprendizados de GTML: action clicked, input changed, selection changed.

## v0.5 - Addon Godot

- Importer para `.gdui.html`.
- Reimport automático pelo editor.
- Painel simples para warnings e AST.
- Saída editável como cena.
- Live reload como conveniência, mantendo `.tscn` como artefato principal.

## v0.6 - Reatividade

- Estado declarativo mínimo.
- Bindings limitados.
- Atualização controlada por runtime Godot, não por WebView.
- Avaliar integração conceitual com bibliotecas reativas Godot sem acoplar o MVP.

## v0.7 - Preview Studio

- Preview no navegador como ferramenta de autoria.
- Comparação entre preview e saída Godot.
- Diagnósticos visuais de componentes não suportados.
