# AGENTS.md

## Objetivo

Desenvolver um compilador de UI declarativa para Godot usando arquivos `.gdui.html`.

O foco é:

```text
.gdui.html -> AST -> Godot Scene AST -> .tscn editável
```

Não é objetivo converter HTML/CSS genérico da web.

## Referências estratégicas

Antes de mudar escopo, consultar:

- `docs/README.md`
- `docs/ROADMAP.md`
- `docs/v1/00-research-synthesis.md`
- `docs/v1/PREVIA.md`
- `docs/v1/MERCADO-ATUAL.md`
- `docs/v1/HTML-ÔåÆ-Godot-(REATIVIDADE)-1-1.md`
- `docs/v1/Analise-Completa-do-GTML-https-github.com-Niekvdm-godot-plugins-gtml.md`

Esses documentos reforçam o posicionamento: o produto deve ser mais previsível que HTML/CSS genérico e ter `.tscn` editável como diferencial.

## Regras inegociáveis

- Não usar WebView como saída principal.
- Não prometer compatibilidade total com HTML.
- Não prometer compatibilidade total com CSS.
- Não depender de Shadow DOM para exportação.
- Não copiar o escopo amplo do GTML sem preservar o contrato `gd-*`.
- Não transformar o projeto em WebView, mini-browser ou renderer runtime obrigatório.
- Todo componente `gd-*` precisa mapear para node Godot nativo.
- Toda saída `.tscn` precisa abrir editável na Godot.
- Todo estilo visual deve futuramente migrar para Theme `.tres`.
- Toda feature precisa ter exemplo em `examples/`.
- Toda feature nova precisa ter teste.

## Tasks

Tasks novas devem ser criadas sempre em pasta versionada do plugin:

```text
tasks/vX.Y/TASKS.md
```

O arquivo `TASKS.md` na raiz e apenas um indice. O historico fechado da v1.0 fica em `tasks/v1.0/TASKS.md`.

## Arquitetura obrigatória

```text
packages/compiler
packages/godot-exporter
packages/theme-exporter
packages/components
packages/runtime
addons/gdui
```

O MVP atual ainda vive em `src/`, mas novas mudanças devem aproximar o código dessa separação.

## Diferencial obrigatório

O projeto deve vencer por foco:

```text
gd-* previsível + AST estável + .tscn editável + Theme .tres
```

GTML e WebView são referências úteis, mas não são o destino arquitetural.

## Ordem de prioridade

1. `.tscn` confiável
2. `Theme .tres`
3. Responsividade
4. Eventos/actions
5. Addon Godot
6. Reatividade
7. Preview Studio

## Componentes MVP

- `gd-screen`
- `gd-vbox`
- `gd-hbox`
- `gd-panel`
- `gd-label`
- `gd-button`
- `gd-grid`
- `gd-scroll`
- `gd-texture`
- `gd-card`

## Proibido no MVP

- CSS completo
- JavaScript runtime
- Shadow DOM como fonte de verdade
- CSS Grid completo
- Animações complexas
- Editor drag-and-drop
- WebView
