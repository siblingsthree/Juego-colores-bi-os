#!/usr/bin/env bash
# Descarga las siluetas de Fluent Emoji de recursos/lote-fluent.txt y genera sus dibujos.
# Uso: bash scripts/lote-fluent.sh        (luego: npm run comprobar)
set -euo pipefail
cd "$(dirname "$0")/.."
BASE=https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets
CREDITO="Fluent Emoji © Microsoft Corporation (MIT)"
mkdir -p recursos/fuentes
grep -v '^#' recursos/lote-fluent.txt | while IFS='|' read -r carpeta archivo id es en categoria edad fondo densidad; do
  [ -n "$carpeta" ] || continue
  destino="recursos/fuentes/$archivo"
  [ -s "$destino" ] || curl -sf --max-time 30 -o "$destino" "$BASE/${carpeta// /%20}/Flat/$archivo"
  node scripts/generar.cjs vidriera "$destino" "$id" "$es" "$en" "$categoria" "$edad" \
    --fondo="$fondo" --densidad="$densidad" --credito="$CREDITO" 2>&1 | grep -v '  aviso' || true
done
