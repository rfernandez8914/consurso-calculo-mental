# 🏆 Concurso de Cálculo Mental

Una aplicación web para usar en clase como dinámica tipo concurso, enfocada en la práctica de cálculo mental para niños.

Diseñada para ser proyectada en el salón de clases por el docente: selecciona alumnos al azar, muestra operaciones matemáticas en pantalla grande y califica respuestas automáticamente.

---

## ✨ Características

- **Login con sesión** — acceso por correo y contraseña, sesión de 7 días
- **Roles**: Administrador y Maestro
- **Gestión de usuarios** — el administrador crea y administra cuentas de maestros
- **Gestión de alumnos** — agrega, edita y elimina alumnos del grupo
- **Gestión de operaciones** — captura operaciones con cálculo automático de la respuesta
- **Selección aleatoria de alumno** — animación tipo ruleta
- **Modo Simple** — solo muestra las operaciones, el alumno responde oralmente
- **Modo Interactivo** — el alumno escribe sus respuestas y el sistema las califica
- **Temporizador** — tiempo límite por operación (configurable)
- **Pantalla completa** — para proyección en el salón
- **Resultados detallados** — historial con aciertos/errores por alumno
- **Exportar/Importar** — guarda y carga alumnos y operaciones en JSON

---

## 🗂 Archivos Docker incluidos

| Archivo | Propósito |
|---|---|
| `Dockerfile` | Build de **producción simple** (solo frontend + nginx) |
| `Dockerfile.dev` | Build de **desarrollo** con hot reload |
| `docker-compose.yml` | Producción simple (solo frontend, sin BD propia) |
| `docker-compose.dev.yml` | Desarrollo local con hot reload |
| `docker-compose.vps.yml` | **VPS completo** (BD + API + Web + Apache) |
| `docker/api.Dockerfile` | Build del servidor API (Express 5) |
| `docker/web.Dockerfile` | Build del frontend (React → nginx) |
| `docker/nginx.vps.conf` | nginx con proxy `/api/` al contenedor API |
| `docker/api-entrypoint.sh` | Arranque del API: migra BD + seed + servidor |
| `docker/apache-calculo-mental.conf` | Configuración Apache para el VPS |
| `env.vps.example` | Plantilla de variables de entorno para VPS |
| `nginx.conf` | nginx para la producción simple (sin API) |

---

## 🖥️ Deploy en VPS con Apache

Esta es la opción recomendada para un servidor real. Levanta tres contenedores Docker en una red interna privada: base de datos PostgreSQL, servidor API y frontend nginx. Apache actúa como reverse proxy con SSL hacia el exterior.

### Requisitos previos

- Ubuntu / Debian en el VPS
- Docker + Docker Compose v2
- Apache2 con SSL habilitado
- Un dominio apuntando al VPS

```bash
# Instalar Docker (si no está instalado)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

---

### Paso 1 — Clonar / subir el proyecto

```bash
# Subir el proyecto al servidor (desde tu máquina local)
scp -r ./concurso-calculo-mental usuario@tu-servidor:/opt/calculo-mental

# O clonar el repositorio directamente en el servidor
ssh usuario@tu-servidor
git clone https://tu-repo.git /opt/calculo-mental
cd /opt/calculo-mental
```

---

### Paso 2 — Configurar variables de entorno

```bash
cp env.vps.example .env.vps
nano .env.vps
```

Rellena **todos** los valores:

```env
# Base de datos (PostgreSQL interno en Docker)
POSTGRES_USER=calculodb
POSTGRES_PASSWORD=una_contrasena_muy_segura      # ← cámbialo

POSTGRES_DB=calculodb

# Sesión (OBLIGATORIO en producción)
# Genera con: openssl rand -hex 64
SESSION_SECRET=pega_aqui_el_resultado_de_openssl

# Puerto interno hacia Apache (cambia si 4201 ya está en uso)
WEB_PORT=4201
```

> **Cuenta de superadmin** creada automáticamente al primer arranque:
> - Usuario: `admin@correo.com`
> - Contraseña: `Admin123!`
>
> **Cámbiala** desde "Mi perfil" después del primer login.

---

### Paso 3 — Levantar los contenedores

```bash
docker compose -f docker-compose.vps.yml --env-file .env.vps up --build -d
```

La primera vez tarda ~3-5 minutos (compila frontend y backend). Al arrancar, el API aplica automáticamente el esquema de base de datos y crea el superadmin si no existe.

Verifica que todo corre:

```bash
docker compose -f docker-compose.vps.yml ps

