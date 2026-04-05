# ============================================================
# Dockerfile para el servidor API (Express 5 + Drizzle ORM)
#
# Etapa única: instala dependencias, compila y ejecuta.
# Se usa node:24-slim (Debian/glibc) para compatibilidad
# con esbuild y las dependencias nativas del workspace.
# ============================================================
FROM node:24-slim

RUN npm install -g pnpm@latest

WORKDIR /app

# Archivos de configuración del workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml \
     tsconfig.json tsconfig.base.json .npmrc ./

# Paquetes compartidos (BD + spec + zod)
COPY lib/ ./lib/

# Código fuente del API
COPY artifacts/api-server/ ./artifacts/api-server/

# Instalar todas las dependencias (incluye drizzle-kit para migraciones)
RUN pnpm install --frozen-lockfile

# Compilar el API server y el seed
RUN pnpm --filter @workspace/api-server run build

# Script de arranque
COPY docker/api-entrypoint.sh ./api-entrypoint.sh
RUN chmod +x ./api-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["./api-entrypoint.sh"]
