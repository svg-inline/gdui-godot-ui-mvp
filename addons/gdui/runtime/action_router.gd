extends Node
class_name GduiActionRouter

signal action_triggered(action: String, source: Node, metadata: Dictionary)

@export var auto_connect_on_ready := true
@export var root_path: NodePath

func _ready() -> void:
	if auto_connect_on_ready:
		var root := get_node_or_null(root_path) if root_path != NodePath("") else get_tree().current_scene
		if root == null:
			root = self
		connect_actions(root)

func connect_actions(root: Node) -> void:
	if root == null:
		return
	_visit(root)

func _visit(node: Node) -> void:
	if node.has_meta("action") and node.has_signal("pressed"):
		var callable := Callable(self, "_on_pressed").bind(node)
		if not node.is_connected("pressed", callable):
			node.connect("pressed", callable)

	for child in node.get_children():
		if child is Node:
			_visit(child)

func _on_pressed(source: Node) -> void:
	var metadata := {}
	for key in source.get_meta_list():
		metadata[String(key)] = source.get_meta(key)
	action_triggered.emit(String(source.get_meta("action")), source, metadata)
