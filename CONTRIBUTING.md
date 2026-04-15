# Guía de Contribución

¡Gracias por tu interés en contribuir a **BOE Ayudas**! 🙏

## Cómo reportar un bug

1. Comprueba que el bug no esté ya reportado en [Issues](../../issues).
2. Abre un nuevo issue con la plantilla **Bug Report**, incluyendo:
   - Pasos para reproducirlo.
   - Comportamiento esperado vs. obtenido.
   - Versión de Node.js y sistema operativo.
   - Capturas de pantalla o logs si aplica.

## Cómo proponer una mejora

1. Abre un issue con la plantilla **Feature Request** antes de programar nada.
2. Describe el problema que resuelve y el comportamiento deseado.
3. Espera feedback antes de abrir un Pull Request.

## Flujo de trabajo

```bash
# 1. Haz fork del repositorio y clónalo
git clone https://github.com/tu-usuario/API_BOE.git
cd API_BOE

# 2. Crea una rama descriptiva
git checkout -b feat/nombre-de-la-mejora
# o
git checkout -b fix/descripcion-del-bug

# 3. Instala dependencias
npm install

# 4. Haz tus cambios y prueba
npm run dev

# 5. Commit siguiendo Conventional Commits
git commit -m "feat: añadir filtro por comunidad autónoma"

# 6. Push y abre un Pull Request
git push origin feat/nombre-de-la-mejora
```

## Convención de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/es/):

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `docs:` | Cambios en documentación |
| `style:` | Formato, espacios (sin lógica) |
| `refactor:` | Refactorización sin cambio funcional |
| `test:` | Tests |
| `chore:` | Tareas de mantenimiento |

## Estilo de código

- **Node.js / JavaScript** estándar (sin transpilación).
- Indentación: **2 espacios**.
- Punto y coma: **sí**.
- Comillas simples para strings.
- Nombres de variables y funciones en **camelCase**.
- Nombres de archivos en **kebab-case** o **camelCase** según convención del directorio.

## Proceso de revisión

- Todo PR requiere al menos una aprobación antes de mergearse.
- Los PRs deben pasar las comprobaciones automáticas de CI si están configuradas.
- Mantén los PRs pequeños y enfocados en un único cambio.

## Código de conducta

Este proyecto se rige por el [Código de Conducta](CODE_OF_CONDUCT.md).
Al participar, aceptas sus términos.
