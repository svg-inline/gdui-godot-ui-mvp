# 09 - Godot Addon Spec

## Objetivo

Criar um addon Godot para importar `.gdui.html` direto no editor e gerar `.tscn` editável.

O addon tambem pode iniciar o Gdui Studio: um servidor Node local para autoria e previsualizacao no navegador. Esse Studio nao muda o contrato principal do produto; ele e uma ferramenta auxiliar para escrever `.gdui.html` e acionar a geracao de `.tscn`.

## Estrutura alvo

```text
addons/gdui/
  plugin.cfg
  plugin.gd
  import_plugin.gd
  server/
    studio-server.js
  runtime/
    action_router.gd
```

## Fluxo de importação

O importer automatico fica desativado por padrao no MVP para evitar loops de reimportacao quando o Godot detecta `.tscn` gerado como modificacao externa. O fluxo confiavel atual e manual via menu ou Studio.

1. Usuário adiciona arquivo `.gdui.html`.
2. Addon detecta o arquivo.
3. Addon chama o compilador.
4. Addon grava `.tscn`.
5. Editor Godot importa a cena gerada.
6. Warnings aparecem no painel do addon ou no output.

Live reload é desejável, inspirado no fluxo de ferramentas como GTML, mas não pode substituir o arquivo `.tscn` gerado.

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

## Configuração

Opções futuras:

- Caminho do compilador.
- Pasta de saída.
- Porta do Studio.
- Auto-start do Studio ao ativar o addon.
- Gerar Theme.
- Falhar em warnings.
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
