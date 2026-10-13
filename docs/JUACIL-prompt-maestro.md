# Prompt maestro para construir el prototipo frontend de JUÁCIL

Actúa como especialista en diseño de producto, UX/UI, arquitectura frontend y calidad de software. Construye el prototipo navegable de JUÁCIL, Tu tienda online, para MYPES de la región Selva del Perú. Implementa el proyecto: no te limites a describir pantallas o entregar un plan.

Usa la skill $prototipar-juacil-react si está disponible. Este prompt también es autosuficiente cuando el agente no puede acceder a ella.

## 1. Objetivo, fuente y alcance

Lee por completo el informe adjunto JUACIL-TU TIENDA ONLINE - avance.docx, incluyendo sus imágenes. Si no está disponible, usa la especificación incluida aquí y declara esa limitación. Inspecciona primero el repositorio y sus instrucciones. No sobreescribas trabajo existente sin necesidad.

Construye solo frontend React + Vite: prototipo funcional con datos ficticios, persistencia local y simulación coherente. No implementes backend, pagos reales, envío real de WhatsApp ni autenticación de producción. Distingue en la documentación requisitos del texto (R), funciones visibles en la imagen (I) y propuestas complementarias (P). Las propuestas de este prompt son el alcance solicitado para el prototipo, aunque no aparezcan en el informe.

## 2. Arquitectura y stack

Usa React + Vite + TypeScript strict, React Router, React Hook Form + Zod. Usa CSS Modules y tokens CSS como estrategia inicial, conservando una alternativa ya instalada si es consistente. Usa iconos de una misma colección, componentes semánticos y primitivas accesibles para diálogos/menús cuando aporten valor. Selecciona versiones estables compatibles, comprueba requisitos de Node y guarda lockfile. No inventes números de versión ni utilices dependencias por moda.

Adopta arquitectura modular por funcionalidad basada en Feature-Sliced Design, con dependencias exclusivamente hacia capas inferiores:

```text
src/
  app/                      # composición global
    providers/              # sesión demo, carrito, dependencias
    router/                 # rutas, guards y permisos
    layouts/                # shell público y del negocio
    styles/                 # estilos globales
  pages/                    # pantallas y composición de recorridos
    home/ catalog/ product-detail/ store-detail/
    access/ registration/ checkout/ customer-orders/
    merchant-dashboard/ merchant-products/ merchant-orders/
  widgets/                  # bloques reutilizados de gran tamaño, si se necesitan
  features/                 # acciones reutilizables del usuario
    sign-in/ register-business/ manage-product/
    add-to-cart/ place-order/ change-order-status/
  entities/                 # conceptos y reglas del negocio
    user/ business/ product/ order/ cart/
      model/                # tipos, reglas, contratos y schemas pertinentes
      api/                  # adaptadores mock del dominio
      ui/                   # representación reusable del dominio
      index.ts              # API pública de cada slice
  shared/
    ui/                     # Button, Input, Dialog, Alert, Skeleton, etc.
    lib/                    # utilidades neutrales y almacenamiento genérico
    config/                 # configuración no secreta
    styles/                 # tokens de diseño
    assets/                 # logo e imágenes
  main.tsx
tests/e2e/
docs/
```

El árbol es una guía, no una obligación de crear todas las carpetas. Inicia con las necesarias. App puede importar pages/widgets/features/entities/shared; pages solo capas inferiores, y así sucesivamente. Prohíbe imports entre slices de la misma capa. Compón relaciones entre features en pages o app. Shared no conoce reglas de negocio. Usa API públicas para impedir imports profundos y herramientas de lint para vigilar límites. Mantén bloques exclusivos de una página dentro de ella.

Define contratos pequeños por dominio, por ejemplo ProductRepository y OrderRepository; inyecta adaptadores mock desde app. UI y hooks de interacción no acceden directamente a localStorage. Mantén estado local para UI, URL para filtros y proveedores limitados para sesión/carrito. No agregues Zustand/Redux/TanStack Query sin justificar una necesidad; si usas Query, separa estado remoto y cliente sin duplicarlo.

Usa dinero entero en céntimos y presentación con Intl.NumberFormat para PEN; stock entero, IDs estables y datos con relaciones coherentes. Persistencia versionada con validación y recuperación ante corrupción. Guarda imágenes demo mediante IndexedDB o fixtures; no persistir object URLs ni grandes blobs en localStorage. No guardar contraseñas reales, claves ni tokens de producción. Incluir reset exclusivo de datos demo.

