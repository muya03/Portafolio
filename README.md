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

- **Node.js 20.19+ o 22.12+** (Vite 7 no admite versiones anteriores). El repositorio incluye un `.nvmrc`, así que con [nvm](https://github.com/nvm-sh/nvm) basta con ejecutar `nvm use` en la raíz del proyecto.
- **pnpm 10 o superior**. La forma recomendada es `corepack enable`, que instala automáticamente la versión fijada en el campo `packageManager` del `package.json`.
- Git (opcional, para clonar el repositorio).

### Plataformas admitidas

El proyecto se instala y compila sin cambios en:

- **macOS con Apple Silicon** (M1, M2, M3, M4 — `darwin-arm64`)
- **macOS con Intel** (`darwin-x64`)
- **Linux x64**

En un Mac con Apple Silicon, si Node.js se ha instalado con nvm o con el paquete oficial, ya se obtiene la versión nativa `arm64`. Se puede comprobar con `node -p "process.arch"`, que debe responder `arm64`. No hace falta Rosetta.

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

Desde la raíz del proyecto:

```bash
pnpm run build:portfolio
```

No hace falta definir ninguna variable de entorno: el sitio se compila para servirse en la **raíz del dominio** (`BASE_PATH=/`).

Si el sitio va a publicarse en una **subcarpeta**, hay que indicarlo con `BASE_PATH`, que debe coincidir con la ruta donde se servirá:

```bash
# Para tudominio.com/portfolio/
BASE_PATH=/portfolio/ pnpm run build:portfolio
```

Variables de entorno reconocidas (todas opcionales):

| Variable | Valor por defecto | Para qué sirve |
| --- | --- | --- |
| `BASE_PATH` | `/` | Ruta pública donde se servirá el sitio. |
| `PORT` | `5173` | Puerto del servidor de desarrollo y de la vista previa. |
| `HOST` | `0.0.0.0` | Interfaz de escucha. Usar `localhost` para evitar el aviso del cortafuegos de macOS. |

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

Para servir la compilación tal cual se subirá al hosting:

```bash
pnpm run serve
```

Abrir la URL que muestra la consola (por defecto `http://localhost:5173`). Abrir el `index.html` con doble clic mediante `file://` **no funciona**; debe servirse por un servidor web.

Para trabajar en el código con recarga en caliente, en lugar de lo anterior:

```bash
pnpm run dev
```

En macOS, al arrancar el servidor aparece un aviso del cortafuegos porque por defecto escucha en todas las interfaces. Para evitarlo, arrancar con `HOST=localhost pnpm run dev`.

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

**Netlify:** arrastrar la carpeta `dist/public`, o conectar el repositorio con build command `pnpm run build:portfolio` y publish directory `artifacts/portfolio/dist/public`. Añadir un archivo `_redirects` con `/*  /index.html  200`.

**Vercel:** importar el repositorio, build command `pnpm run build:portfolio` y output directory `artifacts/portfolio/dist/public`. No hace falta definir variables de entorno.

**GitHub Pages (en subcarpeta):** compilar con `BASE_PATH=/Portafolio/ pnpm run build:portfolio` y copiar `index.html` como `404.html` dentro de la carpeta publicada para el fallback de la SPA.

---

## Problemas frecuentes y soluciones

### Faltan binarios nativos en macOS

**Síntoma:** errores del tipo `Cannot find module @rollup/rollup-darwin-arm64`, `You installed esbuild for another platform`, o `Cannot find module '../lightningcss.darwin-arm64.node'`.

Estos errores **ya no deberían aparecer**: el archivo `pnpm-workspace.yaml` incluye los binarios de macOS (`darwin-arm64` y `darwin-x64`) para esbuild, rollup, lightningcss y `@tailwindcss/oxide`, y el `pnpm-lock.yaml` los tiene resueltos.

Si aún así aparecen, casi siempre se debe a un `node_modules` heredado de una instalación anterior. Reinstalar en limpio (sin borrar el `pnpm-lock.yaml`):

```bash
rm -rf node_modules artifacts/*/node_modules lib/*/node_modules
pnpm install
```

Verificar que los binarios nativos correctos están presentes:

```bash
ls node_modules/.pnpm | grep darwin
```

Si el resultado está vacío en un Mac, comprobar que Node.js es realmente nativo y no una compilación x64 ejecutándose bajo Rosetta:

```bash
node -p "process.arch"   # debe responder "arm64" en Apple Silicon
```

> **Nota:** los `overrides` de `pnpm-workspace.yaml` siguen excluyendo los binarios de Windows, Android, FreeBSD, etc. para que la instalación no descargue paquetes innecesarios. **No hay que volver a añadir las líneas `darwin-*`**: eliminarlas es precisamente lo que permite que el proyecto funcione en Mac.

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

Ya no ocurre: ambas variables son opcionales y tienen valores por defecto (`PORT=5173`, `BASE_PATH=/`). Si el error persiste, es que se está ejecutando una copia antigua del repositorio.

### El puerto está ocupado

**Síntoma:** `Port 5173 is already in use`.

En desarrollo, Vite pasa automáticamente al siguiente puerto libre y muestra la URL definitiva en la consola.

**Solución (si se quiere fijar uno concreto):** `PORT=4173 pnpm run dev`.

> En macOS conviene **no** usar el puerto **5000**: lo ocupa el Receptor AirPlay del sistema. Por eso el valor por defecto es 5173.

### La versión de Node.js es demasiado antigua

**Síntoma:** al instalar, un aviso de `Unsupported engine`, o errores de sintaxis al arrancar Vite.

**Solución:** usar Node.js 20.19+ o 22.12+. Con nvm, desde la raíz del proyecto:

```bash
nvm install   # lee el .nvmrc del repositorio
nvm use
```

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
