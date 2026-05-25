@tool
extends VBoxContainer
class_name GduiDock

var plugin: EditorPlugin

var status_label: Label
var studio_label: Label
var log_output: TextEdit
var start_studio_button: Button
var open_studio_button: Button
var stop_studio_button: Button
var input_dir_field: LineEdit
var output_dir_field: LineEdit
var watch_toggle: CheckBox

func setup(owner: EditorPlugin) -> void:
	plugin = owner

func _ready() -> void:
	name = "Gdui"
	custom_minimum_size = Vector2(320, 420)

	var title := Label.new()
	title.text = "Gdui"
	title.theme_type_variation = &"HeaderSmall"
	add_child(title)

	status_label = Label.new()
	status_label.text = "Ready"
	status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(status_label)

	var compile_row := HBoxContainer.new()
	add_child(compile_row)

	var compile_button := Button.new()
	compile_button.text = "Compile UI"
	compile_button.tooltip_text = "Compile ui/*.gdui.html to editable scenes/*.tscn."
	compile_button.pressed.connect(_on_compile_pressed)
	compile_row.add_child(compile_button)

	var theme_button := Button.new()
	theme_button.text = "Compile Theme"
	theme_button.tooltip_text = "Generate scenes/theme.tres from theme.gdui.json."
	theme_button.pressed.connect(_on_compile_theme_pressed)
	compile_row.add_child(theme_button)

	# GDUI-094: auto-compile toggle
	watch_toggle = CheckBox.new()
	watch_toggle.text = "Auto"
	watch_toggle.tooltip_text = "Auto-compile .gdui.html files when saved (watches for changes)."
	watch_toggle.toggled.connect(_on_watch_toggled)
	compile_row.add_child(watch_toggle)

	var studio_row := HBoxContainer.new()
	add_child(studio_row)

	start_studio_button = Button.new()
	start_studio_button.text = "Start Studio"
	start_studio_button.tooltip_text = "Start the local Node authoring server."
	start_studio_button.pressed.connect(_on_start_studio_pressed)
	studio_row.add_child(start_studio_button)

	open_studio_button = Button.new()
	open_studio_button.text = "Open"
	open_studio_button.tooltip_text = "Open Gdui Studio in the browser."
	open_studio_button.pressed.connect(_on_open_studio_pressed)
	studio_row.add_child(open_studio_button)

	stop_studio_button = Button.new()
	stop_studio_button.text = "Stop"
	stop_studio_button.tooltip_text = "Stop the local Gdui Studio server."
	stop_studio_button.pressed.connect(_on_stop_studio_pressed)
	studio_row.add_child(stop_studio_button)

	studio_label = Label.new()
	studio_label.text = "Studio: stopped"
	studio_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(studio_label)

	# ── GDUI-097: Project Config panel ────────────────────────────────────────
	add_child(HSeparator.new())

	var config_title := Label.new()
	config_title.text = "Project Config"
	config_title.theme_type_variation = &"HeaderSmall"
	add_child(config_title)

	var input_row := HBoxContainer.new()
	add_child(input_row)
	var input_lbl := Label.new()
	input_lbl.text = "Input dir:"
	input_lbl.custom_minimum_size = Vector2(72, 0)
	input_row.add_child(input_lbl)
	input_dir_field = LineEdit.new()
	input_dir_field.placeholder_text = "ui"
	input_dir_field.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	input_row.add_child(input_dir_field)

	var output_row := HBoxContainer.new()
	add_child(output_row)
	var output_lbl := Label.new()
	output_lbl.text = "Output dir:"
	output_lbl.custom_minimum_size = Vector2(72, 0)
	output_row.add_child(output_lbl)
	output_dir_field = LineEdit.new()
	output_dir_field.placeholder_text = "scenes"
	output_dir_field.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	output_row.add_child(output_dir_field)

	var cfg_btns := HBoxContainer.new()
	add_child(cfg_btns)

	var save_cfg_btn := Button.new()
	save_cfg_btn.text = "Save Config"
	save_cfg_btn.tooltip_text = "Save inputDir / outputDir to gdui.config.json."
	save_cfg_btn.pressed.connect(_on_save_config_pressed)
	cfg_btns.add_child(save_cfg_btn)

	var init_btn := Button.new()
	init_btn.text = "Init Project"
	init_btn.tooltip_text = "Create gdui.config.json and theme.gdui.json if missing."
	init_btn.pressed.connect(_on_init_project_pressed)
	cfg_btns.add_child(init_btn)

	log_output = TextEdit.new()
	log_output.editable = false
	log_output.wrap_mode = TextEdit.LINE_WRAPPING_BOUNDARY
	log_output.scroll_fit_content_height = false
	log_output.size_flags_vertical = Control.SIZE_EXPAND_FILL
	log_output.text = ""
	add_child(log_output)

	var clear_button := Button.new()
	clear_button.text = "Clear Log"
	clear_button.tooltip_text = "Clear dock output."
	clear_button.pressed.connect(clear_log)
	add_child(clear_button)

	set_studio_running(false, "")

func set_status(message: String) -> void:
	if status_label:
		status_label.text = message

func set_studio_running(running: bool, url: String) -> void:
	if studio_label:
		studio_label.text = "Studio: running at " + url if running else "Studio: stopped"
	if start_studio_button:
		start_studio_button.disabled = running
	if open_studio_button:
		open_studio_button.disabled = not running
	if stop_studio_button:
		stop_studio_button.disabled = not running

func append_log(message: String) -> void:
	if not log_output:
		return
	var line := message.strip_edges()
	if line.is_empty():
		return
	if not log_output.text.is_empty():
		log_output.text += "\n"
	log_output.text += line
	log_output.set_caret_line(log_output.get_line_count() - 1)

func clear_log() -> void:
	if log_output:
		log_output.text = ""

func _on_compile_pressed() -> void:
	if plugin and plugin.has_method("compile_all_ui"):
		plugin.call("compile_all_ui")

func _on_compile_theme_pressed() -> void:
	if plugin and plugin.has_method("compile_theme"):
		plugin.call("compile_theme")

func _on_start_studio_pressed() -> void:
	if plugin and plugin.has_method("start_studio"):
		plugin.call("start_studio")

func _on_open_studio_pressed() -> void:
	if plugin and plugin.has_method("open_studio"):
		plugin.call("open_studio")

func _on_stop_studio_pressed() -> void:
	if plugin and plugin.has_method("stop_studio"):
		plugin.call("stop_studio")

# GDUI-097: fill config fields from loaded config dict
func refresh_config(config: Dictionary) -> void:
	if input_dir_field:
		input_dir_field.text = config.get("inputDir", "ui")
	if output_dir_field:
		output_dir_field.text = config.get("outputDir", "scenes")

# GDUI-097: save button handler
func _on_save_config_pressed() -> void:
	if plugin and plugin.has_method("save_config"):
		plugin.call("save_config", {
			"inputDir": input_dir_field.text if input_dir_field else "ui",
			"outputDir": output_dir_field.text if output_dir_field else "scenes",
			"failOnWarning": false
		})

# GDUI-098: init button handler
func _on_init_project_pressed() -> void:
	if plugin and plugin.has_method("initialize_project_files"):
		plugin.call("initialize_project_files")

# GDUI-094: auto-compile toggle
func _on_watch_toggled(pressed: bool) -> void:
	if plugin and plugin.has_method("set_watcher_enabled"):
		plugin.call("set_watcher_enabled", pressed)

func set_watch_enabled(enabled: bool) -> void:
	if watch_toggle:
		watch_toggle.set_pressed_no_signal(enabled)
