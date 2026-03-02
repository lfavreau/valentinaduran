# AGENTS.md — Reglas del proyecto (sitio estático en DreamHost)

## Objetivo
Construir y mantener un sitio público **estático** de muy baja mantención y alta seguridad.

- Framework: Astro (SSG)
- Contenido: Markdown/MDX con Content Collections y schema estricto
- Deploy: subir `dist/` a DreamHost (rsync/sftp)
- Editorial: por defecto Git (PR + checks). Opcional futuro: headless hosted (ej: Sanity) sin reescritura del front.

---

## Infraestructura (DreamHost Shared – Restricciones Reales)

Este proyecto está desplegado en DreamHost plan Shared.

### Limitaciones técnicas obligatorias

- No hay acceso root/sudo.
- No se permiten procesos persistentes (no daemons).
- No se ejecutan aplicaciones Node.js en servidor.
- No se permite Docker.
- No hay PostgreSQL.
- Solo MySQL compartido (gestionado desde panel).
- PHP disponible pero NO se usará para backend del sitio público.
- SSH/SFTP disponible para subir archivos.

### Consecuencia arquitectónica

- El sitio público DEBE ser 100% estático.
- Todo build se realiza localmente o en CI.
- El servidor solo recibe archivos generados (`dist/`).
- No se implementará backend propio en este plan.
- Si se requiere CMS dinámico:
  - Debe ser hosted externo (headless SaaS), o
  - Requiere migrar a VPS.

El asistente nunca debe proponer:

- Ejecutar Node en servidor.
- Instalar servicios.
- Crear APIs server-side.
- Depender de base de datos en runtime.
- Implementar SSR en producción.

---

## Principios (prioridad descendente)

1) Mantención mínima (menos piezas = menos fallas)
2) Seguridad (superficie de ataque baja: sin panel admin en servidor por defecto)
3) Performance y SEO (HTML estático, meta y OG correctos)
4) Reusabilidad (componentes simples, diseño consistente)
5) Extensibilidad (capa de contenido intercambiable)

---

## Stack y convenciones

- Astro + TypeScript
- Estilos (elegir uno y mantener coherencia):
  - Opción A: Tailwind
  - Opción B: CSS modules / vanilla CSS
- Sin backend propio salvo aprobación explícita.
- Sin dependencias nuevas salvo necesidad real y justificada.
- Preferir soluciones nativas del framework antes que librerías externas.

---

## Estructura sugerida del repo

- `src/pages/` — rutas
- `src/layouts/` — layouts
- `src/components/` — componentes UI
- `src/content/articles/` — artículos (md/mdx)
- `src/lib/` — helpers (slug, fechas, lectura contenido)
- `src/lib/content/` — adapters de contenido
- `public/` — imágenes estáticas, favicons, robots.txt
- `scripts/` — scripts de soporte (opcional)

---

## Modelo de contenido: Article

Todos los artículos deben cumplir schema validado por Astro Content Collections.

Campos obligatorios:

- `title`: string
- `date`: ISO string
- `author`: string
- `excerpt`: string (140–200 chars ideal)

Campos opcionales:

- `tags`: string[]
- `coverImage`: string (path dentro de `/public/...`)
- `draft`: boolean (default false)
- `slug`: string (si no se deriva del filename)

### Reglas

- `draft: true` => NO aparece en listados, RSS ni sitemap.
- Fechas se muestran en formato consistente.
- Slugs deben ser SEO-friendly.
- Imágenes optimizadas (peso razonable).
- No se permiten artículos sin excerpt.

---

## Features mínimas del “modo revista”

- Home con últimos artículos
- Página de listado `/articles`
- Página de artículo `/articles/[slug]`
- Tags opcional `/tags/[tag]`
- RSS
- Sitemap
- robots.txt
- OG tags por artículo (title, excerpt, cover si existe)
- Meta description coherente

---

## Calidad y verificación (obligatorio al finalizar cambios)

Ejecutar siempre:

- `npm run check`
- `npm run build`

Si el repo no tiene scripts, crearlos:

- `dev`: astro dev
- `build`: astro build
- `preview`: astro preview
- `check`: eslint + astro check + typecheck
- `format`: prettier (si existe)

No se considera terminado un cambio si el build falla.

---

## Workflow editorial por defecto (Git seguro para clientes)

Meta: permitir edición sin riesgo de romper producción.

### Reglas del repositorio

- Prohibido push directo a `main`
- PR obligatorio
- Checks obligatorios (build + check)
- 1 aprobación requerida

### Flujo

1) Cliente edita artículo en GitHub web (o github.dev)
2) Se crea PR
3) CI valida schema + build
4) Aprobación manual
5) Merge
6) Deploy automático

Producción solo se actualiza después de merge exitoso.

---

## Deploy a DreamHost

Estrategia: subir solo el contenido de `dist/`.

### A) Deploy manual

1. `npm run build`
2. Subir `dist/` por SFTP al directorio del dominio

### B) Deploy automático (recomendado)

GitHub Actions:

1. checkout
2. install
3. check
4. build
5. rsync por SSH a DreamHost

Secrets requeridos:

- `DREAMHOST_HOST`
- `DREAMHOST_USER`
- `DREAMHOST_PATH`
- `SSH_PRIVATE_KEY`

Reglas:

- Nunca commitear credenciales.
- Usar SSH key dedicada.
- Publicar únicamente el contenido de `dist/`.

---

## Extensión futura: GUI sin cambiar arquitectura

El sitio debe soportar cambio de origen de contenido sin reescritura.

### Content Adapter Pattern

Ubicación: `src/lib/content/`

Interfaz mínima:

- `listArticles()`
- `getArticle(slug)`
- `listTags()`
- `getTag(tag)`

Adapter actual:
- Filesystem (Markdown)

Adapter futuro:
- Headless hosted (ej: Sanity)

El resto del sitio nunca debe depender directamente del filesystem.

---

## Reglas para el asistente (Codex)

- Escribir plan breve antes de modificar código.
- Cambios pequeños y revisables.
- No introducir dependencias innecesarias.
- Ejecutar verificación al final.
- No alterar estructura sin motivo claro.
- Nunca proponer backend en este plan Shared.
- Nunca proponer SSR en producción.
- Priorizar simplicidad, claridad y mantenibilidad.
