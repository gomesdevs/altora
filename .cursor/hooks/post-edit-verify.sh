#!/bin/bash
# Lint pós-edição — ativo quando monorepo existir. No-op gracioso na fase pré-código.

if [ ! -f package.json ]; then
  exit 0
fi

input=$(cat)
file_path=$(python3 -c "
import sys, json
try:
    print(json.load(sys.stdin).get('file_path', ''))
except Exception:
    print('')
" <<< "$input" 2>/dev/null)

if [ -z "$file_path" ] || [ ! -f "$file_path" ]; then
  exit 0
fi

case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx)
    if command -v pnpm >/dev/null 2>&1; then
      pnpm exec eslint --fix "$file_path" 2>/dev/null || true
    fi
    ;;
esac

exit 0
