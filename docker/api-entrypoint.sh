#!/bin/sh
set -e

echo "========================================"
echo "  Concurso de Cálculo Mental — API"
echo "========================================"

echo ""
echo "▶ Aplicando esquema de base de datos..."
pnpm --filter @workspace/db run push
echo "✓ Esquema aplicado"

echo ""
echo "▶ Ejecutando seed (superadmin)..."
node --enable-source-maps /app/artifacts/api-server/dist/seed.mjs
echo "✓ Seed completado"

echo ""
echo "▶ Iniciando servidor API en puerto ${PORT:-8080}..."
exec node --enable-source-maps /app/artifacts/api-server/dist/index.mjs
