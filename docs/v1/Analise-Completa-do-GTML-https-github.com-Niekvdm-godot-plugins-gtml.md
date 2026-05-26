Claro! Vou buscar tudo — docs e código fonte.Ótimo, consigo acessar! Vou buscar todos os docs e os arquivos de código em paralelo agora.Ótimo, já li os principais. Vou pegar os docs restantes agora.Lido tudo! Agora tenho uma visão completa do projeto. Deixa eu te dar uma análise aprofundada de tudo:

---

## 🔍 Análise Completa do GTML

### O que é e como funciona

O GTML é essencialmente um **mini-browser engine embutido no Godot 4**. Ele parseia HTML e CSS externos, converte cada tag em um nó Godot nativo e aplica os estilos em cima. Não usa `RichTextLabel` nem nada assim — cria de verdade `VBoxContainer`, `HBoxContainer`, `Button`, `Label`, `LineEdit`, etc. correspondentes.

---

### Arquitetura interna

```
addons/gtml/src/
├── GmlView.gd                    ← nó principal (signals, API pública)
├── css/
│   ├── GmlCssParser.gd           ← parseia o .css
│   ├── GmlStyleResolver.gd       ← resolve quais regras se aplicam
│   └── values/                   ← parsers especializados por tipo
│       ├── GmlColorValues.gd
│       ├── GmlDimensionValues.gd
│       ├── GmlFontValues.gd
│       ├── GmlBackgroundValues.gd
│       ├── GmlBorderValues.gd
│       └── GmlTransitionValues.gd
├── html_parser/
│   ├── GmlHtmlParser.gd          ← tokenizer/parser HTML
│   └── GmlNode.gd                ← DOM node
└── html_renderer/
    ├── GmlRenderer.gd            ← dispatcher principal
    ├── GmlStyles.gd              ← utilitários de estilo compartilhados
    ├── GmlTransitionManager.gd   ← animações de transition
    ├── SvgDrawControl.gd         ← desenha SVG inline
    └── elements/                 ← builders por tipo de elemento
        ├── GmlContainerElements.gd
        ├── GmlTextElements.gd
        ├── GmlButtonElements.gd
        ├── GmlInputElements.gd
        ├── GmlMediaElements.gd
        ├── GmlListElements.gd
        └── GmlAnchorElements.gd
```

É bem modular — cada tipo de elemento tem seu builder separado. Isso facilita muito contribuir ou extender.

---

### Elementos HTML suportados

**Containers** → `div`, `section`, `header`, `footer`, `nav`, `main`, `article`, `aside`, `form`
Todos viram `VBoxContainer` (column) ou `HBoxContainer` (row) dependendo do `flex-direction`.

**Texto** → `p`, `span`, `h1`–`h6`, `label`, `strong/b`, `em/i`

**Interativos** → `button`, `a`, `input` (text, password, checkbox, range, submit), `textarea`, `select/option`

**Mídia** → `img` (só `res://`), `svg` inline, `progress`, `br`, `hr`

**Listas** → `ul`/`ol`/`li`

---

### CSS suportado (principais)

**Layout:** `display` (flex/block/none), `flex-direction`, `flex-wrap`, `align-items`, `align-self`, `justify-content`, `gap`, `row-gap`, `column-gap`, `flex-grow`, `flex-shrink`, `flex-basis`, `order`

**Dimensões:** `width`, `height`, `min/max-width/height` — unidades: `px` e `%`

**Espaçamento:** `margin-*`, `padding-*` (só valores simples, sem shorthand multi-valor)

**Background:** `background-color`, gradientes lineares e radiais completos (incluindo `deg`, `to right`, stops com `%`), `background-image` (url)

**Border:** `border`, `border-*`, `border-radius`, `border-*-radius`

**Tipografia:** `color`, `font-size`, `font-family`, `font-weight`, `text-align`, `text-transform`, `text-decoration`, `text-overflow`, `letter-spacing`, `line-height`, `white-space`

**Efeitos:** `opacity`, `box-shadow` (incluindo `inset`), `text-shadow`, `outline`, `outline-offset`

**Cursor:** suporte completo a todos os cursores do Godot

**Overflow/scroll:** `overflow`, `overflow-x/y` (precisa de height explícito para scroll funcionar)

**Pseudo-classes:** `:hover`, `:active`, `:focus`, `:disabled`

---

### Limitações críticas (o que NÃO funciona)

Esse ponto é muito importante para calibrar expectativas:

- ❌ **Sem CSS Variables** (`--var`, `var()`) — usa valores diretos
- ❌ **Sem CSS Grid** — só Flexbox
- ❌ **Sem position absolute/fixed/relative** — para overlays usa `CanvasLayer` do Godot
- ❌ **Sem seletores descendentes** (`div p {}`, `ul li {}`) — usa classes/IDs únicos
- ❌ **Sem `:nth-child`, `:first-child`** etc.
- ❌ **Sem pseudo-elementos** (`::before`, `::after`)
- ❌ **Sem margin/padding shorthand multi-valor** (`margin: 10px 20px` não funciona)
- ❌ **Sem `!important`**
- ❌ **Sem unidades `rem`, `em`, `vh`, `calc()`**
- ❌ **Sem `@keyframes`** — só `transition`
- ❌ **Sem estilos inline** (`style="..."`)
- ❌ **Sem `<style>` no HTML**
- ❌ **Fontes só locais** — sem Google Fonts
- ❌ **SVG limitado** — sem `transform`, `mask`, `filter`, `<text>`, `<linearGradient>`, bezier curves viram linhas retas

---

### Sistema de Signals

```gdscript
button_clicked(method_name: String)   // @click="nome_metodo"
link_clicked(href: String)            // <a href="...">
input_changed(input_id, value)        // qualquer input
selection_changed(select_id, value)   // <select>
form_submitted(form_data: Dictionary) // botão type="submit"
```

### API de acesso por ID

```gdscript
$GmlView.get_element_by_id("meu-id")    // retorna o controle Godot interno
$GmlView.get_wrapper_by_id("meu-id")    // retorna o wrapper (para visibility etc.)
```

---

### Como extender

Está bem documentado: para adicionar novos elementos HTML, cria um builder estático seguindo o padrão `{"control": wrapped, "inner": inner}` e registra no `GmlRenderer.gd`. Para novas propriedades CSS, adiciona em `PASSTHROUGH_PROPS` ou cria um parser dedicado.

---

### Veredicto para o seu caso

Dado que você já domina HTML/CSS, o GTML vai ser muito natural. As limitações principais a ter em mente no dia a dia são a ausência de CSS variables, sem seletores descendentes e sem position absolute. Para UIs de menus, HUDs e painéis de game — que é o caso de uso principal — ele cobre bastante bem. Quer que eu te ajude a montar alguma tela específica com ele?