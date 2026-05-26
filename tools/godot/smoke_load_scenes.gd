extends SceneTree

const SCENE_PATHS := [
	"res://scenes/FormComponentsScreen.tscn",
	"res://scenes/InventoryScreen.tscn",
	"res://scenes/MainMenuScreen.tscn",
	"res://scenes/ResponsiveGridScreen.tscn",
	"res://scenes/SettingsScreen.tscn",
	"res://scenes/ThemeVariantsScreen.tscn",
]

const RESOURCE_PATHS := [
	"res://scenes/theme.tres",
]

func _initialize() -> void:
	var failed := false

	for scene_path in SCENE_PATHS:
		if not ResourceLoader.exists(scene_path):
			push_error("[gdui-smoke] Missing scene: " + scene_path)
			failed = true
			continue

		var resource: Resource = load(scene_path)
		if not resource is PackedScene:
			push_error("[gdui-smoke] Resource is not a PackedScene: " + scene_path)
			failed = true
			continue

		var packed_scene := resource as PackedScene
		var instance: Node = packed_scene.instantiate()
		if instance == null:
			push_error("[gdui-smoke] Could not instantiate scene: " + scene_path)
			failed = true
			continue

		print("[gdui-smoke] Loaded " + scene_path + " as " + instance.get_class())
		instance.free()

	for resource_path in RESOURCE_PATHS:
		if not ResourceLoader.exists(resource_path):
			push_error("[gdui-smoke] Missing resource: " + resource_path)
			failed = true
			continue

		var resource: Resource = load(resource_path)
		if resource == null:
			push_error("[gdui-smoke] Could not load resource: " + resource_path)
			failed = true
			continue

		print("[gdui-smoke] Loaded " + resource_path + " as " + resource.get_class())

	quit(1 if failed else 0)
