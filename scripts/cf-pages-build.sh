#!/usr/bin/env bash
set -euo pipefail

# Pages Git integration: build command `bash scripts/cf-pages-build.sh`.
# Keep tool versions and validation identical to local development and CI.
if ! command -v mise >/dev/null 2>&1; then
  curl -fsSL https://mise.run | sh
  export PATH="$HOME/.local/bin:$PATH"
fi
# Cloudflare's image includes a legacy asdf inventory with tools unrelated to
# this book. Read our mise.toml without inheriting that .tool-versions file.
export MISE_OVERRIDE_TOOL_VERSIONS_FILENAMES=.book-tool-versions
mise trust
mise install
mise run check
