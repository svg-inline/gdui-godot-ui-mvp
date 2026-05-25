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
