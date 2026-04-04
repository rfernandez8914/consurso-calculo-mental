# 🏆 Concurso de Cálculo Mental

Una aplicación web para usar en clase como dinámica tipo concurso, enfocada en la práctica de cálculo mental para niños.

Diseñada para ser proyectada en el salón de clases por el docente: selecciona alumnos al azar, muestra operaciones matemáticas en pantalla grande y califica respuestas automáticamente.

---

## ✨ Características

- **Gestión de alumnos** — Agrega, edita y elimina alumnos. La lista se guarda automáticamente en el navegador.
- **Gestión de operaciones** — Captura operaciones matemáticas con cálculo automático de la respuesta.
- **Selección aleatoria de alumno** — Animación tipo ruleta para elegir al participante.
- **Modo Simple** — Solo muestra las operaciones, el alumno responde oralmente.
- **Modo Interactivo** — El alumno escribe sus respuestas y el sistema las califica.
- **Temporizador** — Tiempo límite por operación (configurable).
- **Pantalla completa** — Para proyección en el salón.
- **Resultados detallados** — Historial con aciertos/errores por alumno.
- **Exportar/Importar** — Guarda y carga alumnos y operaciones en JSON.
- **Sin backend** — Todo funciona desde el navegador con localStorage.

---

## 🗂 Archivos Docker incluidos

| Archivo | Propósito |
|---|---|
| `Dockerfile` | Build de **producción** (multi-etapa: Node → nginx) |
| `Dockerfile.dev` | Build de **desarrollo** con hot reload |
| `docker-compose.yml` | Orquestación para **producción / VPS** |
| `docker-compose.dev.yml` | Orquestación para **desarrollo local** |
| `nginx.conf` | Configuración de nginx para producción |

---

## 💻 Modo Desarrollo (local con hot reload)

En este modo los cambios que hagas en el código fuente se reflejan automáticamente en el navegador sin necesidad de reconstruir la imagen.

### Requisitos

- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/install/)

### Iniciar el entorno de desarrollo

```bash
# 1. Construir la imagen de desarrollo (solo la primera vez)
docker compose -f docker-compose.dev.yml up --build

# O en segundo plano
docker compose -f docker-compose.dev.yml up --build -d
```

Abre `http://localhost:3000` en tu navegador.

### Editar el código

Edita cualquier archivo dentro de `artifacts/calculo-mental/src/` y el navegador se actualizará automáticamente gracias al **Hot Module Replacement (HMR)** de Vite.

```
artifacts/calculo-mental/src/
├── App.tsx                  ← Enrutamiento principal
├── index.css                ← Estilos globales y tema de colores
├── components/
│   ├── Header.tsx           ← Encabezado de la app
│   └── NavBar.tsx           ← Barra de navegación
├── hooks/
│   ├── useAppData.ts        ← Estado de alumnos y operaciones
│   └── useLocalStorage.ts   ← Persistencia en el navegador
├── pages/
│   ├── Inicio.tsx           ← Pantalla principal
│   ├── GestionAlumnos.tsx   ← Administración de alumnos
│   ├── GestionOperaciones.tsx ← Administración de operaciones
│   ├── Juego.tsx            ← Pantalla del concurso
│   └── Resultados.tsx       ← Historial de resultados
└── types/
    └── index.ts             ← Tipos TypeScript
```

### Detener el entorno de desarrollo

```bash
docker compose -f docker-compose.dev.yml down
```

### Agregar nuevas dependencias

Si necesitas instalar un nuevo paquete npm, debes reconstruir la imagen:

```bash
# 1. Edita artifacts/calculo-mental/package.json y agrega tu dependencia
# 2. Reconstruye la imagen
docker compose -f docker-compose.dev.yml up --build
```

---

## 🚀 Modo Producción (VPS o servidor local)

Genera una imagen optimizada con nginx que sirve los archivos estáticos compilados.

### Iniciar en producción

```bash
docker compose up --build -d
```

