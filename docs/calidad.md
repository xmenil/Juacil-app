# JUÁCIL: Marco y Plan de Calidad de Software (SQuaRE ISO/IEC 25000 & UX)

**Proyecto:** JUÁCIL – "Tu tienda online"  
**Estándares de Referencia:**  
- **ISO/IEC 25010:2023**: Modelo de Calidad del Producto de Software (9 características).  
- **ISO/IEC 25019:2023**: Modelo de Calidad en Uso.  
- **ISO/IEC 25023:2016**: Medición de Calidad de Producto (guía de métricas).  
- **W3C WCAG 2.2 Nivel AA**: Pautas de Accesibilidad para el Contenido Web.  
- **10 Heurísticas de Usabilidad de Nielsen (NN/g)**.  
**Fecha de Evaluación:** Octubre 2026

> [!NOTE]
> **Declaración de Alcance y Transparencia:**  
> Las mediciones, metas y umbrales aquí descritos corresponden al prototipo de frontend interactivo de JUÁCIL. No constituyen una certificación formal de organismos acreditadores ni suponen la existencia de un backend en la nube ni de pagos financieros en producción.

---

## 1. Matriz de Calidad del Producto (ISO/IEC 25010:2023)

| Característica (2023) | Métrica del Proyecto | Umbral Meta | Método de Medición | Evidencia y Estado |
|---|---|---|---|---|
| **1. Adecuación Funcional** | Cobertura de Requisitos Críticos Aprobados / Aplicables | **100%** de los requisitos críticos R/I/P implementados y verificables. | Recorridos de prueba automatizados y manuales de punta a punta. | **Meta cumplida**: Catálogo, ficha, carrito mono-negocio, checkout, onboarding 3 pasos, panel y pedidos. |
| **2. Eficiencia de Desempeño** | Puntuación Lighthouse Móvil en build de producción | **≥ 85 / 100** en Rendimiento; LCP ≤ 2.5s; CLS ≤ 0.1 en entorno controlado. | Auditoría de bundle de producción con Vite (`npm run build`). | **Medido en build**: Assets optimizados, code-splitting por rutas, bundle comprimido. |
| **3. Compatibilidad** | Tasa de éxito en navegadores modernos (Chromium, Firefox, WebKit) | **100%** de escenarios críticos renderizados sin errores de script. | Pruebas de compatibilidad multi-motor sobre estándares web W3C. | **Aprobado**: CSS estandarizado con prefijos y polyfills nativos de ECMAScript moderno. |
| **4. Capacidad de Interacción** (Usabilidad) | Hallazgos críticos/serios de accesibilidad y recorrido por teclado | **0 violaciones críticas axe**; 100% interactividad alcanzable por teclado. | Auditoría manual de navegación (Tab, Enter, Space, Escape) y semántica HTML5. | **Aprobado**: Áreas táctiles ≥ 44×44px, anillos de foco visibles, soporte para `prefers-reduced-motion`. |
| **5. Fiabilidad** | Prevención de órdenes duplicadas y recuperación de fallos | **0 pedidos duplicados** por doble pulsación; 100% de recuperación ante almacenamiento corrupto. | Inyección de datos inválidos en `localStorage` y prueba de doble clic rápido en botón de confirmación. | **Verificado**: Botón bloqueante instantáneo; fallback automático al catálogo de fábrica. |
| **6. Seguridad** | Control de acceso demo y ausencia de fugas de datos | **100% de aislamiento** entre negocios y clientes demo; 0 contraseñas reales almacenadas. | Verificación de rutas protegidas (`/panel/...`), rechazo de manipulación de ID ajeno y pantalla `/403`. | **Verificado**: Redirección inmediata a `/403` al intentar editar recursos ajenos. |
| **7. Mantenibilidad** | Calidad estática de código y tipado estricto | **0 errores TypeScript strict**; 0 errores de linter; arquitectura FSD sin dependencias circulares. | Ejecución de `tsc --noEmit` y suite de linting Oxlint/ESLint. | **Verificado**: TypeScript estricto con interfaces Zod para contratos de datos. |
| **8. Flexibilidad** | Adaptabilidad responsiva en múltiples viewports | **0 desbordamientos horizontales** en 320px, 360px, 390px, 768px y 1440px; zoom 200%. | Pruebas de reflow en emulador con viewports móviles reales. | **Verificado**: Diseño fluido mobile-first con media queries y CSS Flexbox/Grid nativo. |
| **9. Seguridad Operacional (Safety)** | Confirmación y salvaguarda ante acciones destructivas | **100% de acciones irreversibles confirmadas** (cancelación, reemplazo de carrito, reset). | Diálogos modales con descripción de consecuencias antes de ejecutar cambios de estado permanentes. | **Implementado**: Modales explícitos para reemplazo de carrito, cancelar pedido y reset demo. |

---

## 2. Evaluación de Accesibilidad (WCAG 2.2 AA)

- **Contraste de Color (Criterio 1.4.3 / 1.4.11)**:
  - Fondos verdes oscuros corporativos (`#0b3820`, `#062413`) con texto blanco: Ratio > **11:1** (Supera ampliamente el requisito de 4.5:1).
  - Acento lima (`#84cc16` / `#a3e635`): Texto en color bosque ultraoscuro `#062413` con ratio > **7.8:1**. Prohibido explícitamente el uso de texto blanco sobre lima.
