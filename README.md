# 🏆 Concurso de Cálculo Mental

Una aplicación web para usar en clase como dinámica tipo concurso, enfocada en la práctica de cálculo mental para niños.

Diseñada para ser proyectada en el salón de clases por el docente: selecciona alumnos al azar, muestra operaciones matemáticas en pantalla grande y califica respuestas automáticamente.

---

## ✨ Características

- **Gestión de alumnos** — Agrega, edita y elimina alumnos. La lista se guarda automáticamente en el navegador.
- **Gestión de operaciones** — Captura operaciones matemáticas con cálculo automático de la respuesta (suma, resta, multiplicación, división).
- **Selección aleatoria de alumno** — Animación tipo ruleta para elegir al participante.
- **Modo Simple** — Solo muestra las operaciones, el alumno responde oralmente.
- **Modo Interactivo** — El alumno escribe sus respuestas y el sistema las califica.
- **Temporizador** — Tiempo límite por operación (configurable).
- **Pantalla completa** — Para proyección en el salón.
- **Resultados detallados** — Historial con aciertos/errores por alumno.
- **Exportar/Importar** — Guarda y carga alumnos y operaciones en JSON.
- **Sin backend** — Todo funciona desde el navegador con localStorage.

---

## 🐳 Instalación con Docker (recomendado)

### Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado

### Pasos

```bash
# 1. Clonar o descomprimir el proyecto
cd concurso-calculo-mental

# 2. Construir y levantar el contenedor
docker compose up --build -d

# 3. Abrir en el navegador
#    http://localhost
```

Para detener la aplicación:

```bash
docker compose down
```

Para ver los logs del contenedor:

```bash
docker compose logs -f
```

### Cambiar el puerto (opcional)

Si el puerto 80 está ocupado, edita `docker-compose.yml` y cambia la línea `"80:80"` por, por ejemplo, `"8080:80"`. Luego accede en `http://localhost:8080`.

---

## 🚀 Deploy en un VPS

### Opción A — Con Docker Compose (recomendado)

```bash
# En tu servidor (Ubuntu/Debian)
sudo apt update && sudo apt install -y docker.io docker-compose-v2

# Subir el proyecto al servidor (vía SCP, SFTP o Git)
scp -r ./concurso-calculo-mental usuario@tu-servidor:/opt/calculo-mental

# En el servidor
cd /opt/calculo-mental
docker compose up --build -d
```

### Opción B — Con dominio y HTTPS (nginx + Let's Encrypt)

Si tienes un dominio apuntando a tu VPS, puedes agregar HTTPS con [Caddy](https://caddyserver.com/) o [Certbot](https://certbot.eff.org/). Caddy es la opción más sencilla:

```bash
# Instalar Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

`Caddyfile` de ejemplo:
```
tu-dominio.com {
    reverse_proxy localhost:80
}
```

---

## 💻 Instalación sin Docker (desarrollo local)

### Requisitos previos

- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation)

```bash
# Instalar pnpm (si no lo tienes)
npm install -g pnpm

# Instalar dependencias
pnpm install

# Iniciar el servidor de desarrollo
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/calculo-mental run dev
```

Abre `http://localhost:5173` en tu navegador.

### Build para producción (sin Docker)

```bash
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/calculo-mental run build
```

Los archivos estáticos quedarán en `artifacts/calculo-mental/dist/public/`. Puedes servirlos con cualquier servidor web estático (nginx, Apache, `serve`, etc.).

---

## 📁 Estructura del proyecto

```
concurso-calculo-mental/
├── artifacts/
│   └── calculo-mental/          # Aplicación principal (React + Vite)
│       ├── src/
│       │   ├── components/      # Header y NavBar
│       │   ├── hooks/           # useLocalStorage, useAppData
│       │   ├── pages/           # Inicio, Alumnos, Operaciones, Juego, Resultados
│       │   ├── types/           # Tipos TypeScript
│       │   ├── App.tsx          # Componente raíz y enrutamiento
│       │   └── index.css        # Estilos globales y tema
│       ├── package.json
│       └── vite.config.ts
├── lib/                         # Librerías compartidas del workspace
├── Dockerfile                   # Build multi-etapa (Node + nginx)
├── docker-compose.yml           # Orquestación de contenedores
├── nginx.conf                   # Configuración del servidor web
├── package.json
└── pnpm-workspace.yaml
```

---

## 🎮 Cómo usar la aplicación

### 1. Agregar alumnos
Ve a la sección **Alumnos** y agrega los nombres de tu grupo. Puedes editar o eliminar alumnos en cualquier momento.

### 2. Cargar operaciones matemáticas
Ve a la sección **Operaciones** y agrega las operaciones que quieras practicar. Con el cálculo automático activado, la respuesta se calcula sola. También puedes ingresarla manualmente.

**Símbolos soportados:**
- Suma: `+`
- Resta: `-`
- Multiplicación: `×` o `*`
- División: `÷` o `/`

### 3. Iniciar el concurso
Ve a la sección **Juego** y:
1. Selecciona el modo de juego (Simple o Interactivo)
2. Configura opciones (temporizador, límite de operaciones, no repetir alumnos)
3. Presiona **"Elegir alumno al azar"**
4. Una vez elegido el alumno, presiona **"Iniciar ronda"**

### 4. Durante la ronda
- Usa **Siguiente / Anterior** para navegar entre operaciones
- Usa **Mostrar respuesta** para revelar la respuesta correcta
- Usa el botón de pantalla completa para proyectar en el salón

### 5. Ver resultados
En modo Interactivo, al finalizar la ronda podrás ver los resultados en la sección **Resultados**, con el detalle de cada respuesta correcta e incorrecta.

---

## 💾 Exportar e importar datos

En la pantalla de **Inicio**:
- **Exportar datos**: descarga un archivo JSON con todos los alumnos y operaciones
- **Importar datos**: carga un archivo JSON previamente exportado

El formato del archivo es:
```json
{
  "alumnos": [
    { "id": "1", "nombre": "Ana García", "usado": false }
  ],
  "operaciones": [
    { "id": "1", "texto": "8 + 7", "respuesta": 15 }
  ]
}
```

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI |
| Vite | 7 | Bundler |
| TypeScript | 5.9 | Tipado |
| Tailwind CSS | 4 | Estilos |
| Wouter | 3 | Enrutamiento |
| Lucide React | — | Iconos |
| Nunito + Fredoka One | — | Tipografías |
| nginx | alpine | Servidor web |
| Docker | — | Contenedores |

---

## 📄 Licencia

MIT — Libre para uso educativo.
