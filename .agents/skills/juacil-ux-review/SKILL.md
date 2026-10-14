---
name: juacil-ux-review
description: Revisar jerarquía visual, claridad y usabilidad de pantallas de JUÁCIL con hallazgos verificables y correcciones concretas. Usar cuando una vista resulte confusa, se pida una revisión UI/UX o se termine un rediseño del prototipo frontend.
---

# Revisión de UX de JUÁCIL

Evaluar si compradores, emprendedores y administradores completan su tarea con claridad. Una revisión solicitada entrega diagnóstico; si el usuario también pidió aplicar mejoras, realizar las correcciones autorizadas. No ampliar una revisión de pantalla a todo el proyecto.

## Contexto y evidencia

Consultar [juacil-ui](../juacil-ui/SKILL.md) para producto, sistema visual e invariantes; leer solo archivos relevantes. Tokens en `src/app/styles/tokens.css`, UI reutilizable en `src/shared/ui`, dinero en `src/shared/lib/money.ts`. Proponer CSS Modules y componentes existentes, sin asumir Tailwind.

Identificar rol, pantalla y tarea principal. Inspeccionar capturas con una herramienta de imágenes cuando existan, distinguiendo móvil y escritorio. Si hay navegador de prueba, comprobar interacciones sin contactos ni pagos externos. Si solo se leyó código, declarar la limitación: no puntuar apariencia renderizada, afirmar contraste medido ni inventar comportamiento observado.

Cruzar hallazgos con TSX y CSS. Citar archivo y línea comprobados; para capturas sin correspondencia conocida, citar zona visual. Separar hechos de hipótesis y capacidades pendientes de errores. Los datos demo son válidos; el problema es presentarlos como operaciones reales o perder coherencia.

## Criterios

- **Jerarquía:** ¿se entiende qué hacer en pocos segundos? Comparar peso de títulos, precios, contenido y acciones. Detectar competencia dentro de la misma tarea sin imponer un único botón por pantalla.
- **Agrupación:** proximidad, similitud y región común para explicar problemas concretos. Etiquetas cerca de sus campos, acciones junto al contenido afectado y alineación consistente. Evitar contenedores anidados sin función.
- **Carga de decisión:** evaluar filtros, navegación y formularios según su uso. Agrupar y mostrar opciones progresivamente cuando ayude; Hick y Miller no son límites numéricos obligatorios.
- **Lenguaje y reconocimiento:** productos, negocios, precios en soles y estados en español comprensibles. Comprador reconoce MYPE y procedencia; emprendedor identifica pedidos y stock sin jerga técnica.
- **Control y feedback:** agregar, guardar, cancelar, volver y cerrar. Revisar pérdida de datos, reemplazo de carrito, confirmaciones, vacíos y recuperación. Botones inertes siguen siendo un problema aunque la vista esté pulida.
- **Acceso táctil y teclado:** tamaño y separación de acciones, foco, labels, tabulación, modal y contenido tapado por barras. Aplicar Fitts al contexto observado sin asumir repartidores ni guantes.
- **Legibilidad:** contraste sobre fondo real, tipografía, textos, imágenes y precios comparables. Un nombre de token o comentario CSS no demuestra ratios. No truncar información decisiva sin forma de consultarla.
- **Responsive:** catálogo útil en móvil, panel legible en escritorio y acciones accesibles en ambos. Tablas con desplazamiento interno pueden ser apropiadas; revisar desbordamiento de página y pérdida de contexto.
- **Coherencia funcional:** totales, stock, pedidos, rol y negocio coinciden con flujo actual. No exigir tarifas, reseñas, reparto o integraciones inexistentes como requisitos de diseño.


## Detectar apariencia genérica o de plantilla

Revisar la sección «Diseño propio: evitar apariencia de plantilla generada por IA» de juacil-ui. No atribuir autoría a una pantalla por su estilo; reportar problemas observables y su efecto:

- Textos intercambiables entre productos, procedencia ausente o ejemplos ajenos a las MYPES.
- Hero desproporcionado, secuencias repetidas de tarjetas y métricas sin relación con la tarea.
- Contenedores anidados, badges arbitrarios en mayúsculas, emojis como acciones o iconos decorativos repetidos.
- Degradados, transparencias, ilustraciones o sombras que compiten con productos y dificultan lectura.
- Énfasis uniforme, tamaños o radios inconsistentes y espacio vacío sin función.
- Datos congelados, falsas promesas operativas o acciones sin feedback.
- Pérdida de logo, eslogan, identidad verde o onboarding relevante descritos en los documentos de `docs`.

Proponer la corrección más pequeña: reemplazar texto de relleno por información concreta, retirar decoración, reorganizar contenido o reutilizar componentes. No convertir preferencias estéticas en prohibiciones universales ni eliminar datos demo válidos.

Consultar `docs/JUACIL-prompt-maestro.md` para dirección visual, `docs/requisitos.md` para alcance y `docs/calidad.md` para evidencia. Para referencia de marca o imagen, consultar el DOCX; el texto extraído no demuestra su apariencia. Comprobar 360, 390, 768 y 1440 px, reflow a 320 px y zoom al 200% cuando se disponga de herramientas, indicando cuáles se probaron.

## Calibración por recorrido

| Recorrido | Pregunta decisiva |
| --- | --- |
| Inicio → catálogo → producto | ¿Encuentra un producto y entiende presentación, origen, precio y disponibilidad? |
| Carrito → checkout → confirmación | ¿Reconoce el negocio, corrige cantidades y entiende qué sigue después de confirmar la simulación? |
| Pedidos y perfil | ¿Identifica estado y acción siguiente sin confundir usuarios o pedidos? |
| Panel del emprendedor | ¿Ve qué requiere atención y administra sus productos y pedidos? |
| Administración | ¿Identifica usuario o tienda y comprende el efecto de cada acción? |

## Informe

En español: veredicto breve con alcance y evidencia. Hasta 12 hallazgos priorizados, agrupando repeticiones:

- **Crítico:** impide completar tarea, pierde datos, induce operación equivocada o bloquea acceso.
- **Importante:** dificulta comprensión, navegación o coherencia de forma apreciable.
- **Menor:** pulido sin impacto material en el recorrido.

Por hallazgo: `archivo:línea o zona — evidencia — impacto — corrección concreta`. Nombrar principios solo cuando expliquen el problema. Omitir grupos vacíos, mencionar lo que funciona y cerrar con hasta tres correcciones de mayor impacto. Evitar puntuaciones arbitrarias y listas de leyes sin evidencia.

Al aplicar mejoras, comprobar de nuevo el recorrido y comunicar límites de validación. Una revisión posterior al rediseño puede ser breve y realizada por el mismo agente; no exige subagentes.


