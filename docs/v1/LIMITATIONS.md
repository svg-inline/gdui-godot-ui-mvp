# LIMITATIONS

## O que este projeto não promete

Godot UI MVP não é um conversor universal de HTML para Godot.

Ele também não é:

- Browser engine.
- WebView embutida.
- Implementação completa de CSS.
- Runtime JavaScript.
- Clone do DOM.
- Sistema de layout web fiel.
- Clone de GTML.

## Limites do markup

- Apenas tags `gd-*` documentadas são aceitas.
- O arquivo deve ter exatamente um componente raiz.
- Texto solto é ignorado para geração de nodes no MVP.
- Atributos desconhecidos não devem virar comportamento implícito.

## Limites de estilo

- Cores devem usar hex no MVP.
- `padding`, `radius`, `gap`, `width` e `height` usam valores simples.
- Não há suporte a seletores CSS completos.
- Não há cascade real.
- Não há media queries reais no exportador atual.
- CSS variables, `var()`, `calc()`, `clamp()`, `rem`, `em`, `vh` e `vw` ficam fora do MVP.
- Pseudo-elementos como `::before` e `::after` ficam fora.
- `@keyframes`, transições complexas e animações CSS ficam fora.

## Limites do exporter

- `gd-texture` guarda caminho de imagem em metadata no MVP.
- O exportador ainda não cria `ExtResource` para textura.
- `Theme .tres` ainda é etapa futura.
- Actions são metadata, não conexões automáticas de sinais.
- Regras responsivas podem exigir runtime Godot futuro.

## Limites de preview

O preview no navegador é ferramenta de autoria. A fonte de verdade para exportação é o markup e a AST, não Shadow DOM ou CSS computado pelo browser.

## Comparação com GTML

GTML suporta muito mais HTML/CSS familiar, incluindo vários elementos, propriedades de CSS e pseudo-classes. Este projeto escolhe um escopo menor para preservar:

- previsibilidade;
- AST estável;
- `.tscn` editável;
- Theme exportável;
- baixa ambiguidade de layout.

## Responsividade

Este projeto não suporta media queries CSS reais.

Responsividade Godot própria está dentro do escopo.
Fidelidade web/browser está fora do escopo.

O alvo responsivo não é baseado apenas em polegadas físicas, mas em viewport, resolução, escala de UI e distância de leitura.

Em vez disso, usa um sistema próprio de breakpoints declarativos:

- `sm`
- `md`
- `lg`
- `xl`
- `tv`

Exemplo:

```html
<gd-grid columns="2" md:columns="3" lg:columns="4" tv:columns="6"></gd-grid>
```
