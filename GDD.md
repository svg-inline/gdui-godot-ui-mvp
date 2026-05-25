# GDD

## Visão

Godot UI MVP é uma ferramenta para escrever interfaces de Godot em um formato declarativo inspirado em HTML, mas limitado a componentes `gd-*` que possuem equivalentes nativos no Godot.

O produto deve ajudar times que gostam da ergonomia de markup a gerar cenas `.tscn` editáveis, sem transformar o Godot em um navegador.

## Posicionamento

O nome mental do produto é:

```text
Godot UI Markup Compiler
```

Não vender como "HTML para Godot". Essa frase cria a expectativa errada de compatibilidade com HTML/CSS genérico.

O produto compete melhor como uma linguagem declarativa para UI nativa Godot, com preview web opcional e saída versionável.

## Público

- Desenvolvedores Godot que querem acelerar criação de menus, HUDs e telas de inventário.
- Times com experiência em HTML/CSS que precisam entregar UI nativa para Godot.
- Criadores de ferramentas que querem gerar cenas de UI por código.

## Objetivo do MVP

Validar o fluxo:

```text
arquivo .gdui.html -> parser -> AST intermediária -> cena .tscn editável
```

O sucesso do MVP é abrir a cena gerada no Godot 4.x, editar os nodes e manter uma correspondência previsível entre markup e árvore de nodes.

## Diferenciais

- Gera `.tscn` editável como artefato principal.
- Usa tags `gd-*` com semântica Godot, evitando adivinhação de HTML.
- Trata `Theme .tres` como parte do produto, não como detalhe posterior.
- Usa preview web como ferramenta de autoria, não como runtime final.
- Define limites explícitos para CSS, responsividade, eventos e reatividade.

## Referência competitiva

GTML é a referência mais próxima: parseia HTML/CSS e cria controls nativos no Godot. Ele é valioso como estudo de renderers, parser CSS, signals e live reload.

O espaço deste projeto é diferente:

```text
GTML: HTML/CSS familiar -> UI Godot em runtime/addon
Gdui: gd-* markup -> AST -> .tscn editável + Theme .tres
```

## Escopo

- Componentes declarativos com prefixo `gd-*`.
- Parser simples e determinístico.
- AST JSON serializável.
- Exportação textual para `.tscn` editável.
- Estilos básicos convertidos para propriedades Godot e `StyleBoxFlat`.
- Sistema de design tokens para cores, espaçamento, radius, tipografia e escala.
- Sistema responsivo próprio baseado em breakpoints declarativos.
- Suporte inicial para layouts adaptáveis entre notebook, desktop e TV.
- Props responsivas como `columns`, `gap`, `padding`, `visible`, `min-width`, `min-height` e `font-size`.
- Runtime Godot opcional para aplicar breakpoints quando o `.tscn` estático não for suficiente.
- Metadados para ações, classes, imagens e foco/navegação.

Responsividade Godot própria está dentro do escopo.
Fidelidade web/browser está fora do escopo.

O alvo responsivo não é baseado apenas em polegadas físicas, mas em viewport, resolução, escala de UI e distância de leitura.

## Fora do escopo

- Compatibilidade com HTML arbitrário.
- Motor CSS completo.
- JavaScript no runtime.
- Layout web fiel ao navegador.
- Reatividade completa.
- Editor visual drag-and-drop.
- Ser um clone de GTML.
- WebView como saída principal.

## Experiência desejada

O usuário deve escrever uma tela em `.gdui.html`, usando componentes `gd-*`, tokens e props responsivas, rodar um comando de compilação e receber uma cena `.tscn` editável que se comporte bem em notebook, desktop e TV.

A saída deve parecer natural dentro da árvore de cenas do Godot, usando `Control`, containers, `Theme`, `StyleBoxFlat` e runtime auxiliar apenas quando necessário.
