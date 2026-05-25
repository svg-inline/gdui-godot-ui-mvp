@tool
extends EditorImportPlugin

# Importer experimental.
# The reliable workflow for this MVP is Project > Tools > Gdui: Compile all UI.

func _get_importer_name() -> String:
	return "gdui.html"

func _get_visible_name() -> String:
	return "Gdui Markup"

func _get_recognized_extensions() -> PackedStringArray:
	return PackedStringArray()

func _get_save_extension() -> String:
	return "tscn"

func _get_resource_type() -> String:
	return "PackedScene"

func _get_priority() -> float:
	return 1.0

func _get_import_order() -> int:
	return 0

func _get_preset_count() -> int:
	return 1

func _get_preset_name(preset_index: int) -> String:
	return "Default"

func _get_import_options(path: String, preset_index: int) -> Array:
	return []

func _get_option_visibility(path: String, option_name: StringName, options: Dictionary) -> bool:
	return true

func _import(source_file: String, save_path: String, options: Dictionary, platform_variants: Array[String], gen_files: Array[String]) -> Error:
	return ERR_UNAVAILABLE