## 3. Dirección visual

Preserva el logo JUÁCIL del informe, eslogan Tu tienda online y referencia verde vinculada a la Selva. Extrae el logo si está disponible; usa un placeholder identificado si falta. No uses el escudo académico como marca comercial. Moderniza la pantalla de referencia manteniendo su identidad y onboarding de tres pasos, sin copiar defectos ni promesas no verificadas.

Crea un sistema de diseño: tokens semánticos para verde profundo, acento lima, superficies neutras, texto, bordes y estados; tipografía legible, escala de espaciado consistente, radios y sombras discretos. Comprueba contraste antes de fijar combinaciones. No usar texto blanco sobre lima si falla contraste. Precio, disponibilidad y CTA deben ser fáciles de encontrar. No conviertas la interfaz en una colección de tarjetas decorativas o ilustraciones dominantes.

Diseña mobile-first. En móvil usa navegación breve y acciones alcanzables; en escritorio utiliza espacio para catálogo y filtros, y sidebar en panel cuando ayude. No depender exclusivamente de hover. Revisar 360, 390, 768 y 1440px; además reflow a 320px y zoom al 200%. Mantener identidad consistente entre acceso, catálogo y panel.

## 4. Requisitos, rutas e interacciones

Implementa íntegramente la siguiente especificación, incluyendo procedencia y criterios de aceptación.

# Especificación de JUÁCIL

## Procedencia

El informe describe prototipado y validación, no un sistema terminado. Los capítulos 3.6 y 3.8 están pendientes; no aporta métricas obtenidas ni tecnologías elegidas.

### Texto del informe

- R01: catálogo de productos de MYPES de la Selva.
- R02: fotografías, precios, características y descripción breve.
- R03: administrar y actualizar información de productos.
- R04: realizar y registrar pedidos.
- R05: contacto digital, consultas y coordinación de ventas.
- R06: uso sencillo desde computadora y celular para poca experiencia digital.
- R07: visibilidad regional y hacia otras zonas del país.
- R08: probar y recoger evidencia de facilidad, utilidad y claridad.

### Imagen del informe

- I01: logo verde JUÁCIL, bolsa con J, vegetación, montañas y flecha; Tu tienda online.
- I02: Gestión Comercial y Catálogos, menú, campana, Modo Offline.
- I03: Mercado de la selva central, Personalización, Ver más, Experiencia Única, Preferencias del Cliente e icono parecido a QR sin finalidad definida.
- I04: Cuéntanos sobre tu negocio → Sube tu primer producto → Recibe tu primera orden.
- I05: nombre del emprendimiento, qué vendes, ciudad/distrito, WhatsApp; Registrar emprendimiento e Inicia sesión.
- I06: producto con foto, precio y stock.
- I07: avisos por WhatsApp, ayuda con RUC, publicación en menos de una hora y recogida/envío. Son promesas sin proceso descrito; no afirmar servicio real.

## Propuestas para completar el prototipo

Identificar todas como P. Proponer marketplace compartido con página pública por negocio y carrito de un negocio por pedido. Al cambiar negocio preguntar si se reemplaza carrito; nunca borrar silenciosamente.

| Acceso | Rutas | Permisos |
|---|---|---|
| Público | /, /catalogo, /productos/:id, /tiendas/:id, /ayuda | Consultar publicados y contactar |
| Público | /acceso, /registro/cliente, /registro/emprendimiento, /recuperar-acceso | Perfiles demo; no conceder administrador |
| Cliente | /carrito, /pedido/confirmar, /mis-pedidos, /mis-pedidos/:id, /mi-cuenta | Carrito, confirmar y consultar exclusivamente pedidos propios |
| Emprendedor | /panel, /panel/negocio, /panel/productos, /panel/productos/nuevo, /panel/productos/:id/editar, /panel/pedidos, /panel/pedidos/:id, /panel/notificaciones | Administrar solo negocio asignado y productos/pedidos propios |
| General | /403 y comodín 404 | Explicar y ofrecer regreso |

Permitir carrito provisional público y exigir cliente al confirmar. Usar un rol activo por perfil demo; no elevarlo mediante URL. No crear administrador salvo solicitud adicional. Redirigir según rol, permitir logout y validar retorno interno autorizado. Usar dos clientes y al menos dos negocios para probar aislamiento.