Abre `http://localhost` (puerto 80) en tu navegador.

### Detener

```bash
docker compose down
```

### Ver logs

```bash
# Logs del contenedor en tiempo real
docker compose logs -f

# Solo los últimos 50 líneas
docker compose logs --tail=50
```

---

## 🌐 Deploy en un VPS

### Opción A — Directo con Docker Compose

```bash
# En tu servidor (Ubuntu/Debian)
sudo apt update
sudo apt install -y docker.io docker-compose-v2

# Subir el proyecto al servidor
scp -r ./concurso-calculo-mental usuario@tu-servidor:/opt/calculo-mental

# Conectarse al servidor
ssh usuario@tu-servidor

# Levantar en producción
cd /opt/calculo-mental
docker compose up --build -d
```

La app quedará disponible en `http://IP-DEL-SERVIDOR`.

### Opción B — Con dominio y HTTPS automático (Caddy)

[Caddy](https://caddyserver.com/) gestiona el certificado SSL/TLS automáticamente con Let's Encrypt.

```bash
# Instalar Caddy en el servidor
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

Crear `/etc/caddy/Caddyfile`:

```
tu-dominio.com {
    reverse_proxy localhost:80
}
```

Reiniciar Caddy:

```bash
sudo systemctl reload caddy
```

La app estará disponible en `https://tu-dominio.com` con HTTPS automático.

### Opción C — Con dominio y HTTPS (Nginx + Certbot)

Si ya tienes nginx instalado en el servidor:

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Crear config de nginx para tu dominio
sudo nano /etc/nginx/sites-available/calculo-mental
```

Contenido del archivo:

```nginx
server {
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/calculo-mental /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Obtener certificado SSL gratuito
sudo certbot --nginx -d tu-dominio.com
```

---

## 💻 Instalación sin Docker (desarrollo nativo)

### Requisitos

- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation)

```bash
# Instalar pnpm si no lo tienes
npm install -g pnpm

# Instalar dependencias del workspace
pnpm install

# Iniciar servidor de desarrollo
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/calculo-mental run dev
```

Abre `http://localhost:3000`.

### Build para producción

```bash
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/calculo-mental run build
```

Los archivos estáticos quedan en `artifacts/calculo-mental/dist/public/`.

---

## 🎮 Cómo usar la aplicación

1. **Alumnos** — Registra a tu grupo (los datos se guardan automáticamente en el navegador).
2. **Operaciones** — Agrega las operaciones matemáticas (suma, resta, multiplicación, división). La respuesta se calcula automáticamente.
3. **Juego** — Elige el modo (Simple u Interactivo), configura opciones y presiona "Elegir alumno al azar".
4. **Resultados** — En modo Interactivo, revisa aciertos y errores de cada ronda.

### Exportar/Importar datos

En la pantalla de **Inicio** puedes exportar todos los alumnos y operaciones a un archivo JSON, o importarlo en otra computadora para reutilizar los datos.

---

## 📁 Estructura del proyecto

```
concurso-calculo-mental/
├── Dockerfile                   # Producción (Node + nginx)
├── Dockerfile.dev               # Desarrollo con hot reload
├── docker-compose.yml           # Producción / VPS
├── docker-compose.dev.yml       # Desarrollo local
├── nginx.conf                   # Config de nginx
├── artifacts/
│   └── calculo-mental/          # App principal (React + Vite)
│       ├── src/                 # Código fuente editable
│       ├── package.json
│       └── vite.config.ts
├── lib/                         # Librerías del workspace
├── package.json
└── pnpm-workspace.yaml
```

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| React 19 + Vite 7 | UI y bundler |
| TypeScript 5.9 | Tipado estático |
| Tailwind CSS 4 | Estilos |
| Wouter | Enrutamiento |
| Lucide React | Iconos |
| Nunito + Fredoka One | Tipografías |
| nginx alpine | Servidor web en producción |
| Docker | Contenedores |

---

## 📄 Licencia

MIT — Libre para uso educativo.
