#!/bin/bash
# Verificação ao encerrar sessão — ativo quando monorepo existir.

# Pré-monorepo: no-op silencioso. DoD está em AGENTS.md; verificação automática
# ativa quando package.json existir na raiz.
if [ ! -f package.json ]; then
  exit 0
fi

if ! command -v pnpm >/dev/null 2>&1; then
  exit 0
fi

if ! pnpm typecheck 2>/dev/null; then
  cat <<'EOF'
{
  "followup_message": "typecheck falhou. Corrija erros de tipo antes de encerrar a sessão."
}
EOF
  exit 0
fi

if ! pnpm test 2>/dev/null; then
  cat <<'EOF'
{
  "followup_message": "Testes falharam. Corrija antes de encerrar a sessão."
}
EOF
  exit 0
fi

exit 0
