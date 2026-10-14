---
name: juacil-ui
description: Crear o rediseñar pantallas y componentes de JUÁCIL, el prototipo frontend de marketplace para MYPES de la Selva Central del Perú, conservando sus flujos demo, identidad visual y CSS Modules. Usar en catálogo, tiendas, formularios, carrito, checkout y paneles.
---

# Diseño frontend de JUÁCIL

## Producto y alcance

JUÁCIL — «Tu tienda online» conecta compradores con MYPES de la Selva Central del Perú: Chanchamayo, Oxapampa, Satipo y Villa Rica. Los ejemplos representativos son café, cacao, miel, artesanías y frutas deshidratadas. Diseñar para compradores y emprendedores con distintos niveles de experiencia digital, en móvil y escritorio; el administrador gestiona la plataforma demo.

Es un prototipo funcional frontend. Los recorridos deben demostrarse con datos simulados y persistencia local. No incorporar backend, pagos reales, autenticación externa, logística ni envío automático de mensajes como requisito de un rediseño. Explicar las simulaciones donde puedan confundirse con operaciones reales, sin llenar las pantallas de avisos técnicos.

Mantener el dominio de marketplace regional. No importar zonas, tarifas, repartidores, estados ni marcas de otros proyectos. Tampoco excluir categorías existentes solo por preferencias visuales.

## Inspeccionar antes de cambiar

- Leer el TSX y CSS Module de la vista, sus componentes compartidos, rutas y proveedores relevantes.
- Revisar `package.json` para la pila vigente: React, TypeScript, Vite, React Router, React Hook Form, Zod y Lucide. Usar CSS Modules y contextos React; no asumir Tailwind ni Zustand.
- Consultar `docs/requisitos.md` y `docs/decisiones.md` para intención de producto. Comprobar el comportamiento implementado en tipos, router y repositorio actuales. La documentación original tiene rutas de tokens y roles desactualizados: los tokens están en `src/app/styles/tokens.css` y existe el rol `admin`. No eliminar funcionalidades por esas diferencias; señalarlas si afectan la tarea.
- Distinguir requisitos, capacidades observadas y propuestas. No implementar módulos ausentes solo porque se mencionan en documentos.


## Fuentes de producto y dirección visual

Guiarse por los documentos del proyecto antes de proponer cambios:

- `docs/extracted_text.txt`: texto extraído del informe de avance; propósito, usuarios y cuestionario. No sustituye la inspección de las imágenes del DOCX cuando se trabaje sobre logo o composición de referencia.
- `docs/JUACIL-TU TIENDA ONLINE - avance.docx`: informe original y referencias visuales.
- `docs/JUACIL-prompt-maestro.md`, sección «Dirección visual»: preservar logo y eslogan, modernizar la referencia, mantener onboarding de tres pasos y evitar tarjetas decorativas o ilustraciones dominantes. No usar el escudo académico como marca comercial; si falta el logo, identificar el placeholder.
- `docs/requisitos.md`: distinguir requisitos del texto (R), de las imágenes (I) y propuestas (P).
- `docs/decisiones.md`: decisiones de arquitectura y diseño, contrastadas con implementación vigente.
- `docs/calidad.md`: criterios de interacción, recorridos y evidencia; no presentar pruebas piloto pendientes como resultados obtenidos.

La documentación guía el propósito y las propuestas; el código demuestra qué está implementado. Si se contradicen en roles, rutas o funciones, explicar la diferencia y conservar el alcance autorizado, sin eliminar lo existente ni ampliar el prototipo automáticamente.

## Identidad y sistema visual

Conservar JUÁCIL y la identidad de selva: verde bosque, acento lima, superficies claras y tonos tierra. Comunicarla con productos, fotografías y procedencia; evitar decoración tropical repetitiva que desplace el contenido.

Los valores vigentes están en `src/app/styles/tokens.css`; los estilos comunes en `src/app/styles/global.css`. Usar variables CSS en los `.module.css`:

| Función | Variables existentes |
| --- | --- |
| Marca | `--color-primary-*` según tonos definidos |
| Acento | `--color-accent-lime`, `--color-accent-lime-hover`, `--color-accent-lime-text` |
| Superficies | `--color-bg-app`, `--color-surface`, `--color-surface-subtle`, `--color-surface-muted` |
| Texto | `--color-text-main`, `--color-text-muted`, `--color-text-subtle`, `--color-text-inverse` |
| Estados | `--color-success`, `--color-warning`, `--color-danger`, `--color-info` y variantes `-bg`, `-text` |
| Ritmo | `--space-*`, `--radius-*`, `--shadow-*`, `--text-*`, `--transition-*` |
| Tipografía | `--font-sans` (Inter), `--font-display` (Outfit) |

Reutilizar `src/shared/ui` antes de crear variantes locales de Button, Input, Select, Textarea, Card, Badge, Alert o Modal. Usar Lucide con trazos consistentes para acciones.