### Pantallas

- Inicio: identidad, búsqueda, categorías propuestas, destacados, CTA registro de negocio.
- Catálogo: buscar por nombre, categoría, precio y ubicación; ordenar, limpiar, contador, vacío y URL compartible.
- Producto: galería accesible, precio PEN, características, descripción, stock, negocio, cantidad y CTA/contacto.
- Tienda: presentación, ubicación, catálogo y WhatsApp; abrir contacto solo por acción explícita sin afirmar envío.
- Cliente: registro con nombre/correo y validación; acceso demo y recuperación simulada de respuesta genérica.
- Negocio: perfil del responsable, nombre, categoría, ciudad/distrito y WhatsApp peruano. RUC opcional propuesto, formato 11 dígitos sin afirmar validez SUNAT. Guardar y retomar pasos.
- Editor producto: nombre, categoría, precio positivo en céntimos, stock entero no negativo, descripción, características, fotos con preview/reordenar/eliminar y borrador/publicado. Stock ausente es inválido; cero permite publicación como agotado y bloquea compra. Definir límites de tamaño/tipo. Revocar object URLs y no persistirlos; guardar imágenes demo en IndexedDB o fixtures, no blobs grandes en localStorage.
- Compra: cantidades, subtotales, resumen, contacto, recogida/entrega simulada, confirmar, código y detalle. Pago y costo de entrega por coordinar; no tarjetas reales ni tarifa inventada.
- Gestión pedido: pendiente → confirmado → preparado → entregado; cancelar desde pendiente/confirmado. Validar transiciones y fechas. Conservar precio e información histórica aunque cambie producto.
- Inventario mock: revalidar precio/stock al confirmar, reservar una vez, impedir doble envío y devolver reserva una sola vez al cancelar. No protege concurrencia real entre dispositivos.
- Panel: onboarding de tres pasos, resumen derivado, productos/pedidos propios, notificaciones simuladas, editar negocio y ver tienda.
- Preferencias: categorías/ubicación propuestas sin rastreo; Experiencia Única abre explicación útil. No inventar integración QR.
- Offline: indicador orientativo; lectura local y borradores, bloquear confirmación y ofrecer recuperación. No prometer arranque sin red sin service worker ni sincronización real.

Usar 3 negocios y al menos 12 productos ficticios con stock y estados variados, imágenes coherentes, alt y fallback.

## Aceptación

1. Registro negocio inicia onboarding y persiste al recargar.
2. Publicar producto lo muestra en catálogo/tienda; borrador permanece privado.
3. Buscar/filtrar/limpiar produce resultados consistentes.
4. Pedido aparece para cliente y negocio con importes históricos iguales.
5. Stock insuficiente y doble clic no crean órdenes inválidas/duplicadas.
6. Cancelar restaura reserva una vez; rechazar transición inválida.
7. IDs/URLs ajenos deniegan acceso en UI y mock.
8. Logout y retorno interno seguro funcionan.
9. Errores, offline y formularios inválidos conservan contexto y permiten recuperación.
10. Reset restaura exclusivamente datos demo.


## 5. Principios de diseño y medición de calidad

# Diseño y calidad verificable

## Principios de interacción

| Principio | Aplicación y comprobación |
|---|---|
| Gestalt: proximidad/región común | Agrupar foto/nombre/precio/CTA sin confundir tarjetas o campos |
| Gestalt: semejanza/continuidad | Acciones/estados iguales con tratamiento consistente y pasos ordenados |
| Gestalt: figura/fondo/cierre | Jerarquía, contraste y contenedores reconocibles sin ruido |
| Hick-Hyman | Acciones principales limitadas y divulgación progresiva; evitar decisiones simultáneas innecesarias |
| Fitts | CTA cercano al contexto y controles principales ≥44×44 CSS px como meta del proyecto; medir hit area y separación |
| Miller/carga cognitiva | Agrupar por tarea y pasos; no imponer número mágico de campos |
| Jakob/reconocimiento | Patrones familiares de catálogo/carrito, etiquetas e historial |
| Prevención/recuperación | Confirmar acciones destructivas, preservar formularios y deshacer cuando proceda |
| Accesibilidad | HTML semántico, labels, teclado, foco, alt, live regions y reduced motion; revisar manualmente además de axe |

