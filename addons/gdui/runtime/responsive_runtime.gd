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
@export var auto_focus_on_tv := true

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
	if auto_focus_on_tv and active_breakpoint == "tv":
		_ensure_focus(root)

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

	_capture_base_values(node, parsed)
	_restore_base_values(node)

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
					node.columns = max(1, _to_int(value, node.columns))
			"gap":
				var gap := _to_int(value, 0)
				node.add_theme_constant_override("separation", gap)
				if node is GridContainer:
					node.add_theme_constant_override("h_separation", gap)
					node.add_theme_constant_override("v_separation", gap)
			"font-size":
				if node is Label or node is Button:
					node.add_theme_font_size_override("font_size", _to_int(value, node.get_theme_font_size("font_size")))
			"visible":
				if node is CanvasItem:
					node.visible = String(value).to_lower() != "false"
			"width", "min-width":
				if node is Control:
					var size: Vector2 = node.custom_minimum_size
					size.x = _to_float(value, size.x)
					node.custom_minimum_size = size
			"height", "min-height":
				if node is Control:
					var size: Vector2 = node.custom_minimum_size
					size.y = _to_float(value, size.y)
					node.custom_minimum_size = size
			"padding":
				if node is MarginContainer:
					var box := _parse_box(value, 0)
					node.add_theme_constant_override("margin_top", box[0])
					node.add_theme_constant_override("margin_right", box[1])
					node.add_theme_constant_override("margin_bottom", box[2])
					node.add_theme_constant_override("margin_left", box[3])

func _capture_base_values(node: Node, parsed: Dictionary) -> void:
	if node.has_meta("_gdui_responsive_base"):
		return

	var props := {}
	for breakpoint_props in parsed.values():
		if typeof(breakpoint_props) != TYPE_DICTIONARY:
			continue
		for prop in breakpoint_props.keys():
			props[String(prop)] = true

	var base := {}
	for prop in props.keys():
		match prop:
			"columns":
				if node is GridContainer:
					base.columns = node.columns
			"gap":
				base.separation = node.get_theme_constant("separation")
				if node is GridContainer:
					base.h_separation = node.get_theme_constant("h_separation")
					base.v_separation = node.get_theme_constant("v_separation")
			"font-size":
				if node is Label or node is Button:
					base.font_size = node.get_theme_font_size("font_size")
			"visible":
				if node is CanvasItem:
					base.visible = node.visible
			"width", "min-width", "height", "min-height":
				if node is Control:
					base.custom_minimum_size = node.custom_minimum_size
			"padding":
				if node is MarginContainer:
					base.margin_top = node.get_theme_constant("margin_top")
					base.margin_right = node.get_theme_constant("margin_right")
					base.margin_bottom = node.get_theme_constant("margin_bottom")
					base.margin_left = node.get_theme_constant("margin_left")

	node.set_meta("_gdui_responsive_base", base)

func _restore_base_values(node: Node) -> void:
	if not node.has_meta("_gdui_responsive_base"):
		return

	var base: Dictionary = node.get_meta("_gdui_responsive_base")
	if base.has("columns") and node is GridContainer:
		node.columns = int(base.columns)
	if base.has("separation"):
		node.add_theme_constant_override("separation", int(base.separation))
	if base.has("h_separation") and node is GridContainer:
		node.add_theme_constant_override("h_separation", int(base.h_separation))
	if base.has("v_separation") and node is GridContainer:
		node.add_theme_constant_override("v_separation", int(base.v_separation))
	if base.has("font_size") and (node is Label or node is Button):
		node.add_theme_font_size_override("font_size", int(base.font_size))
	if base.has("visible") and node is CanvasItem:
		node.visible = bool(base.visible)
	if base.has("custom_minimum_size") and node is Control:
		node.custom_minimum_size = base.custom_minimum_size
	if base.has("margin_top") and node is MarginContainer:
		node.add_theme_constant_override("margin_top", int(base.margin_top))
		node.add_theme_constant_override("margin_right", int(base.margin_right))
		node.add_theme_constant_override("margin_bottom", int(base.margin_bottom))
		node.add_theme_constant_override("margin_left", int(base.margin_left))

func _ensure_focus(root: Node) -> void:
	var viewport := get_viewport()
	if viewport == null or viewport.gui_get_focus_owner() != null:
		return

	var focusable := _find_first_focusable(root)
	if focusable:
		focusable.grab_focus()

func _find_first_focusable(node: Node) -> Control:
	if node is Control and node.visible and node.focus_mode != Control.FOCUS_NONE:
		return node

	for child in node.get_children():
		if child is Node:
			var found := _find_first_focusable(child)
			if found:
				return found

	return null

func _parse_box(value, fallback: int) -> Array[int]:
	var raw_parts := String(value).strip_edges().split(" ", false)
	var parts: Array[int] = []
	for part in raw_parts:
		parts.append(_to_int(part, fallback))

	if parts.is_empty():
		return [fallback, fallback, fallback, fallback]
	if parts.size() == 1:
		return [parts[0], parts[0], parts[0], parts[0]]
	if parts.size() == 2:
		return [parts[0], parts[1], parts[0], parts[1]]
	if parts.size() == 3:
		return [parts[0], parts[1], parts[2], parts[1]]
	return [parts[0], parts[1], parts[2], parts[3]]

func _to_int(value, fallback: int) -> int:
	var parsed := String(value).replace("px", "").strip_edges().to_int()
	if parsed == 0 and not String(value).replace("px", "").strip_edges() in ["0", "0.0"]:
		return fallback
	return parsed

func _to_float(value, fallback: float) -> float:
	var parsed := String(value).replace("px", "").strip_edges().to_float()
	if parsed == 0.0 and not String(value).replace("px", "").strip_edges() in ["0", "0.0"]:
		return fallback
	return parsed
