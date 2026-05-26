# Development

## Comandos principais

| Comando | Uso |
| --- | --- |
| `npm run compile` | Compila `ui/` para `scenes/`. |
| `npm run compile:theme` | Gera `scenes/theme.tres`. |
| `npm run build:addon` | Gera o bundle em `addons/gdui/compiler/`. |
| `npm test` | Roda testes Node. |
| `npm run test:godot` | Valida cenas, Theme, runtimes e Studio controller no Godot headless. |

## Regra para features novas

Toda feature nova precisa de:

1. Spec ou documentacao atualizada.
2. Exemplo em `examples/` ou `ui/`.
3. Teste automatizado.
4. Mapping para node Godot nativo quando for componente.
5. Saida `.tscn` editavel.

## Tasks

Tasks novas devem ficar em pasta versionada:

```text
tasks/v1.1/TASKS.md
tasks/v1.2/TASKS.md
```

O arquivo raiz `TASKS.md` e apenas um indice.

## Preview Studio

O Studio local pode renderizar preview web auxiliar, mas esse preview nao e fonte de verdade. A fonte de verdade continua sendo a cena `.tscn` gerada e validada no Godot.

Quando houver divergencia entre preview e Godot, a documentacao e os diagnosticos devem apontar o comportamento Godot como canonico.

Limites atuais do preview web auxiliar:

- Nao executa actions, bindings ou runtime de listas.
- Nao valida recursos `res://` carregados pelo editor Godot.
- Aproxima layout visual com HTML/CSS simples apenas para autoria rapida.
- Nao representa Theme `.tres` com fidelidade total.
- Nao deve ser usado como criterio final de aceitacao visual.

## Validacao recomendada

Antes de fechar uma mudanca:

```bash
npm test
npm run compile
npm run compile:theme
npm run test:godot
npm run validate:addon
```

Para diagnosticar um smoke especifico, chame o runner diretamente:

```bash
node tools/godot/run-smoke.js tools/godot/test_responsive_runtime.gd
```
