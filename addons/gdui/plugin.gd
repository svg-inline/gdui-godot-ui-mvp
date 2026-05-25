@tool
extends EditorPlugin

const IMPORT_PLUGIN := preload("res://addons/gdui/import_plugin.gd")
const DOCK_SCRIPT := preload("res://addons/gdui/dock.gd")
const STUDIO_PORT := 39147
const STUDIO_URL := "http://127.0.0.1:%d" % STUDIO_PORT
const ENABLE_EXPERIMENTAL_IMPORTER := false

var import_plugin: EditorImportPlugin
var dock: GduiDock
var studio_pid := -1

func _enter_tree() -> void:
	if ENABLE_EXPERIMENTAL_IMPORTER:
		import_plugin = IMPORT_PLUGIN.new()
		add_import_plugin(import_plugin)

	dock = DOCK_SCRIPT.new()
	dock.setup(self)
	add_control_to_dock(DOCK_SLOT_RIGHT_UL, dock)

	add_tool_menu_item("Gdui: Compile all UI", Callable(self, "_compile_all_ui"))
	add_tool_menu_item("Gdui: Compile Theme", Callable(self, "_compile_theme"))
	add_tool_menu_item("Gdui: Start Studio", Callable(self, "_start_studio"))
	add_tool_menu_item("Gdui: Open Studio", Callable(self, "_open_studio"))
	add_tool_menu_item("Gdui: Stop Studio", Callable(self, "_stop_studio"))
	print("[Gdui] Plugin enabled. Importer auto is disabled; use Project > Tools > Gdui: Compile all UI or Gdui: Start Studio.")
	_set_status("Ready")
	_update_studio_status()

func _exit_tree() -> void:
	stop_studio()
	remove_tool_menu_item("Gdui: Stop Studio")
	remove_tool_menu_item("Gdui: Open Studio")
	remove_tool_menu_item("Gdui: Start Studio")
	remove_tool_menu_item("Gdui: Compile Theme")
	remove_tool_menu_item("Gdui: Compile all UI")
	if dock:
		remove_control_from_docks(dock)
		dock.queue_free()
		dock = null
	if import_plugin:
		remove_import_plugin(import_plugin)
		import_plugin = null

func _compile_all_ui() -> void:
	compile_all_ui()

func _compile_theme() -> void:
	compile_theme()

func _start_studio() -> void:
	start_studio()

func _open_studio() -> void:
	open_studio()

func _stop_studio() -> void:
	stop_studio()

func compile_all_ui() -> void:
	var root := ProjectSettings.globalize_path("res://")
	var cli := root.path_join("tools/gdui/bin/gdui.js")

	if not FileAccess.file_exists(cli):
		_report_error("[Gdui] Compiler not found: " + cli)
		return

	_set_status("Compiling UI...")
	var ok := _run_node_command([cli, "--input", root.path_join("ui"), "--output", root.path_join("scenes")], "Compile UI")
	if not ok:
		return

	EditorInterface.get_resource_filesystem().scan()
	_set_status("UI compiled.")
	_log("[Gdui] Compile finished.")

func compile_theme() -> void:
	var root := ProjectSettings.globalize_path("res://")
	var cli := root.path_join("tools/gdui/bin/gdui.js")
	var theme := root.path_join("theme.gdui.json")
	var output := root.path_join("scenes/theme.tres")

	if not FileAccess.file_exists(cli):
		_report_error("[Gdui] Compiler not found: " + cli)
		return
	if not FileAccess.file_exists(theme):
		_report_error("[Gdui] Theme file not found: " + theme)
		return

	_set_status("Compiling Theme...")
	var ok := _run_node_command([cli, "--theme", theme, "--output", output], "Compile Theme")
	if not ok:
		return

	EditorInterface.get_resource_filesystem().scan()
	_set_status("Theme compiled.")
	_log("[Gdui] Theme compile finished.")

func start_studio() -> void:
	if _is_studio_running():
		open_studio()
		return

	var root := ProjectSettings.globalize_path("res://")
	var server := root.path_join("addons/gdui/server/studio-server.js")

	if not FileAccess.file_exists(server):
		_report_error("[Gdui] Studio server not found: " + server)
		return

	studio_pid = OS.create_process("node", [server, "--root", root, "--port", str(STUDIO_PORT)], false)
	if studio_pid <= 0:
		_report_error("[Gdui] Could not start Gdui Studio. Check if Node is installed and available in PATH.")
		studio_pid = -1
		return

	_log("[Gdui] Studio started at " + STUDIO_URL)
	_set_status("Studio running.")
	_update_studio_status()
	open_studio()

func open_studio() -> void:
	OS.shell_open(STUDIO_URL)

func stop_studio() -> void:
	if _is_studio_running():
		OS.kill(studio_pid)
		_log("[Gdui] Studio stopped.")
	studio_pid = -1
	_update_studio_status()

func _is_studio_running() -> bool:
	return studio_pid > 0 and OS.is_process_running(studio_pid)

func _run_node_command(args: Array, label: String) -> bool:
	var output: Array = []
	var code := OS.execute("node", args, output, true, true)
	for line in output:
		_log(String(line))

	if code != OK:
		_report_error("[Gdui] %s failed with exit code %d. Check if Node is installed and available in PATH." % [label, code])
		return false

	return true

func _report_error(message: String) -> void:
	push_error(message)
	_set_status("Error")
	_log(message)

func _set_status(message: String) -> void:
	if dock:
		dock.set_status(message)

func _log(message: String) -> void:
	print(message)
	if dock:
		dock.append_log(message)

func _update_studio_status() -> void:
	if dock:
		dock.set_studio_running(_is_studio_running(), STUDIO_URL)
