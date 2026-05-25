extends SceneTree

const BINDING_RUNTIME_SCRIPT := preload("res://addons/gdui/runtime/binding_runtime.gd")

var _root: Control
var _title: Label
var _button: Button
var _runtime: Node

func _initialize() -> void:
	_root = Control.new()
	_root.name = "BindingRoot"
	get_root().add_child(_root)

	_title = Label.new()
	_title.name = "Title"
	_title.text = "Initial"
	_title.set_meta("gdui_bindings", JSON.stringify({
		"text": "screen.title",
		"visible": "screen.show_title"
	}))
	_root.add_child(_title)

	_button = Button.new()
	_button.name = "PlayButton"
	_button.text = "Play"
	_button.set_meta("gdui_bindings", JSON.stringify({
		"text": "screen.button",
		"disabled": "screen.locked"
	}))
	_root.add_child(_button)

	_runtime = BINDING_RUNTIME_SCRIPT.new()
	_runtime.root_path = NodePath("..")
	_root.add_child(_runtime)

	var failed := false
	_runtime.set_state({
		"screen": {
			"title": "Inventory",
			"show_title": true,
			"button": "Equip",
			"locked": false
		}
	})

	failed = _expect(_title.text == "Inventory", "bind:text should update Label.text") or failed
	failed = _expect(_title.visible, "bind:visible should keep Label visible") or failed
	failed = _expect(_button.text == "Equip", "bind:text should update Button.text") or failed
	failed = _expect(not _button.disabled, "bind:disabled should keep Button enabled") or failed

	_runtime.set_state_value("screen.title", "Settings")
	_runtime.set_state_value("screen.show_title", false)
	_runtime.set_state_value("screen.locked", true)

	failed = _expect(_title.text == "Settings", "set_state_value should update nested text") or failed
	failed = _expect(not _title.visible, "set_state_value should update visibility") or failed
	failed = _expect(_button.disabled, "set_state_value should update disabled") or failed

	_root.free()
	quit(1 if failed else 0)

func _expect(condition: bool, message: String) -> bool:
	if condition:
		print("[gdui-binding-test] OK: " + message)
		return false

	push_error("[gdui-binding-test] FAIL: " + message)
	return true
