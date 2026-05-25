# 10 - Testing Plan

## Objetivo

Garantir que cada arquivo `.gdui.html` gere uma AST esperada e um `.tscn` que abra corretamente no Godot 4.x.

## Camadas de teste

### Parser

- Tag suportada gera node `element`.
- Tag não suportada falha.
- Raiz única é obrigatória.
- Tags abertas são detectadas.
- Comentários são ignorados.

### AST

- Atributos são preservados.
- Ordem de filhos é preservada.
- Text nodes vazios são removidos.
- JSON impresso não contém referência circular.
- Variantes responsivas são preservadas sem perder o default.

### Exporter TSCN

- Cada tag vira o node Godot correto.
- `parent` usa caminho relativo correto.
- `gd-panel` gera `StyleBoxFlat`.
- `gd-card` gera `PanelContainer`.
- `gd-screen background` injeta `ColorRect`.
- `action` vira metadata.

### Responsividade

- Parser aceita `md:columns`, `lg:padding` e `tv:font-size`.
- AST guarda variantes responsivas por breakpoint.
- Runtime aplica o breakpoint correto para a largura atual.
- `gd-grid` muda `columns` conforme a largura.
- Exemplo de TV mantém foco navegável por teclado/controle.

### Integração

- `npm run compile` gera `out/InventoryScreen.tscn`.
- `npm run check` imprime AST e não quebra.
- Exemplos em `examples/` compilam sem erro.

## Validação manual no Godot

1. Rodar compilação.
2. Abrir `.tscn` no Godot 4.x.
3. Confirmar que a cena aparece na árvore.
4. Confirmar que containers e labels estão editáveis.
5. Confirmar que warnings conhecidos são aceitáveis.

## Snapshots

Criar snapshots para:

- `inventory.gdui.html`
- `main-menu.gdui.html`
- `settings.gdui.html`

Snapshots devem ser atualizados somente quando a mudança no contrato for intencional.

## Critério para feature nova

Toda feature nova precisa:

- Atualizar spec.
- Ter exemplo em `examples/`.
- Ter teste de parser ou exporter.
- Documentar limitações.
- Declarar nível de suporte quando tocar CSS-like props: `native`, `approx`, `custom` ou `unsupported`.
