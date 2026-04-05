# ============================================================
# Dockerfile para el frontend (React + Vite → nginx)
#
# Etapa 1: compila la app con Vite (node:24-slim / Debian)
# Etapa 2: sirve los estáticos con nginx:alpine
#
# En VPS, nginx hace proxy de /api/ al contenedor del API.
# ============================================================

# ── Etapa 1: Build ──────────────────────────────────────────
FROM node:24-slim AS builder

RUN npm install -g pnpm@latest

WORKDIR /app

# Archivos de configuración del workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml \
     tsconfig.json tsconfig.base.json .npmrc ./

# Solo las libs que necesita el frontend
COPY lib/ ./lib/

# Código fuente del frontend
COPY artifacts/calculo-mental/ ./artifacts/calculo-mental/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Compilar la app (Vite requiere PORT y BASE_PATH)
ENV PORT=3000
ENV BASE_PATH=/
ENV NODE_ENV=production

RUN pnpm --filter @workspace/calculo-mental run build

# ── Etapa 2: Servidor web ───────────────────────────────────
FROM nginx:alpine AS runner

# Eliminar configuración por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Nuestra configuración (proxy /api → API container)
COPY docker/nginx.vps.conf /etc/nginx/conf.d/app.conf

# Archivos estáticos compilados
COPY --from=builder /app/artifacts/calculo-mental/dist/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
