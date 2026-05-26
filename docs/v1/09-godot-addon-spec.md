# 09 - Godot Addon Spec

## Objetivo

Criar um addon Godot para compilar `.gdui.html` dentro do editor e gerar `.tscn` editável.

O addon tambem pode iniciar o Gdui Studio: um servidor Node local para autoria e previsualizacao no navegador. Esse Studio nao muda o contrato principal do produto; ele e uma ferramenta auxiliar para escrever `.gdui.html` e acionar a geracao de `.tscn`.

## Estrutura

```text
addons/gdui/
  plugin.cfg
  plugin.gd          — EditorPlugin: dock, menus, auto-init, validação
  import_plugin.gd   — importer experimental (desativado por padrão)
  dock.gd            — painel Gdui: compile, studio, project config, init
  compiler/
    gdui.js          — CLI bundled (CJS, sem dependências externas)
    lib.mjs          — biblioteca bundled para import() dinâmico
  server/
    studio-server.js
  runtime/
    action_router.gd
    binding_runtime.gd
    responsive_runtime.gd
```

## Build do addon

Os arquivos `compiler/gdui.js` e `compiler/lib.mjs` são gerados por:

```bash
npm run build:addon
```

Esse comando usa esbuild para empacotar toda a cadeia de pacotes (`packages/compiler`, `packages/godot-exporter`, `packages/theme-exporter`, `tools/gdui/src/`) em dois arquivos sem dependências externas. Após o build, apenas `addons/gdui/` precisa ser distribuído.

## Fluxo confiavel atual

O importer automatico fica desativado por padrao no MVP para evitar loops de reimportacao quando o Godot detecta `.tscn` gerado como modificacao externa. O fluxo confiavel atual e manual via menu ou Studio.

1. Usuario adiciona ou edita arquivo `.gdui.html`.
2. Usuario usa `Project > Tools > Gdui: Compile all UI` ou compila pelo Studio.
3. Addon/Studio chama o compilador.
4. Compilador grava `.tscn`.
5. Editor Godot abre a cena gerada como cena nativa editavel.
6. Warnings aparecem no output por enquanto; painel dedicado e futuro.

Live reload é desejável, inspirado no fluxo de ferramentas como GTML, mas não pode substituir o arquivo `.tscn` gerado.

## Importer automatico experimental

O arquivo `import_plugin.gd` permanece no addon como referencia experimental, mas nao deve reconhecer extensoes nem ser registrado por padrao no MVP.

Tasks relacionadas:

- `GDUI-051`: importer automatico adiado.
- `GDUI-055`: reimport automatico adiado.
- `GDUI-056`: dock Godot planejado para substituir o fluxo fragil de importer automatico.

## Fluxo Studio local

1. Usuario ativa o addon no Godot.
2. Usuario usa `Project > Tools > Gdui: Start Studio`.
3. O addon inicia `node addons/gdui/server/studio-server.js` em `127.0.0.1`.
4. O navegador abre `http://127.0.0.1:39147`.
5. O Studio lista arquivos `.gdui.html` de `ui/` e `examples/`.
6. Ao salvar/compilar, o servidor chama o compilador Node e atualiza `scenes/*.tscn`.
7. O addon solicita rescan do filesystem do Godot quando a compilacao e disparada pelo menu do editor.

O preview web do Studio e apenas uma aproximacao visual de autoria. O preview canonico continua sendo abrir a cena `.tscn` gerada no editor Godot.

## Contrato do importer

Entrada:

```text
res://ui/inventory.gdui.html
```

Saída:

```text
res://ui/inventory.tscn
```

## Carregamento do compilador

O `studio-server.js` carrega o compilador dinamicamente:

1. Prefere `addons/gdui/compiler/lib.mjs` (bundle distribuído).
2. Cai de volta para `tools/gdui/src/index.js` em ambiente de desenvolvimento (sem build).

O `plugin.gd` resolve o CLI pelo mesmo padrão:

1. `addons/gdui/compiler/gdui.js` (bundle).
2. `tools/gdui/bin/gdui.js` (fallback dev).

## Configuração

Na primeira ativação, o plugin cria automaticamente:

- `gdui.config.json` — `inputDir`, `outputDir`, `failOnWarning`.
- `theme.gdui.json` — tokens de cor, espaçamento, raio e tipografia.

Ambos os arquivos são validados na ativação; erros aparecem no log e no status da dock.

O dock permite editar `inputDir`/`outputDir` diretamente e salvar via botão **Save Config**.
O botão **Init Project** recria os arquivos a qualquer momento.

- Mostrar AST.

## Runtime opcional

`action_router.gd` pode conectar botões por metadata:

```gdscript
if node.has_meta("action"):
    node.pressed.connect(_on_action.bind(node.get_meta("action")))
```

Ele também pode aplicar breakpoints e foco de controle/teclado quando o `.tscn` estático não for suficiente.

## Restrições

- O addon não deve usar WebView como saída.
- O servidor Node local não deve ser runtime do jogo.
- A cena gerada precisa continuar editável.
- O usuário deve conseguir versionar `.gdui.html` e `.tscn`.
- O addon não deve esconder a UI dentro de um único node renderer.
- Importacao automatica so deve voltar quando gerar recursos pelo contrato correto do `EditorImportPlugin`, sem escrever `.tscn` editavel em loop durante o scan.
