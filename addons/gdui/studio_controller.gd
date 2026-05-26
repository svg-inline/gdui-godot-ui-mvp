@tool
extends RefCounted
class_name GduiStudioController

const DEFAULT_PORT := 39147
const DEFAULT_HOST := "127.0.0.1"

var project_root := ""
var port := DEFAULT_PORT
var studio_pid := -1

var file_exists_func := Callable()
var create_process_func := Callable()
var is_process_running_func := Callable()
var kill_process_func := Callable()
var open_url_func := Callable()

func setup(root: String, studio_port: int = DEFAULT_PORT) -> void:
	project_root = root
	port = studio_port

func get_studio_url() -> String:
	return "http://%s:%d" % [DEFAULT_HOST, port]

func get_server_path() -> String:
	return project_root.path_join("addons/gdui/server/studio-server.js")

func start() -> Dictionary:
	if is_running():
		var open_result := open()
		open_result["started"] = false
		open_result["already_running"] = true
		return open_result

	var server := get_server_path()
	if not _file_exists(server):
		return _failure("[Gdui] Studio server not found: " + server)

	studio_pid = _create_process("node", [server, "--root", project_root, "--port", str(port)], false)
	if studio_pid <= 0:
		studio_pid = -1
		return _failure("[Gdui] Could not start Gdui Studio. Check if Node is installed and available in PATH.")

	var result := open()
	result["started"] = true
	result["already_running"] = false
	result["pid"] = studio_pid
	result["messages"] = ["[Gdui] Studio started at " + get_studio_url()]
	return result

func open() -> Dictionary:
	_open_url(get_studio_url())
	return {
		"ok": true,
		"opened": true,
		"url": get_studio_url(),
		"messages": []
	}

func stop() -> Dictionary:
	var messages: Array = []
	var was_running := is_running()
	if was_running:
		_kill_process(studio_pid)
		messages.append("[Gdui] Studio stopped.")
	studio_pid = -1
	return {
		"ok": true,
		"stopped": was_running,
		"messages": messages
	}

func restart() -> Dictionary:
	var messages: Array = []
	var stop_result := stop()
	messages.append_array(stop_result.get("messages", []))

	var start_result := start()
	messages.append_array(start_result.get("messages", []))
	start_result["restarted"] = start_result.get("ok", false)
	start_result["messages"] = messages
	return start_result

func is_running() -> bool:
	return studio_pid > 0 and _is_process_running(studio_pid)

func _failure(message: String) -> Dictionary:
	return {
		"ok": false,
		"error": message,
		"messages": []
	}

func _file_exists(path: String) -> bool:
	if file_exists_func.is_valid():
		return file_exists_func.call(path) == true
	return FileAccess.file_exists(path)

func _create_process(command: String, args: Array, open_console: bool) -> int:
	if create_process_func.is_valid():
		return int(create_process_func.call(command, args, open_console))
	return OS.create_process(command, args, open_console)

func _is_process_running(pid: int) -> bool:
	if is_process_running_func.is_valid():
		return is_process_running_func.call(pid) == true
	return OS.is_process_running(pid)

func _kill_process(pid: int) -> void:
	if kill_process_func.is_valid():
		kill_process_func.call(pid)
		return
	OS.kill(pid)

func _open_url(url: String) -> void:
	if open_url_func.is_valid():
		open_url_func.call(url)
		return
	OS.shell_open(url)