Aplicar las diez heurísticas de Nielsen: estado visible; lenguaje familiar; volver/cancelar/deshacer; consistencia; prevención; reconocimiento; eficiencia de uso repetido; minimalismo; errores comprensibles y recuperables; ayuda contextual. Registrar evidencia por heurística.
Evaluar objetivo WCAG 2.2 AA: contraste normal ≥4.5:1 y texto grande ≥3:1, criterios aplicables de controles/foco, teclado, zoom 200% y reflow a 320 CSS px. La meta táctil 44px del proyecto no es el mínimo AA de 24px del criterio 2.5.8, que admite excepciones. No afirmar conformidad total por puntuación automática.

## SQuaRE

Usar ISO/IEC 25010:2023 para calidad de producto, ISO/IEC 25019:2023 para calidad en uso e ISO/IEC 25023:2016 como referencia de medición; comprobar versiones si se requiere actualización. No mezclar modelos 2011/2023 sin explicación ni presentar borradores como publicados. Las nueve características de producto 2023 son adecuación funcional, eficiencia de desempeño, compatibilidad, capacidad de interacción, fiabilidad, seguridad, mantenibilidad, flexibilidad y seguridad operacional (safety); separar safety de seguridad informática.
Las métricas y umbrales siguientes son propuestas de JUÁCIL, no fórmulas normativas reproducidas ni certificación ISO. Documentar correspondencia y límites de la medición 2016 respecto al modelo 2023.

| Característica | Métrica y meta propuesta | Evidencia |
|---|---|---|
| Adecuación funcional | Críticos aprobados / críticos aplicables =100%; reportar total aprobado/aplicable | Trazabilidad y recorridos |
| Eficiencia | Mediana de 3 Lighthouse móvil en build ≥85; CLS ≤0.1, LCP laboratorio ≤2.5s bajo entorno fijo | Ruta, equipo, versiones, throttling y ejecuciones; no son datos de campo |
| Compatibilidad | 100% escenarios críticos en Chromium/Firefox, WebKit si disponible | Versiones; WebKit no demuestra Safari real |
| Capacidad de interacción | 0 hallazgos críticos/serios axe en pantallas clave; 100% recorridos críticos por teclado | Auditoría manual de foco/modal/formularios |
| Fiabilidad | 0 pedidos duplicados; persistencia y recuperación correctas en todos los escenarios previstos | Fallos, recarga y doble envío |
| Seguridad | 100% casos demo de rol/propiedad denegados; 0 secretos/contraseñas reales | UI y repositorios; no demuestra seguridad de producción |
| Mantenibilidad | 0 errores TS/lint e imports prohibidos; cobertura ramas ≥80% de validación/permisos/reglas pedido | Reportes y assertions significativas |
| Flexibilidad | Sin overflow global a 360/390/768/1440px; reflow 320px y sustitución de adaptador sin cambio de UI | Capturas y pruebas de contrato |
| Safety | Acciones sensibles informan consecuencias y evitan confirmación accidental; justificar aplicabilidad limitada | Cancelar, reemplazar carrito, reset |

## Calidad en uso

Proponer piloto de al menos 5 usuarios, indicando perfil/contexto sin extrapolar a la población. Tareas: encontrar producto, registrar negocio, publicar producto, confirmar pedido. Medir éxito sin ayuda = completadas sin ayuda / intentadas ×100 (meta ≥80%), mediana de tiempo por tarea, errores/tarea y satisfacción media 1–5 (meta ≥4). Fijar tiempos tras línea base, sin inventarlos.
Aplicar las 10 preguntas del informe: utilidad, claridad, encontrar información, comunicación, pedidos, alcance, móvil, digitalización, intención de uso y mejora principal. Si no hay piloto marcar pendiente; no reemplazar evidencia humana por opinión AI.

## Reporte

Entregar métrica → método → entorno → umbral del proyecto → resultado observado → estado → evidencia → limitación. Usar no medido/fuera de alcance cuando corresponda. No atribuir disponibilidad de backend, pagos seguros, entrega real ni certificación ISO al frontend demo.

## Fuentes oficiales consultadas el 13 de octubre de 2026

- React: https://react.dev/learn/build-a-react-app-from-scratch
- Vite: https://vite.dev/guide/
- Feature-Sliced Design: https://feature-sliced.design/docs/reference/layers
- Nielsen Norman Group: https://www.nngroup.com/articles/ten-usability-heuristics/
- W3C: https://www.w3.org/TR/WCAG22/
- ISO producto: https://www.iso.org/standard/78176.html
- ISO calidad en uso: https://www.iso.org/standard/78177.html
- ISO medición: https://www.iso.org/standard/35747.html

