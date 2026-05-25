# ARCHITECTURE

## Pipeline

```text
.gdui.html
  -> parser
  -> Markup AST
  -> normalizer
  -> design tokens/layout rules
  -> Godot Scene AST
  -> exporter
  -> .tscn editável + .tres Theme
```

Responsividade Godot própria está dentro do escopo.
Fidelidade web/browser está fora do escopo.

## Responsabilidades

### Parser

Lê markup restrito, valida tags suportadas e transforma atributos em uma AST simples.

Entrada:

```html
<gd-button name="PlayButton" text="Jogar" action="menu.play" />
```

Saída conceitual:

```json
{
  "type": "element",
  "tag": "gd-button",
  "attrs": {
    "name": "PlayButton",
    "text": "Jogar",
    "action": "menu.play"
  },
  "children": []
}
```

### AST intermediária

Mantém a intenção da UI sem depender de detalhes do arquivo `.tscn`.

Ela deve ser serializável, testável e estável entre exportadores.

### Normalizer

Transforma props de autoria em conceitos internos estáveis:

- estilo visual
- layout
- tokens
- metadata
- ações
- responsividade

Essa camada evita que CSS-like props sejam jogadas diretamente no exportador Godot.

### Godot Scene AST

Normaliza componentes `gd-*` para nodes Godot, resolve nomes, aplica propriedades comuns e prepara sub-recursos como `StyleBoxFlat`.

### Exportador TSCN

Converte a Scene AST para texto `.tscn` válido para Godot 4.x.

### Theme exporter

Futuro módulo para gerar `Theme .tres` a partir de tokens. Ele deve substituir gradualmente overrides locais por variações reutilizáveis.

### Runtime opcional

Pequeno runtime Godot pode existir para:

- conectar `metadata/action` a sinais;
- aplicar breakpoints;
- configurar foco para teclado/controle;
- atualizar bindings reativos futuros.

Ele não deve ser obrigatório para abrir e editar a cena.

### Gdui Studio local

O Studio e uma ferramenta de autoria iniciada pelo addon Godot ou por `npm run studio`.

```text
addon Godot
  -> node addons/gdui/server/studio-server.js
  -> navegador em 127.0.0.1
  -> edita .gdui.html
  -> chama compilador
  -> atualiza .tscn editavel
```

O Studio pode ter preview web auxiliar, edicao de arquivos e diagnosticos. Ele nao e runtime do jogo, nao substitui `.tscn` e nao transforma o projeto em WebView.

## Mapeamento de pacotes alvo

```text
packages/compiler        parser, validação, AST
packages/godot-exporter  Scene AST e .tscn
packages/theme-exporter  Theme .tres
packages/components      contrato dos gd-*
packages/runtime         helpers opcionais de actions e responsividade
addons/gdui              integração com editor Godot
```

## Estado atual

O MVP atual concentra a implementação em `src/`:

- `src/parser.js`
- `src/mapping.js`
- `src/exporters/tscn.js`
- `src/index.js`

A evolução deve extrair esses módulos para a arquitetura alvo sem mudar o contrato público de uma vez.

O servidor atual vive em `addons/gdui/server/` porque sua responsabilidade e integrar a experiencia do addon. A logica de compilacao permanece em `tools/gdui/src/` e deve migrar futuramente para `packages/compiler` e `packages/godot-exporter`.

## Aprendizados do GTML

GTML mostra que a arquitetura modular é importante:

- parser separado;
- resolução de estilos antes de renderizar;
- builders por família de elemento;
- camada de signals;
- API de consulta por ID;
- live reload.

Este projeto deve reaproveitar a lição de modularidade, mas com alvo diferente: compilação determinística para arquivos editáveis.

## Fluxo proibido

Evitar:

```text
HTML/CSS arbitrário -> heurísticas -> nodes Godot
```

Preferir:

```text
gd-* explícito -> contrato documentado -> exportação previsível
```

### Responsive Normalizer

Resolve props responsivas como:

- `md:columns`
- `lg:padding`
- `tv:font-size`
- `tv:gap`
- `md:visible`

Ele gera uma tabela de variantes por breakpoint dentro da Godot Scene AST.

### Responsive Runtime

Runtime opcional responsável por:

- detectar largura atual da viewport;
- aplicar overrides por breakpoint;
- atualizar `GridContainer.columns`;
- ajustar `theme_override_constants/separation`;
- ajustar `custom_minimum_size`;
- configurar foco para TV/controle.

O runtime não deve ser necessário para abrir a cena, mas é necessário para responsividade dinâmica.

O alvo responsivo não é baseado apenas em polegadas físicas, mas em viewport, resolução, escala de UI e distância de leitura.
