#!/bin/bash
# Bloqueia leitura de arquivos sensíveis (.env, credentials, chaves).

input=$(cat)
path=$(python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('file_path', '') or d.get('path', ''))
except Exception:
    print('')
" <<< "$input" 2>/dev/null)

if [ -z "$path" ]; then
  echo '{"permission":"allow"}'
  exit 0
fi

basename=$(basename "$path")
lower_path=$(echo "$path" | tr '[:upper:]' '[:lower:]')

block=false

case "$basename" in
  .env|.env.*|*.pem|*.key|*.p12|credentials.json|secrets.json)
    block=true
    ;;
esac

case "$lower_path" in
  */secrets/*|*/.env|*/.env.*|*credentials*)
    if [[ "$basename" != *"AGENTS.md"* ]] && [[ "$basename" != *"README"* ]]; then
      block=true
    fi
    ;;
esac

if [ "$block" = true ]; then
  cat <<'EOF'
{
  "permission": "deny",
  "user_message": "Leitura bloqueada: arquivo sensível protegido pelo harness Altora.",
  "agent_message": "Não leia arquivos de secrets (.env, credentials, chaves). Use secrets do Cursor Dashboard ou variáveis de ambiente documentadas."
}
EOF
  exit 2
fi

echo '{"permission":"allow"}'
exit 0
