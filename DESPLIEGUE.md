# Guía de despliegue

Portafolio de Mohamed Al Howaidi. Aplicación **React + Vite** que compila a un sitio
**100 % estático**: no hay servidor, ni base de datos, ni API en tiempo de ejecución.
Todo lo que se publica es una carpeta de ficheros.

Esta guía cubre dos escenarios:

1. [Ejecutarlo en local en un Mac M1](#1-ejecución-local-en-mac-apple-silicon)
2. [Subirlo a un hosting](#2-despliegue-en-hosting)

---

## 1. Ejecución local (Mac Apple Silicon)

### 1.1. Requisitos

| Herramienta | Versión | Notas |
|---|---|---|
| Node.js | 22.x | Hay `.nvmrc` en la raíz con `22` |
| pnpm | ≥ 9.5 | **Obligatorio**, ver aviso abajo |
| Git | cualquiera | |

> **pnpm no es opcional.** El `package.json` de la raíz tiene un hook `preinstall`
> que aborta la instalación si detecta `npm install` o `yarn`. Además el proyecto usa
> dos funciones exclusivas de pnpm: el protocolo `catalog:` (versiones centralizadas en
> `pnpm-workspace.yaml`) y `workspace:*` para las dependencias internas del monorepo.

Todas las dependencias son JavaScript puro o traen binarios nativos `arm64-darwin`
(esbuild, rollup). **No hace falta Rosetta.**

### 1.2. Instalación desde cero

```bash
# 1. Node 22 (con Homebrew nativo de Apple Silicon, en /opt/homebrew)
brew install node@22
# …o con nvm, que respeta el .nvmrc del repositorio:
nvm install && nvm use

# 2. pnpm
corepack enable && corepack prepare pnpm@latest --activate

# 3. Clonar e instalar
git clone https://github.com/muya03/Portafolio.git
cd Portafolio
pnpm install
```

### 1.3. Arrancar en desarrollo

```bash
cd artifacts/portfolio
pnpm dev
```

Abre <http://localhost:5173>. Recarga en caliente activada.

### 1.4. Scripts disponibles

Todos se ejecutan desde `artifacts/portfolio/`:

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo con recarga en caliente |
| `pnpm build` | Compila producción en `dist/public/` |
| `pnpm serve` | Sirve en local lo ya compilado (para probar el build antes de subirlo) |
| `pnpm typecheck` | Comprueba tipos de TypeScript sin compilar |

Desde la raíz del repositorio, `pnpm build` compila **todo** el workspace y
`pnpm typecheck` valida tipos en todos los paquetes.

### 1.5. Variables de entorno

Son **opcionales en local** — el proyecto arranca recién clonado sin configurar nada.
Si se definen, tienen prioridad sobre los valores por defecto.

| Variable | Por defecto | Para qué sirve |
|---|---|---|
| `PORT` | `5173` | Puerto de `pnpm dev` y `pnpm serve` |
| `BASE_PATH` | `/` | Ruta pública donde vivirá el sitio. **Clave si lo alojas en un subdirectorio**, ver §2.4 |

```bash
PORT=3000 pnpm dev          # arrancar en otro puerto
```

---

## 2. Despliegue en hosting

### 2.1. Generar los ficheros

```bash
cd artifacts/portfolio
pnpm build
```

El resultado queda en **`artifacts/portfolio/dist/public/`**:

```
dist/public/
├── index.html
├── favicon.svg
├── opengraph.jpg
├── robots.txt
├── cv-mohamed-al-howaidi.pdf
├── informe-gestion-consell-estudiantat-2024-2026.pdf
├── photos/
└── assets/          # JS y CSS con hash en el nombre
```

Comprueba el build antes de subirlo:

```bash
pnpm serve   # sirve dist/public en http://localhost:5173
```

### 2.2. Hosting clásico (cPanel, Plesk, FTP, SFTP)

Es el caso más simple, porque no hay nada que ejecutar en el servidor.

1. Ejecuta `pnpm build` **en tu Mac**.
2. Sube **el contenido** de `dist/public/` (no la carpeta en sí) a `public_html/`
   o `www/` del servidor.
3. Listo.

> ⚠️ Sube el *contenido*, no la carpeta. Si acabas con `public_html/public/index.html`
> el sitio saldrá 404.

### 2.3. Plataformas de despliegue continuo

Al ser un monorepo pnpm, hay que apuntar bien el directorio de salida.

**Netlify** — `netlify.toml` en la raíz:

```toml
[build]
  command = "pnpm install && pnpm --filter @workspace/portfolio build"
  publish = "artifacts/portfolio/dist/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel** — en la configuración del proyecto:

- Build Command: `pnpm install && pnpm --filter @workspace/portfolio build`
- Output Directory: `artifacts/portfolio/dist/public`
- Install Command: dejar vacío (ya va en el build command)

**Cloudflare Pages**:

- Build command: `pnpm install && pnpm --filter @workspace/portfolio build`
- Build output directory: `artifacts/portfolio/dist/public`

En las tres, fija la versión de Node a **22** (variable de entorno
`NODE_VERSION=22`) para que coincida con el `.nvmrc`.

### 2.4. Alojarlo en un subdirectorio

Si el sitio **no** cuelga de la raíz del dominio (por ejemplo
`https://midominio.com/portafolio/`), hay que compilar indicándolo, o todos los
CSS, JS e imágenes darán 404:

```bash
BASE_PATH=/portafolio/ pnpm build
```

La barra inicial y la final son obligatorias. Para la raíz del dominio no hace
falta tocar nada.

### 2.5. Configuración del servidor web

El sitio es una SPA: el enrutado lo resuelve JavaScript en el navegador. Cualquier
ruta que no exista como fichero debe devolver `index.html`, o el servidor responderá
404 antes de que la aplicación pueda pintar su propia página de "no encontrado".

**Nginx**:

```nginx
server {
    listen 80;
    server_name midominio.com;
    root /var/www/portafolio;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Los assets llevan hash en el nombre: se pueden cachear indefinidamente
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Apache** — `.htaccess` junto al `index.html`:

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

### 2.6. Comprobaciones tras publicar

- [ ] La portada carga con estilos (si se ve texto sin formato, revisa `BASE_PATH`)
- [ ] Los cuatro idiomas funcionan: ES / VA / EN / AR
- [ ] En árabe la maquetación pasa a derecha-izquierda
- [ ] Descarga el CV y el informe de gestión desde la sección *Representación*
- [ ] Las tarjetas de *Medios* abren la noticia correcta
- [ ] Las tarjetas de *Proyectos* abren cada sitio
- [ ] Se ve bien en móvil

---

## 3. Problemas frecuentes

**`Use pnpm instead` al instalar**
Has lanzado `npm install` o `yarn`. Usa `pnpm install`.

**`You installed esbuild for another platform`**
`node_modules` se instaló bajo Rosetta o en otra arquitectura. Solución:

```bash
rm -rf node_modules artifacts/*/node_modules lib/*/node_modules
pnpm install
```

Confirma que tu Node es nativo — `node -p "process.arch"` debe decir `arm64`.

**La instalación se queja de que un paquete es demasiado reciente**
Es intencionado. `pnpm-workspace.yaml` fija `minimumReleaseAge: 1440`, que bloquea
paquetes publicados hace menos de 24 h como defensa frente a ataques de cadena de
suministro. **No lo desactives**: espera, o añade el paquete concreto a
`minimumReleaseAgeExclude`.

**El sitio carga sin CSS ni imágenes**
`BASE_PATH` no coincide con la ruta real. Recompila con el valor correcto (§2.4).

**Página en blanco y errores 404 de `/assets/…` en la consola**
Mismo origen que el anterior, o has subido la carpeta `public/` en lugar de su
contenido (§2.2).

**Aviso `Some chunks are larger than 500 kB` al compilar**
Es un aviso, no un error. El build es correcto. Viene de que `three` y `gsap`
entran en el bundle principal.
