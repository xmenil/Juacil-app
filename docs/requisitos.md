# JUÁCIL: Especificación de Requisitos de Software (SRS)

**Proyecto:** JUÁCIL – "Tu tienda online"  
**Propósito:** Prototipo frontend navegable para MYPES de la región Selva del Perú (Chanchamayo, Oxapampa, Satipo, Villa Rica).  
**Fecha:** Octubre 2026  
**Alcance:** Prototipo React + Vite con datos simulados, persistencia local versionada, reglas de negocio completas y simulación explícita. Sin backend real, sin pasarela de pagos real y sin envío masivo real de WhatsApp.

---

## 1. Clasificación y Trazabilidad de Requisitos

Los requisitos se categorizan rigurosamente según su procedencia:
- **(R)** Requisitos explícitos del texto del informe de avance.
- **(I)** Requisitos visuales identificados en las pantallas del informe.
- **(P)** Propuestas complementarias del prompt maestro para dotar al prototipo de robustez funcional.

### 1.1 Requisitos del Texto del Informe (R)
- **R01**: Catálogo de productos representativos de MYPES de la Selva peruana (café, cacao, miel, artesanías, frutas deshidratadas).
- **R02**: Fichas de producto con fotografías, precios, características detalladas y descripción concisa.
- **R03**: Administración y actualización de la información de productos (crear, editar, stock, estado borrador/publicado).
- **R04**: Registro y seguimiento del ciclo de vida de pedidos por parte de clientes y negocios.
- **R05**: Contacto digital simulado para consultas y coordinación directa de ventas (enlace estructurado a WhatsApp).
- **R06**: Interfaz de alta usabilidad tanto en computadoras como en teléfonos inteligentes (mobile-first, baja carga cognitiva para usuarios con poca experiencia digital).
- **R07**: Proyección y visibilidad comercial a nivel regional e interregional.
- **R08**: Instrumentos integrados para evaluación y recojo de evidencia sobre facilidad de uso, claridad y utilidad (cuestionario de 10 preguntas del informe).

### 1.2 Requisitos de la Imagen del Informe (I)
- **I01**: Identidad visual con logotipo JUÁCIL (bolsa de compras con isotipo "J", vegetación tropical, montañas, río y flecha de crecimiento; eslogan *"Tu tienda online"*).
- **I02**: Cabecera con título *"Gestión Comercial y Catálogos"*, menú de navegación, campana de notificaciones y distintivo interactivo de *"Modo Offline"*.
- **I03**: Tarjetas temáticas y de acceso rápido: *"Mercado de la selva central"*, *"Experiencia Única"* y *"Preferencias del Cliente"* con acceso al catálogo y explicaciones contextuales.
- **I04**: Flujo de Onboarding para emprendedores en 3 pasos pedagógicos:
  1. *Cuéntanos sobre tu negocio* (nombre, ubicación, rubro, asistencia con RUC).
  2. *Sube tu primer producto* (foto, precio, stock; simulación de publicación rápida).
  3. *Recibe tu primera orden* (alerta de pedido, coordinación de entrega/envío).
- **I05**: Formulario inicial de registro rápido de emprendimiento: nombre del negocio, qué vendes, ciudad/distrito, WhatsApp de contacto, botón *"Registrar emprendimiento"* y enlace a *"Inicia sesión"*.
- **I06**: Visualización de producto con imagen, precio en Soles (PEN) y disponibilidad de inventario.
- **I07**: Promesas comunicacionales transparentadas: los avisos por WhatsApp, asistencia RUC, entrega y recogida se presentan con etiqueta explícita de *Simulación Demostrativa*, sin inducir a engaño.