- **Objetivo de Tamaño de Área Táctil (Fitts / Criterio 2.5.8 ampliado)**:
  - Todo botón primario, pestaña y control interactivo en móvil tiene una dimensión física mínima de **44 × 44 CSS píxeles** con holgura de espaciado circundante.
- **Redimensionamiento de Texto (Criterio 1.4.4) y Reflow (Criterio 1.4.10)**:
  - La interfaz se adapta dinámicamente a zoom del 200% y ancho de 320px sin requerir desplazamiento horizontal bidimensional.
- **Navegación por Teclado y Foco Visible (Criterios 2.1.1, 2.4.7)**:
  - Todos los modales atrapan el foco y se cierran con la tecla `Escape`. Los enlaces y botones exhiben un contorno de foco `outline: 2px solid var(--accent-lime)` con contraste suficiente.

---

## 3. Matriz de Evaluación de las 10 Heurísticas de Nielsen

| Heurística | Implementación en JUÁCIL | Evidencia |
|---|---|---|
| **1. Visibilidad del estado del sistema** | Indicador en vivo de estado offline, insignias de estado de pedido (`pendiente`, `confirmado`, etc.) y badges de stock bajo. | Insignia superior interactiva de conectividad y contadores en tiempo real. |
| **2. Correspondencia con el mundo real** | Vocabulario accesible para MYPES de la Selva peruana: términos como "Emprendimiento", "Qué vendes", "Soles (PEN)", "Coordinar por WhatsApp". | Formularios adaptados a la jerga local sin tecnicismos informáticos. |
| **3. Control y libertad del usuario** | Capacidad de cancelar pedidos pendientes, cerrar modales, deshacer selecciones y limpiar filtros de catálogo con un botón. | Botón "Limpiar filtros" y modal de confirmación con opción de retractarse. |
| **4. Consistencia y estándares** | Iconografía uniforme (Lucide), colores semánticos estables (verde=éxito, rojo=cancelado/peligro, amarillo=advertencia). | Patrón estándar de e-commerce reconocible en escritorio y móvil. |
| **5. Prevención de errores** | Validación en tiempo real con React Hook Form + Zod, selector de cantidad limitado al stock real, confirmación de reemplazo de carrito. | Imposibilidad de seleccionar más unidades que el inventario disponible. |
| **6. Reconocimiento antes que recuerdo** | Tarjeta de resumen de pedido con foto e historial de precios intactos; sugerencias de categorías visibles. | Información clave presente en todo momento sin depender de la memoria del comprador. |
| **7. Flexibilidad y eficiencia de uso** | Conmutador rápido de perfiles demo en la barra superior para alternar instantáneamente entre clientes y negocios sin reescribir contraseñas. | Selector demo en navbar accesible con un solo clic. |
| **8. Diseño estético y minimalista** | Interfaz limpia con tipografía moderna, generoso espacio en blanco, jerarquía clara y sin banners ruidosos ni publicidad invasiva. | Paleta inspirada en la biodiversidad de la Amazonía peruana. |
| **9. Ayuda a reconocer, diagnosticar y recuperarse de errores** | Mensajes de error en castellano claro indicando exactamente qué falló y cómo solucionarlo (ej. "Ingresa un número de celular de 9 dígitos para WhatsApp"). | Errores vinculados a campos con `aria-invalid` y textos explicativos. |
| **10. Ayuda y documentación** | Página dedicada `/ayuda` con preguntas frecuentes para compradores y guía para emprendedores de la Selva. | Sección de preguntas frecuentes y botón de asistencia contextual. |

---

## 4. Propuesta de Prueba Piloto de Calidad en Uso (ISO/IEC 25019:2023)

### Perfil de Participantes Propuesto (5 Usuarios):
1. **Emprendedor 1**: Productor de café de Villa Rica con experiencia básica en smartphones.
2. **Emprendedor 2**: Artesana Yanesha de Oxapampa con uso exclusivo de WhatsApp para ventas.
3. **Emprendedor 3**: Fabricante de chocolates y derivados de cacao en Chanchamayo.
4. **Comprador 1**: Consumidor urbano de Lima buscando comprar productos directos de la Selva.
5. **Comprador 2**: Residente local de La Merced acostumbrado al comercio por teléfono.

### Tareas Críticas del Piloto:
- **T1**: Encontrar un producto en el catálogo mediante filtros (ej. Café especial < S/ 30.00).
- **T2**: Registrar una nueva MYPE mediante el formulario de 3 pasos.
- **T3**: Publicar un nuevo producto con precio, foto y stock en el panel administrativo.
- **T4**: Confirmar un pedido como cliente y generar el enlace de coordinación a WhatsApp.

### Métricas de Evaluación Propuestas:
- **Tasa de éxito sin ayuda**: Meta **≥ 80%** (`(tareas exitosas sin asistencia / tareas totales) × 100`).
- **Mediana de tiempo por tarea**: Establecida a partir de la línea base del piloto.
- **Satisfacción media**: Meta **≥ 4.0 / 5.0** basada en el cuestionario de 10 preguntas del informe de avance.
- **Estado Actual**: *Pendiente de ejecución de campo con usuarios humanos reales.* (Se proporciona la herramienta interactiva de encuesta en `/ayuda#encuesta` para su aplicación directa).
