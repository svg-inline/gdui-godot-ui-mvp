Sim. Achei **um projeto bem próximo**:

## 1. GTML — o mais perto da sua ideia

**GTML / Godot Markup Language** é um addon para Godot 4.x que permite criar UI com **HTML + CSS** e mapear isso para controles da Godot. Ele diz suportar HTML, CSS externo, live reload, flexbox, SVG, inputs, pseudo-classes, transições, gradientes e fontes customizadas. ([GitHub][1])

Ele mapeia tags para controles Godot:

| HTML                     | Godot                             |
| ------------------------ | --------------------------------- |
| `div`, `section`, `form` | `VBoxContainer` / `HBoxContainer` |
| `p`, `span`, `h1`...     | `Label`                           |
| `button`                 | `Button`                          |
| `a`                      | `LinkButton`                      |
| `input`                  | `LineEdit`, `CheckBox`, `HSlider` |
| `select`                 | `OptionButton`                    |
| `img`                    | `TextureRect`                     |
| `progress`               | `ProgressBar`                     |

Fonte: docs do próprio GTML. ([GitHub][2])

Ele também tem suporte a CSS tipo:

```css
display: flex;
flex-direction: row;
gap: 16px;
padding: 16px;
background-color: #1a1a2e;
border-radius: 8px;
```

E mapeia flexbox para containers da Godot. ([GitHub][3])

**Veredito:** é o mais próximo do que você está pensando.

Mas tem um porém: pelo que vi, ele usa um node `GmlView` lendo HTML/CSS, não parece ser exatamente um **compilador para `.tscn` editável**. ([GitHub][1])

---

## 2. Godot WRY — não é conversor, é WebView

**Godot WRY** deixa usar HTML, CSS e JS dentro da Godot via WebView nativo. Ele carrega URLs ou arquivos `res://`, permite integração JavaScript ⇄ GDScript e encaminha input de mouse/teclado. ([GitHub][4])

**Mas isso não converte para Control nodes.**

É mais tipo:

```text
HTML/CSS/JS rodando como navegador dentro da Godot
```

Não:

```text
HTML/CSS → Button / Label / VBoxContainer / .tscn
```

---

## 3. godot-webview — forte, mas também não converte

Existe também **godot-webview**, comercial, usando Chromium. Ele promete HTML fluido, hardware acceleration, suporte a React/Angular/Vue, transparência e renderização em `TextureRect` ou mesh. ([Godot Webview][5])

**Bom para UI web dentro do jogo.**
**Ruim para sua ideia de gerar UI nativa Godot.**

---

## 4. ViewGD / Rdot / Bindora — ajudam com reatividade, não com HTML

Achei libs de UI reativa:

**Rdot** traz modelo de reatividade inspirado em Vue/Solid/Qwik, com `state`, `computed`, `effect` e `bind`, mas o próprio README avisa que é proof of concept e não pronto para produção. ([GitHub][6])

**Bindora** é uma lib de data binding reativo/componentizado para Godot 4.x. ([Godot Engine][7])

**Reactive** é uma lib para apps UI-driven terem estado compartilhado. ([Godot Engine][8])

Essas ajudam no **estado da UI**, não na conversão:

```text
HTML/Web Components → Godot Control
```

---

## 5. godot-xml-ui — ideia parecida, mas velha/fraca

Achei também **godot-xml-ui**, que descreve UI Godot via XML e cria cenas básicas. Mas é para Godot 3.2.2, tem poucos commits, poucos stars e o próprio README diz que nem todos os `Control` são suportados. ([GitHub][9])

Não parece caminho forte hoje.

---

## Conclusão na lata

**Não achei uma lib madura que faça exatamente:**

```text
Web Components gd-* → Godot Control Nodes → .tscn editável
```

O mais próximo é:

```text
GTML
HTML/CSS → UI Godot via addon
```

Mas o melhor produto ainda parece em aberto.

A oportunidade real seria fazer algo mais focado que GTML:

```text
<gd-screen>
<gd-vbox>
<gd-button>
<gd-label>
<gd-panel>
```

e compilar isso para:

```text
Control
VBoxContainer
Button
Label
PanelContainer
.tscn
.theme.tres
```

Godot usa `Control` como base de UI e tem containers, labels, buttons, inputs, themes etc., então esse mapeamento é tecnicamente coerente. ([Godot Engine documentation][10])

E `.tscn` é formato textual de cena, relativamente versionável e legível, então gerar arquivo `.tscn` é um alvo válido. ([Godot Engine documentation][11])

**Minha recomendação:**
Estude/forke o **GTML**. Se ele não gera `.tscn`, o diferencial do seu plugin seria justamente esse:

```text
GTML-like markup
+ Web Components preview
+ Export real .tscn editável
+ Theme .tres
+ assets mapeados
```

Isso teria mais valor do que só WebView.

[1]: https://github.com/Niekvdm/godot-plugins-gtml "GitHub - Niekvdm/godot-plugins-gtml: GTML - Godot Text Markup Language Build Godot 4 UI using HTML and CSS. Write menus, HUDs, and panels with familiar web syntax instead of the scene editor. Supports flexbox, gradients, hover states, inline SVG, form inputs, and live reload. Free and open source. · GitHub"
[2]: https://github.com/Niekvdm/godot-plugins-gtml/blob/master/docs/html-elements.md "godot-plugins-gtml/docs/html-elements.md at master · Niekvdm/godot-plugins-gtml · GitHub"
[3]: https://github.com/Niekvdm/godot-plugins-gtml/blob/master/docs/css-properties.md "godot-plugins-gtml/docs/css-properties.md at master · Niekvdm/godot-plugins-gtml · GitHub"
[4]: https://github.com/doceazedo/godot_wry "GitHub - doceazedo/godot_wry:  Cross-platform webview extension for Godot 4 · GitHub"
[5]: https://godotwebview.com/ "godot-webview"
[6]: https://github.com/Nitwel/Rdot "GitHub - Nitwel/Rdot: JavaScript Signals for Godot! · GitHub"
[7]: https://godotengine.org/asset-library/asset/4021 "Bindora : a reactive data binding library - Godot Asset Library"
[8]: https://godotengine.org/asset-library/asset/4406 "Reactive - Godot Asset Library"
[9]: https://github.com/bluematt/godot-xml-ui "GitHub - bluematt/godot-xml-ui: Godot UI in XML · GitHub"
[10]: https://docs.godotengine.org/en/stable/tutorials/ui/index.html "User interface (UI) — Godot Engine (stable) documentation in English"
[11]: https://docs.godotengine.org/en/4.4/contributing/development/file_formats/tscn.html "TSCN file format — Godot Engine (4.4) documentation in English"
