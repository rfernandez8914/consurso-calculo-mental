# ============================================================
# Etapa 1: Build
# Usamos node:24-slim (Debian/glibc) para compatibilidad
# con las dependencias nativas del workspace (esbuild, rollup)
# ============================================================
FROM node:24-slim AS builder

# Instalar pnpm globalmente
RUN npm install -g pnpm@latest

# Definir directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración del workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json tsconfig.base.json .npmrc ./

# Copiar paquetes compartidos (libs)
COPY lib/ ./lib/

# Copiar el artifact de la app
COPY artifacts/calculo-mental/ ./artifacts/calculo-mental/

# Instalar dependencias (solo las necesarias para el build)
RUN pnpm install --frozen-lockfile

# Construir la app con variables necesarias para Vite
# BASE_PATH=/ para servir desde la raíz
# PORT=3000 es requerido por vite.config.ts (solo para el server dev, no afecta el build estático)
ENV PORT=3000
ENV BASE_PATH=/
ENV NODE_ENV=production

RUN pnpm --filter @workspace/calculo-mental run build

# ============================================================
# Etapa 2: Servidor web
# Usamos nginx:alpine para servir los archivos estáticos
# ============================================================
FROM nginx:alpine AS runner

# Eliminar la configuración por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copiar los archivos estáticos construidos
COPY --from=builder /app/artifacts/calculo-mental/dist/public /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
