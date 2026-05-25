@tool
extends Node
class_name GduiResponsiveRuntime

const BREAKPOINTS := {
	"sm": 0,
	"md": 641,
	"lg": 1025,
	"xl": 1441,
	"tv": 1920,
}

@export var root_path: NodePath
@export var auto_apply_on_ready := true

func _ready() -> void:
	if auto_apply_on_ready:
		apply_current_breakpoint()
	var viewport := get_viewport()
	if viewport and not viewport.size_changed.is_connected(Callable(self, "apply_current_breakpoint")):
		viewport.size_changed.connect(Callable(self, "apply_current_breakpoint"))

func apply_current_breakpoint() -> void:
	var root: Node = null
	if root_path != NodePath(""):
		root = get_node_or_null(root_path)
	else:
		root = get_tree().current_scene
	if root == null:
		root = self
	var width := get_viewport().get_visible_rect().size.x
	var active_breakpoint := _resolve_breakpoint(width)
	_apply_recursive(root, active_breakpoint)

func _resolve_breakpoint(width: float) -> String:
	var current := "sm"
	for key in ["sm", "md", "lg", "xl", "tv"]:
		if width >= BREAKPOINTS[key]:
			current = key
	return current

func _apply_recursive(node: Node, active_breakpoint: String) -> void:
	if node.has_meta("gdui_responsive"):
		_apply_node(node, active_breakpoint, String(node.get_meta("gdui_responsive")))
	for child in node.get_children():
		_apply_recursive(child, active_breakpoint)

func _apply_node(node: Node, active_breakpoint: String, json_text: String) -> void:
	var parsed = JSON.parse_string(json_text)
	if typeof(parsed) != TYPE_DICTIONARY:
		return

	var selected := {}
	for key in ["sm", "md", "lg", "xl", "tv"]:
		if parsed.has(key):
			selected.merge(parsed[key], true)
		if key == active_breakpoint:
			break

	for prop in selected.keys():
		var value = selected[prop]
		match String(prop):
			"columns":
				if node is GridContainer:
					node.columns = int(value)
			"gap":
				node.add_theme_constant_override("separation", int(value))
				if node is GridContainer:
					node.add_theme_constant_override("h_separation", int(value))
					node.add_theme_constant_override("v_separation", int(value))
			"font-size":
				if node is Label or node is Button:
					node.add_theme_font_size_override("font_size", int(value))
			"visible":
				if node is CanvasItem:
					node.visible = String(value).to_lower() != "false"
