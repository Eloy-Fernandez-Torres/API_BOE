# Documentación Técnica - API BOE Finder

## Descripción

`API_BOE` es una aplicación web full stack (Node.js + Express + frontend estático) para consultar convocatorias, ayudas y subvenciones publicadas en el BOE.

El backend consume la API oficial de datos abiertos del BOE, normaliza los resultados y expone endpoints propios para que el frontend pueda buscar, filtrar y paginar resultados.

## Objetivos del proyecto

- Consultar sumarios del BOE por rango de días.
- Detectar disposiciones relacionadas con ayudas/subvenciones.
- Exponer una API simple para búsqueda y detalle.
- Aplicar control de capacidades por rol (estándar, pro, creador).
- Ofrecer una interfaz web clara para usuarios no técnicos.

## Stack tecnológico

- Backend: `Node.js`, `Express`
- Cliente HTTP: `axios`
- Parseo XML: `xml2js`
- Configuración: `dotenv`
- Frontend: `HTML`, `CSS`, `JavaScript` (vanilla)
- Herramientas de desarrollo: `nodemon`

## Estructura del proyecto

```text
API_BOE/
├── public/
│   ├── index.html
│   ├── css/styles.css
│   └── js/main.js
├── src/
│   ├── app.js
│   ├── clients/boeClient.js
│   ├── config/
│   │   ├── boe.config.js
│   │   └── roles.config.js
│   ├── controllers/ayudas.controller.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── roleAccess.js
│   ├── routes/ayudas.routes.js
│   ├── services/ayudasService.js
│   └── utils/cache.js
├── .env.example
├── package.json
└── README.md
```

## Instalación y arranque

1. Instalar dependencias:

```bash
npm install
```

2. Crear archivo de entorno a partir del ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Iniciar en desarrollo:

```bash
npm run dev
```

4. Iniciar en producción/local simple:

```bash
npm start
```

La app queda disponible en `http://localhost:3000`.

## Variables de entorno

- `PORT`: puerto del servidor (por defecto `3000`).
- `BOE_API_TIMEOUT`: timeout de llamadas al BOE en ms (por defecto `8000`).

## Arquitectura y flujo

1. El frontend hace petición a `/api/ayudas/buscar`.
2. El middleware `resolveRole` resuelve el rol por query/header.
3. El controlador aplica límites del rol (`maxDays`, permisos).
4. El servicio consulta sumarios BOE día por día y extrae disposiciones.
5. Las disposiciones se normalizan, se filtran por palabras clave de ayudas y se eliminan duplicados.
6. El backend responde con datos + metadatos de límites aplicados.
7. El frontend renderiza tarjetas, filtros y paginación.

## Integración con BOE

Base URL configurada:

- `https://www.boe.es/datosabiertos/api`

Endpoint externo principal consumido:

- `/boe/sumario/YYYYMMDD`

El cliente acepta XML/JSON y, cuando recibe XML, lo transforma a objeto JavaScript con `xml2js`.

## Endpoints internos

Base: `/api/ayudas`

### GET `/buscar`

Busca ayudas en un rango de días.

Parámetros query:

- `q` (opcional): palabra clave.
- `dias` (opcional): días hacia atrás (se ajusta por rol).
- `role` (opcional): `estandar`, `pro`, `creador`.
- `sector` (opcional): sector (solo se considera si el rol lo permite).
- `tipo` (opcional): tipo de ayuda.

Header alternativo de rol:

- `x-user-role: estandar|pro|creador`

Respuesta:

- `success`
- `data` (lista de ayudas)
- `total` (antes de recorte por rol)
- `meta` (límites y ajustes aplicados)

### GET `/sumario`

Devuelve disposiciones normalizadas de un día.

Parámetros query:

- `fecha` (opcional): `YYYY-MM-DD`

Notas:

- Si se pasa `fecha`, solo `creador` está autorizado.
- Sin `fecha`, usa la fecha actual.

### GET `/debug`

Devuelve estructura cruda del sumario del BOE para diagnóstico.

Parámetros query:

- `fecha` (opcional): `YYYYMMDD`

Solo disponible para rol `creador`.

### GET `/:id`

Obtiene detalle de una disposición BOE por identificador (ej. `BOE-A-2026-1234`).

## Roles y capacidades

### Estándar

- Máximo `7` días.
- Búsqueda por keyword: sí.
- Filtro por sector: no.
- Filtro por tipo: sí.
- Debug: no.

### Pro

- Máximo `14` días.
- Búsqueda por keyword: sí.
- Filtro por sector: sí.
- Filtro por tipo: sí.
- Debug: no.

### Creador

- Máximo `30` días.
- Búsqueda por keyword: sí.
- Filtro por sector: sí.
- Filtro por tipo: sí.
- Debug: sí.

## Lógica de negocio clave

- Extracción recursiva de disposiciones para tolerar cambios estructurales del XML.
- Normalización de campos heterogéneos (`id`, `titulo`, `tipo`, `url`, etc.).
- Clasificación de "ayuda/subvención" por conjunto de palabras clave.
- Detección de importe (`monto`) desde texto usando regex.
- Eliminación de duplicados por identificador `id`.
- Caché en memoria para reducir llamadas repetidas al BOE.

## Estrategia de caché

Implementación en `src/utils/cache.js` con `Map` en memoria y TTL.

TTL usados:

- Búsqueda (`buscarAyudas`): `30` minutos.
- Sumario diario (`obtenerSumario`): `1` hora.
- Detalle por ID (`obtenerDetalle`): `1` hora por defecto.

## Manejo de errores

Middleware central `errorHandler`:

- Mapea `404` a mensaje "Recurso no encontrado".
- Errores `5xx` a "Error interno del servidor".
- Devuelve formato uniforme:
  - `success: false`
  - `error: <mensaje>`

## Frontend

UI implementada en:

- `public/index.html`
- `public/css/styles.css`
- `public/js/main.js`

Funcionalidades:

- Selector de rol visual.
- Selector de rango de días.
- Filtros por sector/tipo (con activación según rol).
- Paginación (8 resultados por página).
- Tooltips informativos.
- Estados de carga, error y sin resultados.

## Scripts disponibles

- `npm start`: ejecuta `node src/app.js`
- `npm run dev`: ejecuta `nodemon src/app.js`

## Mejoras sugeridas

- Añadir tests unitarios y de integración.
- Persistir caché externa (Redis) para entornos productivos.
- Añadir rate limit y observabilidad (logs estructurados).
- Internacionalizar textos de UI y API.
- Incluir documentación OpenAPI/Swagger.