### 1.3 Propuestas Complementarias del Prototipo (P)
- **P01**: **Marketplace multi-negocio con escaparate individual**: Cada negocio tiene su propia URL `/tiendas/:id` con su banner, datos de contacto y catálogo filtrado.
- **P02**: **Regla de Carrito Mono-Negocio con Diálogo de Confirmación**: Un pedido solo puede contener artículos de una misma MYPE para respetar la logística de la Selva. Si el cliente tiene artículos de la Tienda A e intenta añadir un producto de la Tienda B, el sistema muestra un diálogo modal claro preguntando si desea reemplazar el carrito actual o cancelar. Nunca se vacía de forma silenciosa.
- **P03**: **Moneda entera en céntimos**: Todos los precios y subtotales se almacenan internamente como números enteros en céntimos (ej. S/ 25.50 = `2550`) y se formatean con `Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })`.
- **P04**: **Máquina de Estados de Pedidos**: Estados finitos: `pendiente` → `confirmado` → `preparado` → `entregado`. Transición a `cancelado` permitida únicamente desde `pendiente` o `confirmado`. Preservación inmutable del snapshot de datos (precio, nombre del producto) al momento de la orden.
- **P05**: **Gestión Concurrente y Reserva de Inventario Mock**:
  - Al presionar *Confirmar Pedido*, se revalida stock en tiempo real.
  - Se reserva el stock una sola vez.
  - Se inhabilita el botón tras el primer clic para prevenir órdenes duplicadas por doble pulsación.
  - Si un pedido se cancela, el stock reservado se repone exactamente una vez.
- **P06**: **Aislamiento Estricto de Roles y Multi-Inquilino Demo**:
  - Rutas y datos segmentados entre Cliente y Emprendedor.
  - Un emprendedor solo puede ver, editar y recibir pedidos de sus propios productos.
  - Un cliente solo puede ver sus propios pedidos.
  - Intentos de acceder a `/panel/productos/:id/editar` o `/panel/pedidos/:id` ajenos redirigen a `/403`.
- **P07**: **Persistencia Local Versionada con Autorecuperación**: Almacenamiento en `localStorage` con esquema versionado (`juacil_storage_v1`). Si los datos están ausentes o corruptos, se regeneran automáticamente desde las fixtures iniciales sin romper la aplicación.
- **P08**: **Reset Selectivo de Datos Demo**: Botón de restablecimiento de emergencia accesible en cabecera/pie que devuelve el almacenamiento a su estado inicial de demostración.
- **P09**: **Soporte Offline Simulable**: Detección de conectividad del navegador más switch manual para pruebas. En modo offline: navegación de catálogo y edición de borradores permitida; checkout bloqueado con mensaje explicativo.
- **P10**: **Previsualización de Mensaje a WhatsApp**: Al finalizar el pedido o desde la ficha de tienda, se genera un enlace `https://wa.me/...` con mensaje preformateado con el código de orden (`JUA-XXXX`) y resumen de productos para coordinar la entrega.
- **P11**: **Módulo de Evaluación de Calidad en Uso (Encuesta)**: Interfaz interactiva para diligenciar el instrumento de 10 preguntas del informe, calculando métricas de satisfacción en vivo.

---

## 2. Mapa de Rutas, Roles y Permisos

