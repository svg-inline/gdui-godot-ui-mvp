@tool
extends EditorPlugin

const IMPORT_PLUGIN := preload("res://addons/gdui/import_plugin.gd")
const STUDIO_PORT := 39147
const STUDIO_URL := "http://127.0.0.1:%d" % STUDIO_PORT
const ENABLE_EXPERIMENTAL_IMPORTER := false

var import_plugin: EditorImportPlugin
var studio_pid := -1

func _enter_tree() -> void:
	if ENABLE_EXPERIMENTAL_IMPORTER:
		import_plugin = IMPORT_PLUGIN.new()
		add_import_plugin(import_plugin)
	add_tool_menu_item("Gdui: Compile all UI", Callable(self, "_compile_all_ui"))
	add_tool_menu_item("Gdui: Start Studio", Callable(self, "_start_studio"))
	add_tool_menu_item("Gdui: Open Studio", Callable(self, "_open_studio"))
	add_tool_menu_item("Gdui: Stop Studio", Callable(self, "_stop_studio"))
	print("[Gdui] Plugin enabled. Importer auto is disabled; use Project > Tools > Gdui: Compile all UI or Gdui: Start Studio.")

func _exit_tree() -> void:
	_stop_studio()
	remove_tool_menu_item("Gdui: Stop Studio")
	remove_tool_menu_item("Gdui: Open Studio")
	remove_tool_menu_item("Gdui: Start Studio")
	remove_tool_menu_item("Gdui: Compile all UI")
	if import_plugin:
		remove_import_plugin(import_plugin)
		import_plugin = null

func _compile_all_ui() -> void:
	var root := ProjectSettings.globalize_path("res://")
	var cli := root.path_join("tools/gdui/bin/gdui.js")
	var output: Array = []

	if not FileAccess.file_exists(cli):
		push_error("[Gdui] Compiler not found: " + cli)
		return

	var code := OS.execute("node", [cli, "--input", "ui", "--output", "scenes"], output, true, true)
	for line in output:
		print(line)

	if code != OK:
		push_error("[Gdui] Compile failed. Check if Node is installed and available in PATH.")
		return

	EditorInterface.get_resource_filesystem().scan()
	print("[Gdui] Compile finished.")

func _start_studio() -> void:
	if _is_studio_running():
		_open_studio()
		return

	var root := ProjectSettings.globalize_path("res://")
	var server := root.path_join("addons/gdui/server/studio-server.js")

	if not FileAccess.file_exists(server):
		push_error("[Gdui] Studio server not found: " + server)
		return

	studio_pid = OS.create_process("node", [server, "--root", root, "--port", str(STUDIO_PORT)], false)
	if studio_pid <= 0:
		push_error("[Gdui] Could not start Gdui Studio. Check if Node is installed and available in PATH.")
		studio_pid = -1
		return

	print("[Gdui] Studio started at " + STUDIO_URL)
	_open_studio()

func _open_studio() -> void:
	OS.shell_open(STUDIO_URL)

func _stop_studio() -> void:
	if _is_studio_running():
		OS.kill(studio_pid)
		print("[Gdui] Studio stopped.")
	studio_pid = -1

func _is_studio_running() -> bool:
	return studio_pid > 0 and OS.is_process_running(studio_pid)
