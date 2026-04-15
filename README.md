# BOE Finder — Buscador de Ayudas y Subvenciones

> Buscador web independiente sobre la **API oficial de datos abiertos del BOE**.  
> Encuentra convocatorias, ayudas y subvenciones por palabra clave, sector y fecha.

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-yellow)
![Datos BOE](https://img.shields.io/badge/Datos-BOE%20Datos%20Abiertos-red)

---

## Características

- 🔍 Búsqueda por palabra clave en sumarios diarios del BOE
- 📅 Filtrado por rango de días (3, 7, 14 o 30 días)
- 🏷️ Filtros por sector y tipo de disposición
- 💾 Caché en memoria para reducir llamadas a la API del BOE
- 👥 Control de acceso por roles (Estándar / Pro / Creador)
- 🌐 Frontend web estático incluido, listo para producción
- ⚖️ Sin API key — consume datos abiertos del BOE de forma gratuita

---

## Requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9
- Conexión a internet (para consultar `api.boe.es`)

---

## Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/API_BOE.git
cd API_BOE

# 2. Instala dependencias
npm install

# 3. Configura el entorno
cp .env.example .env
# Edita .env si necesitas cambiar el puerto o el timeout

# 4. Arranca en modo desarrollo
npm run dev
# → http://localhost:3000

# 5. Arranca en producción
npm start
```

---

## Variables de entorno

| Variable          | Descripción                        | Valor por defecto |
|-------------------|------------------------------------|-------------------|
| `PORT`            | Puerto del servidor HTTP           | `3000`            |
| `BOE_API_TIMEOUT` | Timeout de llamadas al BOE (ms)    | `8000`            |

No se necesita API key. La API del BOE es de acceso libre.

---

## Endpoints de la API

| Método | Ruta                                       | Descripción                                              |
|--------|--------------------------------------------|----------------------------------------------------------|
| `GET`  | `/api/ayudas/buscar?q=texto&dias=7`        | Busca ayudas en los últimos N días                       |
| `GET`  | `/api/ayudas/sumario?fecha=2026-04-06`     | Todas las disposiciones de un día (solo rol Creador)     |
| `GET`  | `/api/ayudas/:id`                          | Detalle de una disposición por ID (BOE-A-…)              |
| `GET`  | `/api/ayudas/debug?fecha=20260407`         | XML crudo parseado del BOE (solo rol Creador)            |

### Parámetros de búsqueda

| Parámetro | Tipo   | Descripción                          |
|-----------|--------|--------------------------------------|
| `q`       | string | Palabra clave (requiere rol ≥ Pro)   |
| `dias`    | number | Días hacia atrás (máx. según rol)    |
| `sector`  | string | Filtro de sector (requiere rol Pro)  |
| `tipo`    | string | Tipo de disposición                  |

### Roles de acceso

| Rol        | Días máx. | Resultados | Búsqueda keyword | Filtro sector |
|------------|-----------|------------|------------------|---------------|
| Estándar   | 7         | 20         | ❌               | ❌            |
| Pro        | 14        | 100        | ✅               | ✅            |
| Creador    | 30        | Ilimitado  | ✅               | ✅            |

Para cambiar los límites de rol, edita `src/config/roles.config.js`.

---

## Estructura del proyecto

```
API_BOE/
├── src/
│   ├── app.js                         # Entry point Express
│   ├── config/
│   │   ├── boe.config.js              # URL y parámetros de la API del BOE
│   │   └── roles.config.js            # Definición de roles y límites
│   ├── clients/
│   │   └── boeClient.js               # HTTP client + parser XML→JS
│   ├── services/
│   │   └── ayudasService.js           # Lógica: descarga, filtrado, caché
│   ├── controllers/
│   │   └── ayudas.controller.js       # Controladores de rutas
│   ├── routes/
│   │   └── ayudas.routes.js           # Definición de rutas Express
│   ├── middleware/
│   │   ├── errorHandler.js            # Manejo centralizado de errores
│   │   └── roleAccess.js              # Middleware de control de acceso
│   └── utils/
│       └── cache.js                   # Caché en memoria (TTL configurable)
├── public/
│   ├── index.html                     # Frontend principal
│   ├── css/styles.css                 # Estilos
│   ├── js/main.js                     # Lógica frontend
│   ├── manifest.json                  # PWA manifest
│   ├── robots.txt                     # Directivas SEO
│   ├── sitemap.xml                    # Mapa del sitio
│   ├── privacy.html                   # Política de privacidad
│   ├── terms.html                     # Términos de uso
│   └── cookies.html                   # Política de cookies
├── scripts/
│   ├── sample_debug.json              # Ejemplo de respuesta BOE
│   └── test_parser.js                 # Script de prueba del parser
├── .env.example                       # Plantilla de variables de entorno
├── .gitignore
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── DISCLAIMER.md
├── LICENSE
├── SECURITY.md
├── SUPPORT.md
└── package.json
```

---

## Fuente de datos

Este proyecto consume la **API oficial de datos abiertos del BOE**:

- Sumario por fecha: `https://www.boe.es/datosabiertos/api/boe/sumario/YYYYMMDD`
- Documentación oficial: [boe.es/datosabiertos](https://www.boe.es/datosabiertos/)
- Licencia de datos: reutilización libre con atribución (equivalente a CC BY 4.0)

> ⚠️ Este servicio **no es oficial** ni está afiliado al BOE ni a ningún organismo público.

---

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md) para conocer el proceso de contribución y el estilo de código.

---

## Seguridad

Si encuentras una vulnerabilidad, consulta [SECURITY.md](SECURITY.md) para el proceso de reporte responsable.  
**No abras issues públicos para vulnerabilidades de seguridad.**

---

## Licencia

Distribuido bajo licencia [MIT](LICENSE).  
Los datos del BOE son de titularidad pública — © Agencia Estatal Boletín Oficial del Estado.
