# Soporte

## Antes de pedir ayuda

1. Consulta el [README](README.md) para ver si tu pregunta ya está respondida.
2. Revisa los [issues abiertos y cerrados](../../issues) — puede que alguien haya tenido el mismo problema.
3. Comprueba que tienes la versión de Node.js recomendada (`node -v`, se requiere Node ≥ 18).

## Canales de soporte

| Canal | Cuándo usarlo |
|-------|---------------|
| [Issues de GitHub](../../issues) | Bugs o mejoras concretas del proyecto |
| [Discussions](../../discussions) | Preguntas generales, ideas, dudas de uso |
| [seguridad@tudominio.es](mailto:seguridad@tudominio.es) | Vulnerabilidades de seguridad (no usar issues públicos) |
| [contacto@tudominio.es](mailto:contacto@tudominio.es) | Cualquier otro asunto |

## Problemas habituales

### La búsqueda no devuelve resultados
- Verifica que la API del BOE esté accesible: [boe.es/datosabiertos](https://www.boe.es/datosabiertos/).
- Prueba a ampliar el parámetro `dias` (por defecto 7).
- Comprueba los logs del servidor para ver si hay errores de red o timeout.

### El servidor no arranca
- Asegúrate de haber copiado `.env.example` a `.env`.
- Verifica que el puerto configurado no esté en uso: `lsof -i :3000`.

### La caché devuelve datos antiguos
- La caché es volátil (en memoria). Reinicia el servidor para limpiarla.
- Puedes ajustar el TTL de caché en `src/utils/cache.js`.

## Tiempos de respuesta estimados

Este es un proyecto open source mantenido de forma voluntaria.
Intentamos responder a issues y preguntas en un plazo de **3–5 días laborables**, sin garantía de SLA.
