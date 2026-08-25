# Notas de diseño — Prototipo de aprobación de facturas (Chile)

Estas notas resumen la evaluación crítica que dio origen a las decisiones de diseño del
prototipo `AprobacionFacturas.jsx`. No son asesoría legal: para el diseño final de los
flujos de reclamo ante el SII conviene que las revise un abogado o contador que conozca
el caso específico de la empresa.

## 1. Evaluación como experto tributario/financiero

**El plazo de 8 días corre desde la recepción en el SII, no desde la emisión.**
La Ley N° 19.983 cuenta el plazo de 8 días corridos desde que el documento se recibe en
las plataformas del SII, fecha que puede ser distinta (y posterior) a la fecha de
emisión. Un mockup que calcula el vencimiento desde la emisión puede mostrar una fecha
límite incorrecta en un plazo que la ley trata como fatal.

**"Confirmar" y "Rechazar" no son acciones simétricas.**
Confirmar el acuse de recibo (de forma expresa, o por el simple transcurso del plazo)
le otorga mérito ejecutivo a la factura: el proveedor puede cobrarla judicialmente o
cederla a un factoring sin que la empresa pueda oponerse después. Es una acción
irreversible y de alto impacto legal/financiero, no un trámite administrativo más.

**El rechazo no es texto libre — son categorías legales tasadas.**
El reclamo formal ante el SII se registra por motivos específicos: contenido de la
factura, falta total de entrega, o falta parcial de entrega de mercaderías o servicios.
Un campo de "comentarios internos" no reemplaza esa clasificación si el botón va a
representar la acción real ante el SII.

**Rechazar no anula el documento tributario.**
El emisor sigue obligado a declarar el IVA de esa factura. La corrección real requiere
que el proveedor emita una Nota de Crédito o Débito. La interfaz debe dejar claro que
el reclamo es una notificación formal, no una anulación automática.

**Riesgo principal: separación de funciones.**
La acción legal (acuse de recibo / reclamo) no debería quedar al alcance de cualquier
persona que simplemente confirma si algo llegó físicamente. Si esa misma persona puede
gatillar el acuse de recibo definitivo, un error, apuro, o una factura duplicada/fraudulenta
puede dejar a la empresa legalmente obligada a pagar sin que nadie con visión financiera
haya revisado el caso.

**Alertar solo en las últimas 48 horas llega tarde.**
Si la decisión pasa por varias personas (quien confirma la recepción física → finanzas →
clasificación contable), las alertas deben escalar desde el día 3 o 4, no solo al final,
porque el plazo no admite prórroga.

## 2. Evaluación como experto en UI/usabilidad

- **Badges parpadeantes**: problema de accesibilidad (sensibilidad a movimiento/fotosensibilidad),
  no solo de estilo. Se reemplazan por color + ícono + texto, sin parpadeo.
- **Color como único indicador** excluye a usuarios daltónicos. Cada estado combina
  color, ícono y texto.
- **Dos criterios de orden compitiendo** (urgencia vs. monto) diluyen la prioridad. Se
  fijó la urgencia (días restantes reales) como orden por defecto, y el monto queda como
  columna informativa.
- **Campo de texto libre para el responsable** es frágil para alguien con poca
  capacitación (un typo rompe la notificación). Se reemplazó por un selector de opciones
  predefinidas.
- **Mezclar clasificación contable con la acción legal** en el mismo paso puede hacer que
  la decisión tributaria espere a que contabilidad termine de clasificar el gasto — y el
  plazo de 8 días no espera. Se desacoplaron ambos pasos.
- **Tabla densa** (RUT, razón social, folio, dos fechas, estado, acciones) exige demasiada
  lectura de alguien que solo necesita responder si algo llegó bien o no.

## 3. Decisiones tomadas en el prototipo

En vez de una sola pantalla que intenta servir a cualquier perfil de usuario a la vez, se
separó el flujo en dos vistas con un selector de rol arriba (para poder testear ambos
perfiles en la misma sesión):

- **Equipo**: cualquier persona del equipo, sin importar su rol o nivel de capacitación,
  ve una lista simple de tarjetas, sin jerga legal ni fechas del SII. Responde una sola
  pregunta: "¿llegó conforme?" (Sí / No + comentario). Esta respuesta nunca toca el SII
  — solo informa a Finanzas.
- **Finanzas**: ve la cola completa ordenada por urgencia real (contada desde la
  recepción en el SII), la respuesta del equipo, categorías de reclamo tasadas por ley,
  y las dos acciones legales claramente separadas de la clasificación contable, con un
  modal de confirmación que explica en una frase la consecuencia real de cada acción
  antes de ejecutarla.

Los datos de prueba incluyen casos límite a propósito: una factura que vence hoy, una ya
aceptada tácitamente (para mostrar qué pasa si nadie actúa a tiempo) y una ya reclamada —
útiles para poner frente a las personas durante el test de usabilidad.

## 4. Pendiente / fuera de alcance de este prototipo

- **Responsive completo**: el archivo tiene algunos puntos de quiebre básicos (el panel
  de detalle se adapta a pantallas angostas), pero el ajuste fino para mobile/tablet
  queda pendiente — se planea completar con Claude Code.
- Integración real con el SII, autenticación y permisos por usuario: el prototipo es
  100% de prueba, con datos falsos y sin conexión a ningún sistema real.
