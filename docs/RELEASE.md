# Release

## Checklist do addon

1. Atualizar `addons/gdui/plugin.cfg` com a versao do release.
2. Rodar os testes:

```bash
npm test
npm run compile
npm run compile:theme
npm run test:godot
```

3. Gerar o bundle distribuivel:

```bash
npm run build:addon
npm run validate:addon
```

4. Criar o zip contendo apenas:

```text
addons/gdui/
LICENSE
README.md
docs/README.md
docs/COMPONENTS.md
docs/DEVELOPMENT.md
docs/ROADMAP.md
docs/RELEASE.md
```

5. Em um projeto Godot limpo, copiar `addons/gdui/`, ativar o plugin e validar:

- `Project > Tools > Gdui: Compile all UI`
- `Project > Tools > Gdui: Compile Theme`
- `Project > Tools > Gdui: Start Studio`
- abertura de uma cena `.tscn` gerada no editor

## Asset Library

- Icone: `addons/gdui/icon.png`, PNG 128x128.
- Categoria sugerida: Tools.
- Descricao curta: compilador de UI declarativa `gd-*` para cenas Godot nativas editaveis.
- Limites declarados: nao e WebView, nao e conversor completo de HTML/CSS e requer Node.js no `PATH` para compilar pelo plugin.
