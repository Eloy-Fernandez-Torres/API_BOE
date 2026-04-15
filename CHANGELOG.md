# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).
Versionado siguiendo [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.0.0] — 2026-04-14

### Añadido
- Buscador de ayudas y subvenciones sobre la API oficial del BOE.
- Filtrado por organismo convocante y tipo de disposición.
- Parámetro `dias` para acotar la búsqueda a los últimos N días.
- Endpoint `/api/ayudas/sumario?fecha=YYYY-MM-DD` para disposiciones de un día concreto.
- Endpoint `/api/ayudas/:id` para obtener el detalle de una disposición (BOE-A-…).
- Sistema de caché en memoria para reducir llamadas a la API del BOE.
- Frontend web servido estáticamente desde `/public`.
- Control de acceso por roles (`roleAccess` middleware).
- Manejo centralizado de errores (`errorHandler` middleware).
- Archivos legales: Política de Privacidad, Términos de Uso, Política de Cookies, Disclaimer.
- `robots.txt`, `sitemap.xml` y `manifest.json` para SEO y PWA básico.
- `SECURITY.md` con proceso de reporte de vulnerabilidades.
- `CONTRIBUTING.md` con guía de contribución.

---

<!-- Añade nuevas versiones encima de esta línea -->
