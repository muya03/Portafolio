# Portafolio — Guía de despliegue

Sitio web de portafolio personal construido como aplicación de una sola página (SPA). Esta guía resume cómo compilarlo y publicarlo en un hosting web, las tecnologías que usa y los problemas habituales que pueden surgir durante el despliegue.

---

## Tecnologías

El proyecto está estructurado como un **monorepo pnpm** con varios paquetes, pero la web pública es únicamente el frontend (`artifacts/portfolio`). El backend (`artifacts/api-server`), la capa de base de datos (`lib/db`) y las librerías compartidas **no son necesarios para publicar el portafolio**, ya que el frontend no realiza llamadas a la API.

El frontend utiliza:

- **React 19** con **TypeScript** como base de la interfaz.
- **Vite 7** como herramienta de compilación y servidor de desarrollo.
- **Tailwind CSS 4** (con el motor nativo `@tailwindcss/oxide`) para los estilos.
- **wouter** para el enrutado del lado del cliente.
- **Radix UI** para componentes de interfaz accesibles.
- **framer-motion**, **GSAP**, **anime.js** y **three.js** para animaciones y gráficos.
- **pnpm** como gestor de paquetes (obligatorio: el proyecto rechaza npm y yarn mediante un script `preinstall`).

El resultado de la compilación es un sitio **completamente estático** (HTML, CSS y JavaScript), por lo que puede alojarse en cualquier hosting web tradicional o plataforma de sitios estáticos.

---

## Requisitos previos

- **Node.js 20 o superior**.
- **pnpm** instalado (`npm install -g pnpm` o `corepack enable`).
- Git (opcional, para clonar el repositorio).

---

## Pasos de despliegue

### 1. Descargar el proyecto

```bash
git clone https://github.com/muya03/Portafolio.git
cd Portafolio
```

### 2. Instalar dependencias

Desde la raíz del proyecto:

```bash
pnpm install
```

### 3. Compilar el frontend

El archivo `vite.config.ts` exige **dos variables de entorno obligatorias**: `PORT` y `BASE_PATH`. Sin ellas, la compilación falla.

- `PORT`: cualquier número (solo se usa en desarrollo; irrelevante para el sitio final).
- `BASE_PATH`: **debe coincidir con la ruta donde se servirá el sitio**.
  - Raíz del dominio (ej. `tudominio.com`) → `BASE_PATH=/`
  - Subcarpeta (ej. `tudominio.com/portfolio/`) → `BASE_PATH=/portfolio/`

```bash
cd artifacts/portfolio
PORT=5000 BASE_PATH=/ npx vite build --config vite.config.ts
```

> Se recomienda `npx vite build` en lugar de `pnpm run build`, porque el script `build` del repositorio relanza `pnpm install` internamente y puede fallar.

### 4. Resultado

La compilación genera la carpeta `artifacts/portfolio/dist/public/` con:

```
index.html
assets/      (CSS y JS compilados)
photos/      (imágenes)
favicon.svg
cv-mohamed-al-howaidi.pdf
robots.txt
```

**Este es el contenido que se sube al hosting**, no el código fuente.

### 5. Probar en local antes de subir

```bash
PORT=4173 BASE_PATH=/ npx vite preview --config vite.config.ts
```

Abrir `http://localhost:4173`. (Abrir el `index.html` con doble clic mediante `file://` **no funciona**; debe servirse por un servidor web.)

### 6. Subir al hosting

Subir **el contenido de** `dist/public/` (no la carpeta en sí) a la raíz web del hosting.

**Hosting tradicional (cPanel, IONOS, Hostinger, FTP/SFTP):** subir todos los archivos a `public_html/` o la carpeta raíz del dominio. Al ser una SPA, añadir un archivo `.htaccess` en esa misma carpeta para que el enrutado del lado del cliente no devuelva 404:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Netlify:** arrastrar la carpeta `dist/public`, o conectar el repositorio con build command `cd artifacts/portfolio && PORT=5000 BASE_PATH=/ npx vite build --config vite.config.ts` y publish directory `artifacts/portfolio/dist/public`. Añadir un archivo `_redirects` con `/*  /index.html  200`.

**Vercel:** importar el repositorio, output directory `artifacts/portfolio/dist/public`, y definir las variables de entorno `PORT` y `BASE_PATH`.

**GitHub Pages (en subcarpeta):** compilar con `BASE_PATH=/Portafolio/` y copiar `index.html` como `404.html` dentro de la carpeta publicada para el fallback de la SPA.

---

## Problemas frecuentes y soluciones

