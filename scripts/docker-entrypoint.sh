#!/bin/sh
set -eu

THEME_DIR="${THEME_DIR:-themes/hugo-bearblog}"
DEFAULT_BASEURL="${SITE_BASEURL:-http://localhost:1313/}"
DEFAULT_POLL_INTERVAL="${SITE_POLL_INTERVAL:-700ms}"

require_theme() {
  if [ ! -d "$THEME_DIR" ] || [ -z "$(find "$THEME_DIR" -mindepth 1 -maxdepth 1 2>/dev/null)" ]; then
    cat >&2 <<'EOF'
Missing Hugo theme submodule at themes/hugo-bearblog.

Initialize it before running the site:
  git submodule update --init --recursive

If you want to do that from the container instead:
  docker compose run --rm --entrypoint git site submodule update --init --recursive
EOF
    exit 1
  fi
}

if [ $# -eq 0 ]; then
  require_theme
  exec hugo server --buildDrafts --bind 0.0.0.0 --baseURL "$DEFAULT_BASEURL" --appendPort=false --poll "$DEFAULT_POLL_INTERVAL"
fi

case "$1" in
  hugo)
    shift
    require_theme
    exec hugo "$@"
    ;;
  -*)
    require_theme
    exec hugo "$@"
    ;;
  *)
    if hugo help "$1" >/dev/null 2>&1; then
      require_theme
      exec hugo "$@"
    fi
    ;;
esac

exec "$@"
