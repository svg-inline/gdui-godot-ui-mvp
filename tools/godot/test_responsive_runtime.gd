extends SceneTree

var _root: Control
var _grid: GridContainer
var _title: Label
var _container: MarginContainer
var _button: Button
var _runtime: Node
var _ran := false

func _initialize() -> void:
	var runtime_script := load("res://addons/gdui/runtime/responsive_runtime.gd")
	if runtime_script == null or not runtime_script.can_instantiate():
		push_error("[gdui-responsive-test] Could not load responsive runtime script")
		quit(1)
		return

	_root = Control.new()
	_root.name = "ResponsiveRoot"
	get_root().add_child(_root)

	_grid = GridContainer.new()
	_grid.name = "ItemsGrid"
	_grid.columns = 2
	_grid.set_meta("gdui_responsive", JSON.stringify({
		"md": { "columns": "3", "gap": "12" },
		"lg": { "columns": "4", "gap": "16" },
		"tv": { "columns": "6" }
	}))
	_root.add_child(_grid)

	_title = Label.new()
	_title.name = "Title"
	_title.set_meta("gdui_responsive", JSON.stringify({
		"md": { "font-size": "24" },
		"tv": { "visible": "false" }
	}))
	_root.add_child(_title)

	_container = MarginContainer.new()
	_container.name = "ResponsiveContainer"
	_container.add_theme_constant_override("margin_left", 4)
	_container.add_theme_constant_override("margin_top", 4)
	_container.add_theme_constant_override("margin_right", 4)
	_container.add_theme_constant_override("margin_bottom", 4)
	_container.set_meta("gdui_responsive", JSON.stringify({
		"lg": { "padding": "24 32", "min-width": "480", "min-height": "240" },
		"tv": { "padding": "48" }
	}))
	_root.add_child(_container)

	_button = Button.new()
	_button.name = "PlayButton"
	_button.focus_mode = Control.FOCUS_ALL
	_button.set_meta("gdui_responsive", JSON.stringify({
		"tv": { "min-width": "320", "min-height": "72" }
	}))
	_container.add_child(_button)

	_runtime = runtime_script.new()
	_runtime.root_path = NodePath("..")
	_root.add_child(_runtime)

func _process(_delta: float) -> bool:
	if _ran:
		return false
	_ran = true
	var failed := false

	get_root().size = Vector2i(1200, 720)
	_runtime.apply_current_breakpoint()
	failed = _expect(_grid.columns == 4, "lg breakpoint should set grid.columns to 4") or failed
	failed = _expect(_grid.get_theme_constant("h_separation") == 16, "lg breakpoint should set h_separation to 16") or failed
	failed = _expect(_title.get_theme_font_size("font_size") == 24, "md font-size should cascade into lg") or failed
	failed = _expect(_title.visible, "title should remain visible before tv breakpoint") or failed
	failed = _expect(_container.get_theme_constant("margin_left") == 32, "lg padding should set horizontal margins") or failed
	failed = _expect(_container.get_theme_constant("margin_top") == 24, "lg padding should set vertical margins") or failed
	failed = _expect(_container.custom_minimum_size == Vector2(480, 240), "lg min size should update custom_minimum_size") or failed

	get_root().size = Vector2i(2000, 1080)
	_runtime.apply_current_breakpoint()
	failed = _expect(_grid.columns == 6, "tv breakpoint should set grid.columns to 6") or failed
	failed = _expect(not _title.visible, "tv breakpoint should set title.visible to false") or failed
	failed = _expect(_container.get_theme_constant("margin_left") == 48, "tv padding should override lg padding") or failed
	failed = _expect(_button.custom_minimum_size == Vector2(320, 72), "tv min size should update focusable button size") or failed
	failed = _expect(get_root().gui_get_focus_owner() == _button, "tv breakpoint should focus first focusable control") or failed

	get_root().size = Vector2i(480, 720)
	_runtime.apply_current_breakpoint()
	failed = _expect(_grid.columns == 2, "sm breakpoint should restore base grid.columns") or failed
	failed = _expect(_title.visible, "sm breakpoint should restore base visibility") or failed
	failed = _expect(_container.get_theme_constant("margin_left") == 4, "sm breakpoint should restore base padding") or failed
	failed = _expect(_container.custom_minimum_size == Vector2.ZERO, "sm breakpoint should restore base minimum size") or failed

	_root.free()
	quit(1 if failed else 0)
	return true

func _expect(condition: bool, message: String) -> bool:
	if condition:
		print("[gdui-responsive-test] OK: " + message)
		return false

	push_error("[gdui-responsive-test] FAIL: " + message)
	return true
