@tool
extends EditorPlugin

const IMPORT_PLUGIN := preload("res://addons/gdui/import_plugin.gd")

var import_plugin: EditorImportPlugin

func _enter_tree() -> void:
	import_plugin = IMPORT_PLUGIN.new()
	add_import_plugin(import_plugin)
	add_tool_menu_item("Gdui: Compile all UI", Callable(self, "_compile_all_ui"))
	print("[Gdui] Plugin enabled. Use Project > Tools > Gdui: Compile all UI.")

func _exit_tree() -> void:
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
