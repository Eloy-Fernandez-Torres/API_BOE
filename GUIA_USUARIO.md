# Guía de Usuario - BOE Finder

## ¿Qué es BOE Finder?

BOE Finder es una aplicación para buscar ayudas, subvenciones y convocatorias publicadas en el BOE de forma rápida, con filtros por tipo, sector y rango de días.

## Acceso a la aplicación

1. Abre la app en tu navegador:
   - `http://localhost:3000` (si está en local)
2. Verás la pantalla principal con:
   - Selector de versión (`Estándar`, `Pro`, `Creador`)
   - Campo de palabra clave
   - Selector de rango de días
   - Botón `BUSCAR`

## Cómo hacer una búsqueda

1. Selecciona tu versión en el desplegable de la izquierda.
2. Escribe una palabra clave (por ejemplo: `agricultura`, `innovación`, `becas`).
3. Elige el rango temporal (3, 7, 14 o 30 días según versión).
4. Pulsa `BUSCAR`.

La aplicación mostrará:

- Número total de resultados.
- Tarjetas con título, descripción, organismo, tipo, sección y fecha.
- Enlace `Ver en el BOE` para abrir la publicación oficial.

## Uso de filtros

En el panel izquierdo puedes refinar resultados:

- `Sector`
- `Tipo de ayuda`

Después de seleccionar un filtro, la lista se actualiza automáticamente.

Para volver al estado inicial de filtros:

- Pulsa `LIMPIAR FILTROS`.

## Paginación

- Se muestran `8` resultados por página.
- Usa `Anterior`, `Siguiente` o número de página para navegar.

## Versiones y límites

### 1) Versión Estándar

- Hasta `7` días de búsqueda.
- Permite búsqueda por palabra clave.
- Filtro por sector desactivado.
- Filtro por tipo activado.

### 2) Versión Pro

- Hasta `14` días.
- Búsqueda por palabra clave activada.
- Filtro por sector activado.
- Filtro por tipo activado.

### 3) Versión Creador

- Hasta `30` días.
- Todas las capacidades de búsqueda y filtrado activadas.

## Consejos para mejores resultados

- Usa términos específicos (`eficiencia energética`, `I+D`, `pymes`).
- Si hay demasiados resultados, combina palabra clave + tipo + sector.
- Si no aparece nada, amplía el rango de días.
- Revisa el enlace al BOE para el detalle oficial completo.

## Mensajes que puedes ver

- `Buscando ayudas...`: la consulta está en progreso.
- `No se encontraron ayudas...`: no hay resultados con los criterios aplicados.
- Mensaje de error: normalmente indica que el backend no está levantado o no responde.

## Solución de problemas rápida

### No carga la app

- Verifica que el servidor esté corriendo con `npm run dev` o `npm start`.
- Comprueba que estés entrando a `http://localhost:3000`.

### No aparecen resultados

- Prueba sin palabra clave.
- Aumenta el rango de días.
- Cambia de versión para habilitar más filtros/rango.

### Error de conexión API

- Confirma que el backend está activo.
- Si usas frontend servido por otro puerto, asegúrate de que apunte al backend correcto.

## Preguntas frecuentes

### ¿La app modifica datos del BOE?

No. Solo consulta datos abiertos públicos.

### ¿Necesito API key?

No. La API de datos abiertos del BOE es de acceso libre.

### ¿Los datos son oficiales?

Sí. La fuente es `boe.es` y cada resultado enlaza a su publicación oficial.

