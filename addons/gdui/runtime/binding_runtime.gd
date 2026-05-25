@tool
extends Node
class_name GduiBindingRuntime

@export var root_path: NodePath
@export var auto_apply_on_ready := true
@export var state := {}

func _ready() -> void:
	if auto_apply_on_ready:
		apply_bindings()

func set_state(next_state: Dictionary) -> void:
	state = next_state
	apply_bindings()

func set_state_value(path: String, value) -> void:
	var parts := path.split(".", false)
	if parts.is_empty():
		return

	var cursor := state
	for index in range(parts.size() - 1):
		var key := parts[index]
		if not cursor.has(key) or typeof(cursor[key]) != TYPE_DICTIONARY:
			cursor[key] = {}
		cursor = cursor[key]

	cursor[parts[parts.size() - 1]] = value
	apply_bindings()

func apply_bindings() -> void:
	var root := _resolve_root()
	if root == null:
		return
	_apply_recursive(root)

func _resolve_root() -> Node:
	if root_path != NodePath(""):
		return get_node_or_null(root_path)
	return get_tree().current_scene if get_tree() else self

func _apply_recursive(node: Node) -> void:
	if node.has_meta("gdui_bindings"):
		_apply_node(node, String(node.get_meta("gdui_bindings")))

	for child in node.get_children():
		if child is Node:
			_apply_recursive(child)

func _apply_node(node: Node, json_text: String) -> void:
	var parsed = JSON.parse_string(json_text)
	if typeof(parsed) != TYPE_DICTIONARY:
		return

	for prop in parsed.keys():
		var path := String(parsed[prop])
		var value = _read_state_path(path)
		if value == null:
			continue

		match String(prop):
			"text":
				if node is Label or node is Button:
					node.text = String(value)
			"visible":
				if node is CanvasItem:
					node.visible = _to_bool(value)
			"disabled":
				if node is Button:
					node.disabled = _to_bool(value)

func _read_state_path(path: String):
	var parts := path.split(".", false)
	if parts.is_empty():
		return null

	var cursor = state
	for part in parts:
		if typeof(cursor) != TYPE_DICTIONARY:
			return null
		if not cursor.has(part):
			return null
		cursor = cursor[part]

	return cursor

func _to_bool(value) -> bool:
	if typeof(value) == TYPE_BOOL:
		return value
	var normalized := String(value).strip_edges().to_lower()
	return normalized in ["true", "1", "yes", "on"]
