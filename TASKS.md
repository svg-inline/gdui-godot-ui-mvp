# TASKS

## v0.1

- [x] Criar parser restrito para tags `gd-*`.
- [x] Gerar AST intermediária.
- [x] Exportar `.tscn` textual.
- [x] Criar exemplo de inventário.
- [ ] Cobrir parser com testes automatizados.
- [ ] Cobrir exporter com snapshot de `.tscn`.
- [ ] Validar cena gerada abrindo no Godot 4.x.

## v0.2 Design Tokens + Responsive Props básicas

- [ ] Definir tokens mínimos de cor, espaçamento, raio, tipografia e escala.
- [ ] Definir sintaxe responsiva.
- [ ] Fazer parser aceitar `md:columns`, `lg:padding` e `tv:font-size`.
- [ ] Implementar breakpoints documentados.
- [ ] Adicionar exemplo de grid responsivo.
- [ ] Criar testes de AST responsiva.
- [ ] Validar runtime mínimo aplicando o breakpoint correto.

## v0.3 Theme .tres completo

- [ ] Criar `theme.gdui.json`.
- [ ] Definir schema de tokens.
- [ ] Implementar exportador `Theme .tres`.
- [ ] Migrar variants para Theme.
- [ ] Adicionar exemplo com tema compartilhado.

## v0.4

- [ ] Formalizar `action`.
- [ ] Documentar metadata de eventos.
- [ ] Criar helper Godot para conectar actions.
- [ ] Criar exemplo de menu com actions.

## v0.5

- [ ] Criar estrutura `addons/gdui`.
- [ ] Implementar importer de `.gdui.html`.
- [ ] Mostrar warnings no editor.
- [ ] Reimportar cena quando arquivo mudar.

## Higiene contínua

- [ ] Manter `README.md` alinhado com o estado real.
- [ ] Atualizar exemplos a cada componente novo.
- [ ] Não adicionar tags sem atualizar specs.
- [ ] Não adicionar comportamento sem teste.
