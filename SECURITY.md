# Política de Seguridad

## Versiones soportadas

| Versión | Soporte de seguridad |
|---------|----------------------|
| 1.x     | ✅ Activo             |
| < 1.0   | ❌ Sin soporte        |

## Cómo reportar una vulnerabilidad

**Por favor, NO abras un issue público para reportar vulnerabilidades de seguridad.**

Si encuentras una vulnerabilidad, escríbenos de forma privada a:

📧 **[seguridad@tudominio.es](mailto:seguridad@tudominio.es)**

### Incluye en tu reporte

- Descripción clara del problema y su impacto potencial.
- Pasos para reproducirlo (si aplica).
- Versiones afectadas.
- Posible solución o mitigación si la conoces.

### Qué puedes esperar

- **Acuse de recibo** en un plazo de 48 horas laborables.
- **Evaluación inicial** en un plazo de 7 días.
- **Comunicación del plan de acción** si la vulnerabilidad es confirmada.
- **Crédito público** en el CHANGELOG y en el commit de fix (si lo deseas).

## Consideraciones específicas de este proyecto

- Este servicio actúa como **proxy de solo lectura** de la API pública del BOE; no gestiona autenticación de usuarios ni almacena datos sensibles.
- No existen paneles de administración protegidos por contraseña en la versión actual.
- Las dependencias críticas son `express`, `axios` y `xml2js`. Revisa sus advisories en [npm advisories](https://www.npmjs.com/advisories).

## Recomendaciones para despliegue en producción

- Usa siempre HTTPS.
- Configura cabeceras de seguridad HTTP (Helmet.js o equivalente).
- Aplica rate limiting en los endpoints de la API.
- Mantén las dependencias actualizadas (`npm audit` periódicamente).
- No expongas el stack trace en los mensajes de error en producción.