### El proyecto está configurado para Linux (Replit)

El repositorio fue desarrollado en Replit (Linux), y el archivo `pnpm-workspace.yaml` **excluye deliberadamente los binarios nativos de otras plataformas** mediante un bloque `overrides` con valores `"-"`. Esto provoca que, al compilar en macOS (Apple Silicon) o Windows, falten los binarios nativos y la compilación falle.

**Síntoma:** errores del tipo `Cannot find module @rollup/rollup-darwin-arm64`, `You installed esbuild for another platform`, o `Cannot find module '../lightningcss.darwin-arm64.node'`.

**Solución:** en `pnpm-workspace.yaml`, dentro del bloque `overrides`, eliminar las líneas que excluyen el binario de tu plataforma (las que terminan en `darwin-arm64: "-"` en el caso de Mac con Apple Silicon), para esbuild, rollup, lightningcss y @tailwindcss/oxide. Después borrar `node_modules` y `pnpm-lock.yaml` y reinstalar:

```bash
rm -rf node_modules artifacts/*/node_modules lib/*/node_modules
rm -f pnpm-lock.yaml
pnpm install
```

Verificar que los binarios nativos correctos están presentes:

```bash
ls node_modules/.pnpm | grep darwin
```

### Los scripts de compilación nativos no se ejecutan

**Síntoma:** `[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: esbuild`.

Por seguridad, pnpm no ejecuta automáticamente los scripts de instalación de las dependencias.

**Solución:** ejecutar `pnpm approve-builds`, seleccionar `esbuild` (y cualquier otro paquete nativo) y confirmar. Las versiones recientes de pnpm guardan esta configuración en `pnpm-workspace.yaml`, **no** en `package.json` (el campo `pnpm` de `package.json` ya no se lee).

### Error de clave duplicada en YAML

**Síntoma:** `[ERROR] duplicated mapping key`.

Ocurre al añadir manualmente un `onlyBuiltDependencies` cuando ya existe uno en `pnpm-workspace.yaml`.

**Solución:** dejar **una sola** aparición de cada clave en el archivo. Buscar duplicados con `grep -n "onlyBuiltDependencies" pnpm-workspace.yaml`.

### Falla la compilación por falta de variables de entorno

**Síntoma:** `PORT environment variable is required` o `BASE_PATH environment variable is required`.

**Solución:** definir ambas variables al ejecutar el build (ver paso 3).

### El puerto está ocupado al previsualizar

**Síntoma:** `Port 5000 is already in use`.

En macOS, el puerto 5000 lo suele usar el Receptor AirPlay.

**Solución:** usar otro puerto, por ejemplo `PORT=4173`. El puerto solo afecta a la vista previa local, no al sitio final.

### Página en blanco tras subir al hosting

Es el problema más común y casi siempre tiene una de estas causas:

1. **El `BASE_PATH` no coincide con la ruta real.** Si se sirve en la raíz, debe compilarse con `BASE_PATH=/`; si en subcarpeta, con la ruta de esa subcarpeta. Si no coinciden, el navegador busca los assets en una ruta incorrecta y la página queda vacía.
2. **No se subió la carpeta `assets/` completa**, o se subió a una ubicación equivocada. Comprobar que `https://tudominio/assets/...js` y `...css` cargan sin dar 404.
3. **Se subió la carpeta `dist/public` entera** en lugar de su contenido, dejando los archivos en `tudominio/public/...` en vez de en la raíz.
4. **Se abrió el `index.html` localmente con `file://`** (doble clic). Esto nunca funciona: las rutas absolutas de los assets requieren un servidor web. Usar `vite preview` o subir al hosting.

**Cómo diagnosticar:** abrir la consola del navegador (F12 → Console y Network) y revisar si hay errores 404 sobre los archivos de `assets/`, o errores de CORS/`crossorigin`.

### Rutas internas que dan 404 al recargar

**Síntoma:** la página principal carga, pero al recargar una ruta interna o entrar directo a una URL aparece un 404.

**Causa:** falta el fallback de la SPA en el servidor.

**Solución:** añadir el `.htaccess` (Apache/IONOS), el `_redirects` (Netlify) o el `404.html` (GitHub Pages) según el hosting (ver paso 6).

---

## Personalización

El `index.html`, el CV (`cv-mohamed-al-howaidi.pdf`) y las fotos (`public/photos/`) contienen los datos del autor original. Antes de publicar el sitio como propio, conviene editar los textos en `src/`, reemplazar el PDF y las imágenes, y recompilar.
