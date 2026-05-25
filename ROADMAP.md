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
- Servidor Node local iniciado pelo addon para abrir o Gdui Studio.
- Studio com lista de `.gdui.html`, editor, preview web auxiliar e botao de compilar.
- Saída editável como cena.
- Live reload como conveniência, mantendo `.tscn` como artefato principal.

## v0.6 - Reatividade

- Estado declarativo mínimo.
- Bindings limitados.
- Atualização controlada por runtime Godot, não por WebView.
- Avaliar integração conceitual com bibliotecas reativas Godot sem acoplar o MVP.

## v0.7 - Preview Studio

- Preview no navegador como ferramenta de autoria mais completa.
- Comparação entre preview e saída Godot.
- Diagnósticos visuais de componentes não suportados.

---

## Pós-MVP

### v0.8 - Componentes de Input

> ✓ Concluído

Objetivo: desbloquear casos reais de UI interativa com inputs nativos Godot.

- `gd-input` → `LineEdit` (campo de texto).
- `gd-option` → `OptionButton` (dropdown/select).
- `gd-progress` → `ProgressBar`.
- `gd-slider` → `HSlider` / `VSlider` via atributo `orientation`.
- `gd-texture`: gerar `ExtResource` real no `.tscn` ao invés de só metadata de caminho.
- Atualizar specs, testes e exemplos para cada componente novo.

### v0.9 - Reestruturação de Pacotes

> ✓ Concluído

Objetivo: aproximar o código da arquitetura obrigatória definida em AGENTS.md.

- Extrair `packages/compiler` — parser + normalizer.
- Extrair `packages/godot-exporter` — exporter TSCN.
- Extrair `packages/theme-exporter` — exporter Theme.
- `tools/gdui/bin/` passa a usar os pacotes como dependências explícitas.
- Testes migrados para cada pacote com cobertura independente.
- Revisitar GDUI-051 / GDUI-055: definir contrato seguro para re-import usando `FileSystemWatcher` com guard de loop antes de reativar.

### v0.10 - Setup Automático do Projeto

> ✓ Concluído

Objetivo: eliminar a necessidade de criar arquivos de configuração manualmente ao adotar o addon.

Hoje o desenvolvedor precisa adicionar manualmente `gdui.config.json`, `theme.gdui.json` e `theme.gdui.schema.json` ao projeto. Isso é barreira de adoção.

- Na primeira ativação do plugin, detectar se `gdui.config.json` existe; se não existir, criar com valores padrão (`inputDir: "ui"`, `outputDir: "scenes"`).
- Na primeira ativação, detectar se `theme.gdui.json` existe; se não existir, gerar um arquivo inicial com todos os tokens obrigatórios preenchidos com os valores padrão do schema.
- Criar tela de configuração na dock do Gdui: editar paths de `inputDir`/`outputDir`, visualizar e salvar tokens de tema sem editar JSON à mão.
- Botão "Inicializar Projeto Gdui" na dock para rodar o setup a qualquer momento em projetos existentes.
- Validar `gdui.config.json` e `theme.gdui.json` na ativação e mostrar erros no painel antes de tentar compilar.
- Compilador empacotado em `addons/gdui/compiler/` via `npm run build:addon` (esbuild, sem dependências externas).
- Addon self-contained: apenas `addons/gdui/` precisa ser copiado para um novo projeto Godot.

### v1.0 - Publicação

Objetivo: tornar o addon distribuível e documentado para a comunidade Godot.

- Publicar addon no Asset Library do Godot.
- Gerar GDScript auxiliar de conexão de signals a partir dos metadados de `action`.
- Documentação pública completa: README, guia de início rápido, referência de componentes.
- Garantir compatibilidade declarada com Godot 4.x LTS.
