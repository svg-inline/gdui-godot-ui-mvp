# Gdui

Compilador de UI declarativa para Godot 4.

```text
.gdui.html -> AST -> Godot Scene AST -> .tscn editavel
```

Gdui usa tags `gd-*` previsiveis e gera cenas Godot nativas editaveis. Nao e um conversor universal de HTML/CSS e nao usa WebView como saida principal.

## Documentacao

A documentacao tecnica fica em `docs/`:

- `docs/README.md`
- `docs/ARCHITECTURE.md`
- `docs/COMPONENTS.md`
- `docs/DEVELOPMENT.md`
- `docs/ROADMAP.md`

Documentos historicos da v1.0 ficam em `docs/v1/`.

## Tasks

Tasks sao versionadas por release do plugin:

- `TASKS.md`: indice.
- `tasks/v1.0/TASKS.md`: historico v1.0.
- `tasks/v1.1/TASKS.md`: proximos passos planejados.

## Comandos rapidos

```bash
npm install
npm test
npm run compile
npm run compile:theme
npm run build:addon
```

