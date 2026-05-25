extends SceneTree

const ACTION_ROUTER_SCRIPT := preload("res://addons/gdui/runtime/action_router.gd")
const MAIN_MENU_SCENE := "res://scenes/MainMenuScreen.tscn"

var received_action := ""
var received_source: Node
var received_metadata := {}

func _initialize() -> void:
	var failed := false
	var packed_scene := load(MAIN_MENU_SCENE) as PackedScene
	if packed_scene == null:
		push_error("[gdui-action-test] Could not load " + MAIN_MENU_SCENE)
		quit(1)
		return

	var instance := packed_scene.instantiate()
	root.add_child(instance)

	var router := ACTION_ROUTER_SCRIPT.new()
	router.auto_connect_on_ready = false
	instance.add_child(router)
	router.action_triggered.connect(Callable(self, "_on_action_triggered"))
	router.connect_actions(instance)

	var play_button := instance.get_node_or_null("Root/MenuPanel/MenuButtons/PlayButton")
	if play_button == null:
		push_error("[gdui-action-test] Missing PlayButton")
		failed = true
	elif not play_button.has_meta("action"):
		push_error("[gdui-action-test] PlayButton has no action metadata")
		failed = true
	elif not play_button is Button:
		push_error("[gdui-action-test] PlayButton is not a Button")
		failed = true
	else:
		(play_button as Button).pressed.emit()
		failed = not _expect(received_action == "menu.play", "PlayButton should emit menu.play") or failed
		failed = not _expect(received_source == play_button, "Signal source should be PlayButton") or failed
		failed = not _expect(received_metadata.get("action") == "menu.play", "Signal metadata should include action") or failed

	instance.free()
	quit(1 if failed else 0)

func _on_action_triggered(action: String, source: Node, metadata: Dictionary) -> void:
	received_action = action
	received_source = source
	received_metadata = metadata

func _expect(condition: bool, message: String) -> bool:
	if condition:
		print("[gdui-action-test] OK: " + message)
		return true

	push_error("[gdui-action-test] FAIL: " + message)
	return false
