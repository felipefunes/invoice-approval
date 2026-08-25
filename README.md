# Recepción de Facturas — Prototipo (Ley 19.983)

Prototipo de interfaz para la recepción y el acuse de recibo/reclamo de facturas
electrónicas ante el SII, bajo la Ley N° 19.983. El código está en inglés (nombres de
variables, funciones y comentarios); toda la interfaz visible para las personas usuarias
está en español, como corresponde a la audiencia real del sistema.

Ver [`NOTAS.md`](./NOTAS.md) para la evaluación tributaria y de usabilidad que dio origen
al diseño.

## Desarrollo local

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm install
npm run build   # genera ./dist
npm run preview # sirve ./dist localmente para verificar el build
```

## Corrección técnica relevante en esta versión

El estado "aceptado tácitamente" ahora se **deriva** en cada render a partir de la fecha
de recepción en el SII (`effectiveSiiStatus` en `src/App.jsx`), en vez de depender de un
campo que alguien tenga que actualizar manualmente. Antes, una factura podía seguir
mostrando botones de "Confirmar" o "Reclamar" activos aun cuando el plazo fatal de 8 días
corridos ya hubiera vencido. Como la ley no admite prórroga, dejar esos botones activos
habría permitido una acción sin validez legal. Esto es sólo un prototipo de interfaz — la
implementación real debe validar el plazo también en el backend, no únicamente en el
cliente.

## Despliegue en Render.com (plan free)

Este repo incluye `render.yaml` (Render "Blueprint") para desplegarlo como **Static
Site** en el plan gratuito — no necesita un servidor Node corriendo, solo sirve los
archivos que genera `npm run build`.

1. Sube este repo a GitHub (o GitLab).
2. En el dashboard de Render: **New > Blueprint**, selecciona el repo. Render detecta
   `render.yaml` automáticamente y propone el servicio `invoice-approval` en plan Free.
3. Confirma la creación. El primer deploy corre `npm install && npm run build` y publica
   `./dist`.
4. Cada push a la rama configurada (por defecto la rama por defecto del repo) dispara un
   nuevo deploy automático.

Alternativa sin Blueprint: **New > Static Site**, apunta al repo, y configura a mano:
- **Build command**: `npm install && npm run build`
- **Publish directory**: `dist`

No se requieren variables de entorno ni base de datos — todos los datos de prueba viven
en el código (`src/App.jsx`), como corresponde a un prototipo sin integración real al SII.

## Pendiente fuera de alcance de este prototipo

Ver la sección 4 de [`NOTAS.md`](./NOTAS.md): integración real con el SII, autenticación
y permisos por usuario, y ajuste fino de responsive para mobile/tablet.
