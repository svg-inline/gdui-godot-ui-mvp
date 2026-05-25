# 01 - Markup Spec

## Extensão

Arquivos de UI usam a extensão:

```text
.gdui.html
```

O sufixo `.html` existe para dar suporte a editores, syntax highlight e autocomplete básico. O formato não aceita HTML genérico.

## Identidade do formato

`.gdui.html` é markup declarativo de Godot, não HTML livre.

Tags HTML comuns são proibidas de propósito para evitar heurísticas como:

```html
<div style="display: flex">
```

Em vez disso, a intenção deve ser explícita:

```html
<gd-hbox gap="12">
```

## Estrutura

Cada arquivo deve ter exatamente um componente raiz:

```html
<gd-screen name="InventoryScreen" anchor="full">
  <gd-vbox name="Root" gap="16">
    <gd-label text="Inventário" />
  </gd-vbox>
</gd-screen>
```

## Tags

Somente tags `gd-*` documentadas devem ser usadas. Tags HTML como `div`, `button`, `span` e `img` são inválidas.

Essa decisão diferencia o projeto de ferramentas como GTML, que aceitam HTML/CSS mais amplo. Aqui o contrato é menor e mais previsível.

## Atributos

Atributos usam sintaxe HTML simples:

```html
<gd-button name="PlayButton" text="Jogar" action="menu.play" />
```

Valores booleanos devem preferir string explícita:

```html
<gd-button disabled="true" />
```

Contratos de runtime opcionais usam atributos explícitos:

```html
<gd-screen state="screen">
  <gd-label bind:text="screen.title" />
</gd-screen>
```

Bindings aceitos no contrato inicial: `bind:text`, `bind:visible` e `bind:disabled`.

## Comentários

Comentários HTML são permitidos e ignorados:

```html
<!-- Cabeçalho da tela -->
```

## Texto

Texto visual deve ficar em atributos como `text`.

Preferido:

```html
<gd-label text="Configurações" />
```

Evitar no MVP:

```html
<gd-label>Configurações</gd-label>
```

## Erros obrigatórios

O compilador deve falhar quando:

- Houver mais de uma raiz.
- Uma tag não suportada for usada.
- Uma tag for fechada fora de ordem.
- Uma tag ficar aberta no fim do arquivo.