| Rol | Ruta | Propósito | Reglas de Acceso |
|---|---|---|---|
| **Público** | `/` | Inicio: hero, onboarding 3 pasos, categorías, productos destacados, llamada a registrar emprendimiento. | Libre acceso. |
| **Público** | `/catalogo` | Catálogo general con búsqueda, filtro por rubro, rango de precio, ubicación y ordenamiento. | Libre acceso. |
| **Público** | `/productos/:id` | Ficha técnica del producto: galería, precio, stock, descripción, datos de la MYPE, selector de cantidad y CTA. | Libre acceso (solo productos publicados). |
| **Público** | `/tiendas/:id` | Perfil público de la MYPE: historia, ubicación, WhatsApp y catálogo propio. | Libre acceso. |
| **Público** | `/ayuda` | Centro de ayuda, preguntas frecuentes y guía para compradores y MYPES de la Selva. | Libre acceso. |
| **Público** | `/acceso` | Selector de perfiles demo rápidos (2 clientes, 3 emprendedores) y formulario de ingreso simulado. | Público; redirige según rol si ya hay sesión activa. |
| **Público** | `/registro/cliente` | Formulario de registro para compradores. | Público. |
| **Público** | `/registro/emprendimiento` | Registro de nueva MYPE con validación y bienvenida guiada. | Público. |
| **Público** | `/recuperar-acceso` | Recuperación simulada con respuesta genérica no comprometedora. | Público. |
| **Cliente** | `/carrito` | Carrito de compras con resumen del negocio actual, subtotales, cantidades y validación de stock. | Requiere sesión o crea carrito temporal; para proceder exige rol Cliente. |
| **Cliente** | `/pedido/confirmar` | Pantalla de finalización: datos de entrega/recojo, instrucciones, confirmación de stock y generación de orden. | Exclusivo rol `cliente`. |
| **Cliente** | `/mis-pedidos` | Historial de órdenes realizadas por el cliente activo. | Exclusivo rol `cliente`. |
| **Cliente** | `/mis-pedidos/:id` | Detalle específico de una orden del cliente con botón de coordinación WhatsApp y cancelación si procede. | Solo pedidos pertenecientes al cliente activo. Si es ajeno -> `/403`. |
| **Cliente** | `/mi-cuenta` | Datos del perfil y selector de dirección por defecto. | Exclusivo rol `cliente`. |
| **Emprendedor** | `/panel` | Panel general: estado del negocio, métricas clave (ventas, pedidos, stock crítico), acceso al onboarding. | Exclusivo rol `merchant`. |
| **Emprendedor** | `/panel/negocio` | Edición del perfil comercial, RUC referencial, WhatsApp y ubicación. | Exclusivo rol `merchant` (solo su negocio). |
| **Emprendedor** | `/panel/productos` | Lista de productos propios con filtro por estado (publicado/borrador/agotado) y acciones de gestión. | Exclusivo rol `merchant`. |
| **Emprendedor** | `/panel/productos/nuevo` | Formulario de creación de producto con fotos demo, validación Zod y cálculo de precios. | Exclusivo rol `merchant`. |
| **Emprendedor** | `/panel/productos/:id/editar`| Edición de producto existente. | Exclusivo rol `merchant` (solo productos del negocio asignado). Ajeno -> `/403`. |
| **Emprendedor** | `/panel/pedidos` | Gestión de pedidos recibidos por la MYPE con filtro por estado. | Exclusivo rol `merchant`. |
| **Emprendedor** | `/panel/pedidos/:id` | Detalle de orden con actualización de estado (`confirmar`, `preparar`, `entregar`, `cancelar`). | Solo pedidos que contengan productos de su negocio. |
| **Emprendedor** | `/panel/notificaciones`| Registro de avisos del sistema (nuevos pedidos, alertas de stock bajo). | Exclusivo rol `merchant`. |
| **General** | `/403` | Pantalla de Acceso Denegado con explicación amigable y botón de regreso seguro. | Accesible para todos. |
| **General** | `/404` | Pantalla de Página No Encontrada con buscador y enlace a Inicio. | Accesible para rutas desconocidas. |

---

## 3. Criterios de Aceptación (Gherkin: Given / When / Then)

### Criterio 1: Reemplazo de Tienda en el Carrito (P02)
```gherkin
Scenario: El cliente intenta añadir un producto de una MYPE distinta a la que ya tiene en carrito
  Given que el cliente tiene 2 unidades de "Café Villa Rica Especial" de la tienda "Café Aroma de Oxapampa" en el carrito
  When el cliente visita el producto "Miel Pura de Abeja" de la tienda "Chanchamayo Cacao & Miel" y pulsa "Agregar al carrito"
  Then el sistema NO debe vaciar el carrito automáticamente
  And debe mostrar un diálogo modal de confirmación informando: "Tu carrito contiene productos de 'Café Aroma de Oxapampa'. Solo puedes comprar a un negocio por pedido. ¿Deseas vaciar el carrito actual y agregar este nuevo producto?"
  When el cliente confirma la acción
  Then el carrito anterior se reemplaza exclusivamente con el nuevo producto
  When el cliente cancela la acción
  Then el carrito conserva intactos los productos de "Café Aroma de Oxapampa".
```

