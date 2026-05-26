# Gdui Documentation

Gdui e um compilador de UI declarativa para Godot 4. Ele converte arquivos `.gdui.html` em cenas `.tscn` editaveis.

```text
.gdui.html -> AST -> Godot Scene AST -> .tscn editavel
```

O projeto nao e um conversor de HTML/CSS generico. O contrato publico e um subconjunto previsivel de tags `gd-*` que mapeiam para nodes Godot nativos.

## Principios

- A saida canonica e `.tscn` editavel.
- Cada componente `gd-*` precisa mapear para node Godot nativo.
- `Theme .tres` deve concentrar estilo visual sempre que possivel.
- Runtime Godot e opcional: cenas estaticas nao devem depender dele.
- Preview web existe apenas como ferramenta de autoria.
- Toda feature nova precisa de exemplo e teste.

## Documentos atuais

| Documento | Conteudo |
| --- | --- |
| `docs/ARCHITECTURE.md` | Arquitetura, pacotes e fluxo de compilacao. |
| `docs/COMPONENTS.md` | Componentes suportados, props e limites. |
| `docs/DEVELOPMENT.md` | Como desenvolver, testar e validar mudancas. |
| `docs/ROADMAP.md` | Estado atual e direcao de v1.1+. |
| `docs/RELEASE.md` | Checklist de empacotamento e submissao do addon. |

## Historico

A documentacao tecnica usada ate a v1.0 foi arquivada em `docs/v1/`. Ela continua sendo referencia historica, mas a documentacao atual deve ser mantida nos arquivos acima.
