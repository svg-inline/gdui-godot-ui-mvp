# Teste rápido no Godot

1. Extraia este zip.
2. Copie o conteúdo da pasta `gdui-godot-ui-mvp` para a raiz do seu projeto Godot.
3. Na raiz do projeto, rode:

```bash
npm run compile
```

4. Abra no editor Godot uma das cenas geradas:

```text
scenes/InventoryScreen.tscn
scenes/MainMenuScreen.tscn
scenes/SettingsScreen.tscn
scenes/ResponsiveGridScreen.tscn
```

5. Para testar actions, adicione `addons/gdui/runtime/action_router.gd` como node/script em uma cena e conecte o signal `action_triggered`.

6. Para testar o addon, ative `Gdui` em `Project Settings > Plugins` e use `Project > Tools > Gdui: Compile all UI`.

Observação: o addon depende do Node instalado no PATH.
