#!/bin/bash
# Bloqueia comandos git destrutivos.

input=$(cat)
command=$(python3 -c "
import sys, json
try:
    print(json.load(sys.stdin).get('command', ''))
except Exception:
    print('')
" <<< "$input" 2>/dev/null)

if [ -z "$command" ]; then
  echo '{"permission":"allow"}'
  exit 0
fi

deny=false
reason=""

if echo "$command" | grep -qE 'git\s+push\b'; then
  deny=true
  reason="git push é proibido para agentes — o usuário faz push manualmente."
fi

if echo "$command" | grep -qE 'git\s+config'; then
  deny=true
  reason="git config é proibido pelo harness (não alterar config do repositório)."
fi

if echo "$command" | grep -qE 'git\s+reset\s+--hard'; then
  deny=true
  reason="git reset --hard é proibido pelo harness."
fi


if [ "$deny" = true ]; then
  python3 -c "
import json
print(json.dumps({
    'permission': 'deny',
    'user_message': 'Comando git bloqueado pelo harness Altora.',
    'agent_message': '$reason'
}))
"
  exit 2
fi

echo '{"permission":"allow"}'
exit 0
