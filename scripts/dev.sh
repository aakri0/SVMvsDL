#!/usr/bin/env bash
#
# scripts/dev.sh — start / stop / inspect the SVMvsDL stack locally.
#
# Services managed:
#   api        Flask inference API           http://localhost:5001
#   ws         WebSocket ingestion server    ws://localhost:5002
#   frontend   Vite dev server               http://localhost:8080
#   simulator  WISDM replay (optional)       (no port, connects to ws)
#
# Usage:
#   scripts/dev.sh start [service ...]    Start services (default: api ws frontend)
#   scripts/dev.sh stop  [service ...]    Stop services (default: all running)
#   scripts/dev.sh restart [service ...]  Stop then start
#   scripts/dev.sh status                 Show which services are running
#   scripts/dev.sh logs <service>         Tail a service's log
#
# Pass `simulator` explicitly if you want to replay WISDM data:
#   scripts/dev.sh start api ws simulator frontend
#
# Runtime state lives under .run/ (gitignored): one .pid and one .log per service.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$REPO_ROOT/.run"
DEFAULT_SERVICES=(api ws frontend)
ALL_SERVICES=(api ws simulator frontend)

mkdir -p "$RUN_DIR"

color() {
  # color <code> <text...>
  local code=$1; shift
  if [[ -t 1 ]]; then printf '\033[%sm%s\033[0m' "$code" "$*"; else printf '%s' "$*"; fi
}
info()  { echo "$(color '1;34' '[dev]') $*"; }
warn()  { echo "$(color '1;33' '[dev]') $*" >&2; }
err()   { echo "$(color '1;31' '[dev]') $*" >&2; }

pid_file() { echo "$RUN_DIR/$1.pid"; }
log_file() { echo "$RUN_DIR/$1.log"; }

is_running() {
  local pid_path; pid_path=$(pid_file "$1")
  [[ -f "$pid_path" ]] || return 1
  local pid; pid=$(cat "$pid_path" 2>/dev/null || true)
  [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null
}

cmd_for() {
  case "$1" in
    api)       echo "python -m app.backend.app" ;;
    ws)        echo "python -m app.backend.websocket_server" ;;
    simulator) echo "python -m app.backend.simulator" ;;
    frontend)  echo "npm --prefix app/frontend run dev" ;;
    *) err "Unknown service: $1"; return 2 ;;
  esac
}

require_python() {
  if ! command -v python >/dev/null 2>&1 && ! command -v python3 >/dev/null 2>&1; then
    err "python (or python3) not found in PATH"
    exit 1
  fi
  # Prefer `python` if available, else alias python3.
  if ! command -v python >/dev/null 2>&1; then
    PY_BIN=python3
  else
    PY_BIN=python
  fi
}

require_node() {
  if ! command -v npm >/dev/null 2>&1; then
    err "npm not found in PATH"
    exit 1
  fi
}

start_one() {
  local svc=$1
  if is_running "$svc"; then
    info "$svc already running (pid $(cat "$(pid_file "$svc")"))"
    return 0
  fi

  local cmd; cmd=$(cmd_for "$svc")
  case "$svc" in
    api|ws|simulator) require_python; cmd="${cmd/python/$PY_BIN}" ;;
    frontend)         require_node ;;
  esac

  info "starting $svc — $cmd"
  (
    cd "$REPO_ROOT"
    # shellcheck disable=SC2086
    nohup bash -c "exec $cmd" >>"$(log_file "$svc")" 2>&1 &
    echo $! >"$(pid_file "$svc")"
  )
  sleep 0.5
  if is_running "$svc"; then
    info "$svc up (pid $(cat "$(pid_file "$svc")")), logs: .run/$svc.log"
  else
    err "$svc failed to start; tail of log:"
    tail -n 20 "$(log_file "$svc")" >&2 || true
    rm -f "$(pid_file "$svc")"
    return 1
  fi
}

stop_one() {
  local svc=$1
  if ! is_running "$svc"; then
    [[ -f "$(pid_file "$svc")" ]] && rm -f "$(pid_file "$svc")"
    info "$svc not running"
    return 0
  fi
  local pid; pid=$(cat "$(pid_file "$svc")")
  info "stopping $svc (pid $pid)"
  # Kill the whole process group so children (vite, asyncio loops) die too.
  if kill -TERM "-$pid" 2>/dev/null; then :; else kill -TERM "$pid" 2>/dev/null || true; fi
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    is_running "$svc" || break
    sleep 0.3
  done
  if is_running "$svc"; then
    warn "$svc did not exit on TERM; sending KILL"
    kill -KILL "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
  fi
  rm -f "$(pid_file "$svc")"
}

cmd_status() {
  printf '%-10s %-8s %s\n' SERVICE STATUS PID
  for svc in "${ALL_SERVICES[@]}"; do
    if is_running "$svc"; then
      printf '%-10s %-8s %s\n' "$svc" "$(color '1;32' running)" "$(cat "$(pid_file "$svc")")"
    else
      printf '%-10s %-8s -\n' "$svc" "$(color '1;30' stopped)"
    fi
  done
}

cmd_logs() {
  local svc=${1:-}
  if [[ -z "$svc" ]]; then err "logs: service name required"; exit 2; fi
  local lf; lf=$(log_file "$svc")
  [[ -f "$lf" ]] || { err "no log file for $svc at $lf"; exit 1; }
  exec tail -f "$lf"
}

resolve_services() {
  if (( $# == 0 )); then
    printf '%s\n' "${DEFAULT_SERVICES[@]}"
    return
  fi
  for svc in "$@"; do
    case " ${ALL_SERVICES[*]} " in
      *" $svc "*) printf '%s\n' "$svc" ;;
      *) err "unknown service: $svc (valid: ${ALL_SERVICES[*]})"; exit 2 ;;
    esac
  done
}

main() {
  local action=${1:-}
  shift || true
  case "$action" in
    start)
      while IFS= read -r svc; do start_one "$svc"; done < <(resolve_services "$@")
      ;;
    stop)
      local targets=()
      if (( $# == 0 )); then
        for svc in "${ALL_SERVICES[@]}"; do
          is_running "$svc" && targets+=("$svc")
        done
      else
        while IFS= read -r svc; do targets+=("$svc"); done < <(resolve_services "$@")
      fi
      for svc in "${targets[@]:-}"; do stop_one "$svc"; done
      ;;
    restart)
      local services=()
      while IFS= read -r svc; do services+=("$svc"); done < <(resolve_services "$@")
      for svc in "${services[@]}"; do stop_one "$svc"; done
      for svc in "${services[@]}"; do start_one "$svc"; done
      ;;
    status) cmd_status ;;
    logs)   cmd_logs "$@" ;;
    -h|--help|help|"")
      sed -n '2,21p' "$0" | sed 's/^# \{0,1\}//'
      ;;
    *)
      err "unknown action: $action"
      exit 2
      ;;
  esac
}

main "$@"