Si falta un token necesario y reutilizable, incorporarlo al sistema central dentro del alcance autorizado. No introducir una paleta paralela por pantalla. Un token existente no garantiza accesibilidad: comprobar el contraste real, especialmente texto sutil, bordes, foco y lima. Usar texto oscuro sobre lima; no afirmar ratios sin medirlos.


## Diseño propio: evitar apariencia de plantilla generada por IA

Aplicar estos criterios al crear o rediseñar una vista, salvo una dirección visual explícita del usuario. Recuperan las reglas visuales de la skill original adaptadas a JUÁCIL. Son criterios de calidad, no una prueba de quién creó una interfaz.

1. **Contenido del proyecto:** usar productos, negocios, presentaciones y procedencias coherentes con las MYPES de la Selva. Evitar ejemplos de otro marketplace elegidos solo para llenar espacios. Los fixtures ficticios son válidos si tienen relaciones y contenido creíbles.
2. **Texto concreto:** evitar frases de relleno como «Descubre una experiencia única» o «Lleva tu negocio al siguiente nivel» sin información útil. Preferir «Café de Villa Rica» o «Publica tu primer producto». Si se conserva «Experiencia Única» de la referencia del informe, acompañarlo de una explicación o acción concreta.
3. **Mayúsculas y badges:** escribir títulos y etiquetas con capitalización natural. Evitar rótulos como «DESTACADO», «PREMIUM» o «EXCLUSIVO» repetidos como decoración. Usar distintivos cuando comuniquen stock, estado o una condición sustentada por los datos.
4. **Composición por contenido:** no repetir automáticamente hero gigante, tres tarjetas de beneficios y cuatro métricas en todas las vistas. Elegir estructura según la tarea; el catálogo debe dar espacio a productos y el panel a lo que requiere atención.
5. **Contenedores con propósito:** no convertir cada frase, icono o bloque en una tarjeta redondeada. Agrupar con espacio, alineación y divisores cuando baste; evitar tarjetas dentro de tarjetas sin necesidad.
6. **Decoración medida:** evitar degradados excesivos, glassmorphism, brillos, blobs, hojas y sombras grandes que compitan con productos o ralenticen la interfaz. Una ilustración pertinente puede aportar identidad, pero no debe dominar la tarea.
7. **Jerarquía deliberada:** destacar precio, disponibilidad y CTA; no dar igual peso a todos los textos ni teñir de lima todas las acciones. Reservar el acento para lo importante y los colores semánticos para estados.
8. **Iconos coherentes:** no usar emojis como iconos de navegación o acciones. Reutilizar Lucide; evitar añadir un icono a cada línea solo para ocupar espacio.
9. **Ritmo y tipografía:** usar los tokens de espaciado, radios, sombras y fuentes existentes. Evitar tamaños casi iguales, pesos extremos y diferencias arbitrarias entre componentes equivalentes. No aplicar esquinas enormes a todos los elementos.
10. **Layout adaptable:** no forzar columnas rígidas, un carrito permanente junto al hero o grandes espacios vacíos en móvil. Mantener alineaciones y proporciones de imagen coherentes; comprobar nombres largos y cantidades variables.
11. **Estados que responden a datos:** no simular progreso con fechas congeladas, ventas inventadas, reseñas sin fuente o alertas siempre activas. Una compra o guardado debe dar feedback; el prototipo debe reaccionar a las acciones.
12. **Claridad antes que efecto visual:** no ocultar costos conocidos, negocio, stock o siguiente paso para lograr una composición limpia. Evitar texto gris demasiado claro, bordes de campos invisibles y blanco sobre lima. Verificar el contraste real.

### Comprobación antes de cerrar el diseño

- ¿La pantalla comunica JUÁCIL mediante productos, procedencia, marca y lenguaje propios?
- ¿El contenido principal aparece antes que la decoración, especialmente en móvil?
- ¿Cada tarjeta, badge, icono y métrica ayuda a una decisión o tarea?
- ¿Los textos dicen algo concreto y los datos demo permanecen coherentes?
- ¿Precios, stock, acciones y estados se identifican con rapidez?
- ¿El espaciado, las imágenes y los componentes mantienen un tratamiento consistente?
- ¿Agregar, guardar, filtrar y confirmar producen una respuesta verificable?
- ¿Se conservaron identidad y onboarding de tres pasos cuando corresponden a la vista?

## Composición según la tarea