### Criterio 2: Prevención de Sobrevendidos y Doble Clic (P05)
```gherkin
Scenario: Intento de compra con stock insuficiente o doble clic
  Given que el producto "Chocolate Amargo 70%" tiene stock disponible de 3 unidades
  When el cliente intenta añadir 4 unidades al carrito
  Then el selector de cantidad limita el máximo a 3 y muestra el aviso "Solo quedan 3 unidades disponibles"
  When el cliente procede a la pantalla de checkout y pulsa "Confirmar Pedido"
  Then el botón de confirmación cambia de inmediato a estado deshabilitado con spinner de carga
  And el pedido se procesa exactamente una vez generando el código "JUA-XXXX"
  And el stock del producto disminuye en 3 unidades pasando a estado "Agotado"
  And ningún segundo clic genera una orden duplicada.
```

### Criterio 3: Cancelación de Pedido y Reposición de Reserva (P04, P05)
```gherkin
Scenario: Cancelación válida de un pedido pendiente por parte del cliente o negocio
  Given un pedido en estado "pendiente" con 2 unidades de "Miel Silvestre"
  When el usuario pulsa "Cancelar Pedido" y confirma la advertencia de seguridad
  Then el estado del pedido cambia a "cancelado"
  And la fecha de cancelación se registra en el historial
  And el inventario de "Miel Silvestre" se incrementa exactamente en 2 unidades
  When el usuario intenta pulsar nuevamente cancelar o cambiar a otro estado
  Then la acción es rechazada porque las transiciones desde "cancelado" están deshabilitadas.
```

### Criterio 4: Control de Acceso y Propiedad de Recursos (P06)
```gherkin
Scenario: Intento de edición de producto perteneciente a otra MYPE
  Given que el usuario autenticado tiene el perfil de "Chanchamayo Cacao & Miel" (negocio ID: "biz-chanchamayo")
  When ingresa manualmente en el navegador a la URL "/panel/productos/prod-cafe-01/editar" (perteneciente a "Café Aroma")
  Then el sistema intercepta la solicitud en el guard de ruta
  And redirige a la pantalla "/403"
  And muestra el mensaje claro: "No tienes permiso para administrar productos de otro negocio."
  And proporciona un botón "Volver a Mis Productos".
```

### Criterio 5: Simulación Offline con Bloqueo Preventivo (P09, I02)
```gherkin
Scenario: Navegación y checkout con conectividad perdida
  Given que el usuario activa el "Modo Offline" desde la barra superior
  When navega por el catálogo o consulta sus pedidos previos
  Then la información almacenada localmente se muestra con normalidad acompañada de una insignia "Datos en caché local"
  When intenta pulsar "Confirmar Pedido" en el checkout
  Then el botón se deshabilita
  And se despliega una alerta: "No es posible registrar nuevos pedidos sin conexión a internet. Conéctate a la red para coordinar con la MYPE."
```

### Criterio 6: Restablecimiento Seguro de Datos Demo (P08)
```gherkin
Scenario: Restauración de fábrica de datos de prueba
  Given que el usuario ha modificado productos, creado pedidos y alterado stocks
  When pulsa el botón "Restablecer Datos Demo" en la barra de herramientas y confirma el diálogo modal
  Then el almacenamiento local se reinicializa con los 3 negocios y 12 productos originales
  And la sesión se preserva o se devuelve al selector de perfiles demo
  And se emite una notificación de éxito: "Datos de demostración restablecidos correctamente."
```
