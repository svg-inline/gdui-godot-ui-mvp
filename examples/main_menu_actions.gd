extends Control

const ACTION_ROUTER_SCRIPT := preload("res://addons/gdui/runtime/action_router.gd")

var action_router: GduiActionRouter

func _ready() -> void:
	action_router = ACTION_ROUTER_SCRIPT.new()
	add_child(action_router)
	action_router.action_triggered.connect(Callable(self, "_on_gdui_action"))
	action_router.connect_actions(self)

func _on_gdui_action(action: String, source: Node, metadata: Dictionary) -> void:
	print("[Gdui example] Action: %s from %s" % [action, source.name])