## 6. SOLID y calidad de código obligatorios

Aplica SRP separando componentes de presentación, hooks de interacción, validaciones y repositorios. Aplica OCP mediante composición ante variantes reales. Aplica LSP con contratos equivalentes para adaptadores, incluyendo errores. Aplica ISP con props y repositorios pequeños. Aplica DIP mediante contratos de dominio e inyección en app. No fuerces clases, herencia o una arquitectura empresarial innecesaria en React.

Usa TypeScript strict, nombres claros, funciones puras para cálculos/reglas, componentes cohesivos, estado mínimo y efectos solo para sincronización externa. Evita any injustificado, duplicar totales calculables, dependencias circulares, archivos monolíticos y condicionales dispersos por rol. Centraliza política de permisos. Aplica KISS, DRY y YAGNI sin extraer abstracciones prematuras.

## 7. Estados, validaciones y mensajes

Implementa carga, éxito, vacío, error, deshabilitado, offline, no encontrado y acceso denegado cuando correspondan. Cada error debe explicar qué ocurrió y cómo recuperarse. Mantén labels visibles; placeholder no sustituye label. Marca obligatorios, valida al momento adecuado y conserva datos tras fallo. Conecta errores con aria-describedby y anuncia cambios relevantes sin saturar lectores de pantalla.

Ejemplos: No hay productos con estos filtros. Limpia los filtros para ver más opciones; Solo quedan 3 unidades; No tienes permiso para editar este producto; Estás sin conexión. Tu borrador se guardó en este dispositivo; Tu pedido se registró en la demostración con el código JUA-0001. No afirmar una operación exitosa antes de terminar el mock. Confirmar cancelación, eliminación y reset; ofrecer deshacer cuando proceda.

## 8. Plan de trabajo y validación

Antes de implementar, crea docs/requisitos.md con IDs R/I/P, rutas, roles, campos, estados y Given/When/Then por requisito crítico; docs/decisiones.md con supuestos y arquitectura; docs/calidad.md con métricas y límites. Estos documentos deben ser concisos y útiles, no sustituir la implementación.

Construye primero shell → acceso demo → registro negocio → producto → catálogo → pedido → gestión. Completa luego preferencias, notificaciones y ayuda. Todos los botones/enlaces visibles deben funcionar o indicar explícitamente el alcance simulado. No presentar pagos, RUC, sincronización ni logística como integraciones reales.

Prueba con Vitest y Testing Library reglas/validaciones/permisos y con Playwright recorridos críticos. Incluye URLs directas ajenas, stock insuficiente, doble clic, cambio de negocio en carrito, cancelación repetida, borradores privados, datos locales corruptos, recarga, offline y recuperación. Usa fixtures de varios usuarios/negocios. Prueba accesibilidad con axe y manualmente teclado, foco, lector cuando disponible y zoom. No afirmar pruebas de tecnologías no disponibles.

Ejecuta y registra scripts de lint, typecheck, test y build. Agrega test:e2e si existe entorno. Audita build de producción, no servidor dev, para rendimiento. Si algo falla, corrígelo antes de entregar; si un entorno bloquea una medición, marca no medido y explica cómo ejecutarla.

## 9. Entrega y definición de terminado

Entrega proyecto ejecutable, instrucciones de instalación/ejecución, requisitos de Node, perfiles demo, restauración de datos, documentación de decisiones, matriz de cobertura, evidencia visual y reporte de calidad con resultados observados. Reporta qué se implementó, qué se comprobó y qué quedó pendiente.

Se considera terminado cuando un usuario puede registrar negocio, publicar producto, encontrarlo, confirmar pedido y gestionarlo con datos coherentes; cuando roles/propiedad y casos de error están verificados; cuando navegación responsive y teclado funcionan; y cuando build/tipos/lint/pruebas críticas pasan. Las pruebas con usuarios quedan explícitamente pendientes si no hay participantes.

No afirmes cumplimiento integral o certificación ISO 25000. Describe evaluación alineada con SQuaRE y objetivos propios del proyecto. No cambies alcance a backend ni detengas trabajo por decisiones reversibles de diseño: documenta la decisión y continúa.