- **Inicio:** comunicar qué se compra y de quién; destacar búsqueda o entrada al catálogo. Separar la invitación a registrar un negocio de la tarea de compra.
- **Catálogo y tiendas:** búsqueda, filtros y procedencia de la MYPE claros. Conservar filtros en la URL cuando la vista ya lo hace. Mostrar filtros activos y cómo retirarlos.
- **Producto:** foto consistente con alternativa si falla, nombre legible, precio, disponibilidad, cantidad y acción de compra. Mostrar presentación o unidad cuando exista en los datos. Confirmar visualmente al agregar, sin depender solo del color.
- **Carrito y checkout:** negocio actual, cantidades, subtotales y total claros; edición y retorno sencillos. Mostrar costos conocidos antes de confirmar; si falta una tarifa, indicar coordinación sin inventarla. Mantener entrega o recojo conforme al modelo.
- **Cliente:** priorizar pedidos, estado y perfil. Al confirmar, mostrar código y siguiente paso de coordinación.
- **Emprendedor:** priorizar pedidos por atender, productos y stock. Métricas con origen y periodo comprensibles; no inventar ventas, reseñas ni alertas como datos operativos. Formularios con ayuda breve y guardar/cancelar claros.
- **Administrador:** conservar navegación y permisos separados. Facilitar identificar, filtrar y gestionar usuarios y tiendas sin mezclar acciones de compra.

Ajustar densidad a la tarea: catálogo con imágenes y espacio; paneles con listas o tablas legibles. Favorecer una acción dominante por sección o tarea, sin prohibir varios botones de compra en una cuadrícula.

## Invariantes funcionales

Comprobar la implementación antes de alterar un flujo:

- Dinero entero en céntimos. Mostrar importes con `formatMoney` de `src/shared/lib/money.ts`; para inputs reutilizar `centsToDecimal` y `decimalToCents`. Las conversiones internas del helper no son incumplimientos de formato. Usar `font-variant-numeric: tabular-nums` donde ayuda a comparar.
- Carrito de un negocio por pedido: conservar confirmación de reemplazo en `src/features/cart/ReplaceCartModal.tsx` y estado en `src/app/providers/CartProvider.tsx`. Nunca vaciarlo silenciosamente.
- Pedidos: verificar `src/entities/order/model/types.ts`, `orderStateMachine.ts` y `src/shared/lib/storage.ts`. Estados actuales: `pendiente`, `confirmado`, `preparado`, `entregado`, `cancelado`; códigos con prefijo `JUA-`. No añadir etapas de reparto por motivos visuales.
- Mantener snapshots de precios, validación de stock, prevención de duplicados y reposición al cancelar conforme a la lógica existente. No sustituir cálculos por cifras fijas para mejorar una captura.
- Roles `cliente`, `merchant`, `admin`: comprobar SessionProvider, ProtectedRoute y AppRouter. Conservar restricciones de propiedad de productos y pedidos; el aislamiento demo no equivale a seguridad de backend.
- Persistencia mediante LocalStoreRepository y proveedores de sesión/carrito. No cambiar claves, borrar datos demo o introducir migraciones por una mejora visual incidental.
- Conservar reglas de ConnectivityProvider al simular offline. No prometer PWA ni sincronización real si no están implementados.
- Reutilizar `src/shared/lib/whatsapp.ts`: un enlace preparado no significa que se haya enviado un mensaje. No activar contactos externos para validar una pantalla.

## Accesibilidad y estados

Diseñar primero para móvil y ampliar a escritorio. Verificar anchuras representativas de 360–390 px, tableta y escritorio; textos largos, precios, productos sin foto y listas vacías. Evitar desbordamiento de página; una tabla puede tener desplazamiento interno si conserva contexto y acceso a acciones.

Objetivos táctiles de al menos 44×44 px, foco visible, etiquetas persistentes y nombres accesibles en botones de icono. Evitar contenido cubierto por MobileBottomNav, drawer o acciones fijas; contemplar áreas seguras. Modales con gestión de foco, cierre y retorno al control inicial. Mantener teclado y respetar movimiento reducido.

Contraste mínimo: 4.5:1 para texto normal, 3:1 para texto grande y elementos informativos de interfaz. No usar solo color para estados. Inputs legibles en móvil, errores junto al campo asociados mediante atributos accesibles y mensajes claros en español que conserven lo ingresado.

Cubrir estados pertinentes: vacío con siguiente acción, error recuperable, éxito visible y carga cuando exista espera real o simulada. No agregar demoras para exhibir skeletons. Toda acción visible debe funcionar, ofrecer simulación comprensible o explicar su indisponibilidad.

## Terminar una intervención

Revisar el recorrido afectado: navegación, feedback, persistencia y rol pertinente. Para cambios de código ejecutar comprobaciones disponibles acordes al alcance en `package.json`; añadir pruebas cuando cambien reglas de carrito, stock, permisos o pedidos, sin exigir nuevas pruebas para simples estilos.

Después de un rediseño aplicar [juacil-ux-review](../juacil-ux-review/SKILL.md) sobre la vista intervenida. No exige delegación ni auditoría global. Informar qué cambió, qué se verificó y qué no pudo comprobarse visualmente.


