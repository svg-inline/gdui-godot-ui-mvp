# 04 - TSCN Exporter Spec

## Objetivo

Gerar uma cena textual `.tscn` válida para Godot 4.x e editável no editor.

Esse é o principal diferencial do projeto. O `.tscn` não deve ser apenas cache interno de runtime; ele precisa ser um artefato que o usuário consiga abrir, versionar e ajustar no Godot.

## Cabeçalho

Todo arquivo deve começar com:

```text
[gd_scene load_steps=N format=3]
```

`load_steps` deve considerar sub-recursos gerados, como `StyleBoxFlat`.

## Nodes

Cada componente vira um bloco `[node]`.

Raiz:

```text
[node name="InventoryScreen" type="Control"]
```

Filho:

```text
[node name="Root" type="VBoxContainer" parent="."]
```

Neto:

```text
[node name="Title" type="Label" parent="Root/Header"]
```

## Mapeamento principal

| Componente | Node |
| --- | --- |
| `gd-screen` | `Control` |
| `gd-vbox` | `VBoxContainer` |
| `gd-hbox` | `HBoxContainer` |
| `gd-panel` | `PanelContainer` |
| `gd-label` | `Label` |
| `gd-button` | `Button` |
| `gd-grid` | `GridContainer` |
| `gd-scroll` | `ScrollContainer` |
| `gd-texture` | `TextureRect` |

## Estilo local

`gd-panel` pode gerar:

```text
[sub_resource type="StyleBoxFlat" id="StyleBoxFlat_1"]
```

Esse recurso é aplicado em:

```text
theme_override_styles/panel = SubResource("StyleBoxFlat_1")
```

## Background da tela

`gd-screen background="#112233"` injeta um `ColorRect` chamado `Background` como filho da raiz.

## Actions

`action="inventory.close"` deve virar:

```text
metadata/action = "inventory.close"
```

O exporter não conecta sinais automaticamente no MVP.

## Warnings

O exporter deve emitir warnings para recursos parcialmente suportados, como `gd-texture` sem `ExtResource`.

## Não objetivos

O exporter não deve:

- depender de WebView;
- renderizar HTML em runtime;
- gerar cena opaca difícil de editar;
- esconder toda UI dentro de um único custom node;
- exigir runtime para propriedades estáticas básicas.