# Probar el API internamente
curl http://127.0.0.1:4201/api/healthz
# Respuesta esperada: {"status":"ok"}
```

---

### Paso 4 — Configurar Apache con SSL

Habilita los módulos necesarios:

```bash
sudo a2enmod proxy proxy_http headers rewrite ssl
```

Copia y edita la configuración:

```bash
sudo cp docker/apache-calculo-mental.conf /etc/apache2/sites-available/calculo-mental.conf
sudo nano /etc/apache2/sites-available/calculo-mental.conf
```

Reemplaza en el archivo:

| Texto a reemplazar | Por |
|---|---|
| `TU_DOMINIO.COM` | tu dominio real, ej. `calculo.miescuela.com` |
| `/ruta/al/cert/fullchain.pem` | ruta a tu certificado SSL |
| `/ruta/al/cert/privkey.pem` | ruta a tu clave privada SSL |
| `4201` | el valor de `WEB_PORT` en `.env.vps` |

Activa el sitio y recarga Apache:

```bash
sudo a2ensite calculo-mental.conf
sudo apache2ctl configtest        # debe decir "Syntax OK"
sudo systemctl reload apache2
```

La app queda disponible en `https://TU_DOMINIO.COM` ✓

---

### Paso 5 (opcional) — Obtener certificado SSL gratis con Certbot

Si no tienes certificado SSL, Certbot lo genera automáticamente con Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d TU_DOMINIO.COM
```

Certbot actualiza la configuración de Apache automáticamente.

---

### Comandos útiles en el VPS

```bash
# Ver estado de los contenedores
docker compose -f docker-compose.vps.yml ps

# Ver logs en tiempo real
docker compose -f docker-compose.vps.yml logs -f

# Ver logs solo del API
docker compose -f docker-compose.vps.yml logs -f api

# Detener todo
docker compose -f docker-compose.vps.yml down

# Actualizar la app (re-build y reiniciar)
docker compose -f docker-compose.vps.yml --env-file .env.vps up --build -d

# Reiniciar solo el API
docker compose -f docker-compose.vps.yml restart api
```

---

## 💻 Desarrollo local (con hot reload)

En este modo los cambios en el código fuente se reflejan automáticamente.

### Iniciar

```bash
# Primera vez — construye la imagen
docker compose -f docker-compose.dev.yml up --build

# Las siguientes veces
docker compose -f docker-compose.dev.yml up
```

Abre `http://localhost:3000`. Edita cualquier archivo dentro de `artifacts/calculo-mental/src/` y el navegador se actualiza automáticamente.

### Detener

```bash
docker compose -f docker-compose.dev.yml down
```

---

## 🚀 Producción simple (frontend solo, sin API)

Si ya tienes una base de datos y API externos, puedes levantar solo el frontend:

```bash
docker compose up --build -d
```

Abre `http://localhost` (puerto 80).

---

## 💻 Sin Docker (desarrollo nativo)

### Requisitos

- [Node.js 24+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation)
- PostgreSQL

```bash
# Instalar pnpm si no lo tienes
npm install -g pnpm

# Instalar dependencias del workspace
pnpm install

# Levantar el API server
pnpm --filter @workspace/api-server run dev

# En otra terminal, levantar el frontend
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/calculo-mental run dev
```

Abre `http://localhost:3000`.

---

## 🎮 Cómo usar la aplicación

1. **Login** — Inicia sesión con tu correo y contraseña.
2. **Alumnos** — Registra a tu grupo.
3. **Operaciones** — Agrega las operaciones matemáticas.
4. **Juego** — Elige el modo (Simple o Interactivo) y presiona "Elegir alumno al azar".
5. **Resultados** — En modo Interactivo, revisa aciertos y errores de cada ronda.

### Panel de administración (solo Administrador)

- Ve a la pestaña **Usuarios** para crear, editar o eliminar cuentas de maestros.
- Los maestros solo tienen acceso a la aplicación del concurso.

---

## 📁 Estructura del proyecto

```
concurso-calculo-mental/
├── docker/
│   ├── api.Dockerfile              # Build del API server
│   ├── web.Dockerfile              # Build del frontend
│   ├── nginx.vps.conf              # nginx con proxy /api/ → API container
│   ├── api-entrypoint.sh           # Arranque del API (migra + seed + server)
│   └── apache-calculo-mental.conf  # Config Apache para VPS
├── Dockerfile                      # Producción simple (solo frontend)
├── Dockerfile.dev                  # Desarrollo con hot reload
├── docker-compose.vps.yml          # VPS: BD + API + Web
├── docker-compose.yml              # Producción simple
├── docker-compose.dev.yml          # Desarrollo local
├── nginx.conf                      # nginx producción simple
├── env.vps.example                 # Plantilla de variables para VPS
├── artifacts/
│   ├── api-server/                 # Express 5 API + sesiones + Drizzle ORM
│   └── calculo-mental/             # React + Vite SPA
├── lib/
│   ├── db/                         # Esquema PostgreSQL + Drizzle
│   └── api-spec/                   # Especificación OpenAPI
└── package.json
```

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| React 19 + Vite 7 | UI y bundler |
| TypeScript 5.9 | Tipado estático |
| Tailwind CSS 4 | Estilos |
| Wouter | Enrutamiento |
| Express 5 | API server |
| express-session + bcryptjs | Autenticación con sesiones |
| PostgreSQL 16 + Drizzle ORM | Base de datos |
| nginx alpine | Servidor web en producción |
| Docker | Contenedores |
| Apache2 | Reverse proxy con SSL |

---

## 📄 Licencia

MIT — Libre para uso educativo.
