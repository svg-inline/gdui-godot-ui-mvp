extends SceneTree

const STUDIO_CONTROLLER_SCRIPT := preload("res://addons/gdui/studio_controller.gd")

var _existing_files := {}
var _running_pids := {}
var _created_processes: Array = []
var _killed_pids: Array = []
var _opened_urls: Array = []
var _next_pid := 1000
var _fail_next_process := false

func _initialize() -> void:
	var failed := false

	failed = _test_open_uses_studio_url() or failed
	failed = _test_start_creates_node_process_and_opens_studio() or failed
	failed = _test_start_when_running_only_opens_studio() or failed
	failed = _test_stop_kills_running_process() or failed
	failed = _test_restart_stops_then_starts() or failed
	failed = _test_start_reports_missing_server() or failed
	failed = _test_start_reports_process_failure() or failed

	quit(1 if failed else 0)

func _new_controller(root := "/project"):
	_reset_doubles()
	var controller = STUDIO_CONTROLLER_SCRIPT.new()
	controller.setup(root, 39147)
	controller.file_exists_func = Callable(self, "_file_exists")
	controller.create_process_func = Callable(self, "_create_process")
	controller.is_process_running_func = Callable(self, "_is_process_running")
	controller.kill_process_func = Callable(self, "_kill_process")
	controller.open_url_func = Callable(self, "_open_url")
	_existing_files[controller.get_server_path()] = true
	return controller

func _reset_doubles() -> void:
	_existing_files = {}
	_running_pids = {}
	_created_processes = []
	_killed_pids = []
	_opened_urls = []
	_next_pid = 1000
	_fail_next_process = false

func _test_open_uses_studio_url() -> bool:
	var controller = _new_controller()
	var result := controller.open()
	var failed := false

	failed = _expect(result.get("ok", false), "open should return ok") or failed
	failed = _expect(_opened_urls == ["http://127.0.0.1:39147"], "open should call shell opener with studio URL") or failed
	return failed

func _test_start_creates_node_process_and_opens_studio() -> bool:
	var controller = _new_controller()
	var result := controller.start()
	var failed := false
	var process: Dictionary = _created_processes[0] if _created_processes.size() > 0 else {}

	failed = _expect(result.get("ok", false), "start should return ok") or failed
	failed = _expect(result.get("started", false), "start should mark server as started") or failed
	failed = _expect(controller.studio_pid == 1001, "start should store created process pid") or failed
	failed = _expect(_created_processes.size() == 1, "start should create one process") or failed
	failed = _expect(process.get("command") == "node", "start should use node command") or failed
	failed = _expect(process.get("args") == ["/project/addons/gdui/server/studio-server.js", "--root", "/project", "--port", "39147"], "start should pass server path, root and port") or failed
	failed = _expect(_opened_urls == ["http://127.0.0.1:39147"], "start should open studio after launch") or failed
	return failed

func _test_start_when_running_only_opens_studio() -> bool:
	var controller = _new_controller()
	controller.start()
	_created_processes = []
	_opened_urls = []

	var result := controller.start()
	var failed := false

	failed = _expect(result.get("ok", false), "start while running should return ok") or failed
	failed = _expect(not result.get("started", true), "start while running should not mark as newly started") or failed
	failed = _expect(result.get("already_running", false), "start while running should report already_running") or failed
	failed = _expect(_created_processes.is_empty(), "start while running should not create a second process") or failed
	failed = _expect(_opened_urls == ["http://127.0.0.1:39147"], "start while running should open studio") or failed
	return failed

func _test_stop_kills_running_process() -> bool:
	var controller = _new_controller()
	controller.start()
	_opened_urls = []

	var result := controller.stop()
	var failed := false

	failed = _expect(result.get("ok", false), "stop should return ok") or failed
	failed = _expect(result.get("stopped", false), "stop should report stopped when process is running") or failed
	failed = _expect(controller.studio_pid == -1, "stop should clear stored pid") or failed
	failed = _expect(_killed_pids == [1001], "stop should kill running pid") or failed
	failed = _expect(not _running_pids.has(1001), "stop should mark pid as not running") or failed

	result = controller.stop()
	failed = _expect(not result.get("stopped", true), "stop should be idempotent when already stopped") or failed
	failed = _expect(_killed_pids == [1001], "second stop should not kill again") or failed
	return failed

func _test_restart_stops_then_starts() -> bool:
	var controller = _new_controller()
	controller.start()
	_opened_urls = []
	_created_processes = []
	_killed_pids = []

	var result := controller.restart()
	var failed := false

	failed = _expect(result.get("ok", false), "restart should return ok") or failed
	failed = _expect(result.get("restarted", false), "restart should report restarted") or failed
	failed = _expect(_killed_pids == [1001], "restart should stop the old process") or failed
	failed = _expect(_created_processes.size() == 1, "restart should create one replacement process") or failed
	failed = _expect(controller.studio_pid == 1002, "restart should store replacement pid") or failed
	failed = _expect(_opened_urls == ["http://127.0.0.1:39147"], "restart should open studio after relaunch") or failed
	return failed

func _test_start_reports_missing_server() -> bool:
	var controller = _new_controller()
	_existing_files = {}

	var result := controller.start()
	var failed := false

	failed = _expect(not result.get("ok", true), "start should fail when server file is missing") or failed
	failed = _expect(String(result.get("error", "")).contains("Studio server not found"), "missing server should explain the failure") or failed
	failed = _expect(_created_processes.is_empty(), "missing server should not create a process") or failed
	return failed

func _test_start_reports_process_failure() -> bool:
	var controller = _new_controller()
	_fail_next_process = true

	var result := controller.start()
	var failed := false

	failed = _expect(not result.get("ok", true), "start should fail when process creation fails") or failed
	failed = _expect(controller.studio_pid == -1, "failed start should clear pid") or failed
	failed = _expect(_opened_urls.is_empty(), "failed start should not open studio") or failed
	return failed

func _file_exists(path: String) -> bool:
	return _existing_files.has(path)

func _create_process(command: String, args: Array, open_console: bool) -> int:
	if _fail_next_process:
		_fail_next_process = false
		return -1
	_next_pid += 1
	_running_pids[_next_pid] = true
	_created_processes.append({
		"command": command,
		"args": args.duplicate(),
		"open_console": open_console,
		"pid": _next_pid
	})
	return _next_pid

func _is_process_running(pid: int) -> bool:
	return _running_pids.has(pid)

func _kill_process(pid: int) -> void:
	_killed_pids.append(pid)
	_running_pids.erase(pid)

func _open_url(url: String) -> void:
	_opened_urls.append(url)

func _expect(condition: bool, message: String) -> bool:
	if condition:
		print("[gdui-studio-controller-test] OK: " + message)
		return false

	push_error("[gdui-studio-controller-test] FAIL: " + message)
	return true
