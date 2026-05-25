extends SceneTree

var _root: Control
var _grid: GridContainer
var _title: Label
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

	get_root().size = Vector2i(2000, 1080)
	_runtime.apply_current_breakpoint()
	failed = _expect(_grid.columns == 6, "tv breakpoint should set grid.columns to 6") or failed
	failed = _expect(not _title.visible, "tv breakpoint should set title.visible to false") or failed

	_root.free()
	quit(1 if failed else 0)
	return true

func _expect(condition: bool, message: String) -> bool:
	if condition:
		print("[gdui-responsive-test] OK: " + message)
		return false

	push_error("[gdui-responsive-test] FAIL: " + message)
	return true
