# JUÁCIL: Registro de Decisiones de Arquitectura y Diseño (ADR)

**Proyecto:** JUÁCIL – "Tu tienda online"  
**Fecha:** Octubre 2026  
**Estado:** Aprobado para implementación de prototipo

---

## ADR-01: Adopción de Feature-Sliced Design (FSD) para la Estructura Modular

### Contexto
El prototipo de JUÁCIL contempla múltiples dominios comerciales (negocios de la Selva, productos con inventario, carritos mono-negocio, pedidos con máquinas de estado y perfiles diferenciados). Una estructura plana por tipos de archivo (`components/`, `pages/`, `hooks/`) genera acoplamiento invisible y dificulta el aislamiento de permisos.

### Decisión
Adoptamos una variante pragmática de **Feature-Sliced Design (FSD)** con jerarquía estricta de importaciones unidireccionales (capas superiores solo importan de capas inferiores):
1. `src/app`: Composición raíz, proveedores globales (sesión demo, carrito, conectividad), enrutador y diseño de layouts.
2. `src/pages`: Ensamblado de pantallas completas (`home`, `catalog`, `product-detail`, `store-detail`, `checkout`, `panel-products`, etc.).
3. `src/widgets`: Bloques compuestos de UI de gran escala (Navbar unificado, Footer temático, Sidebar de panel, Drawer de carrito).
4. `src/features`: Casos de uso de usuario interactivos (`add-to-cart`, `sign-in`, `register-business`, `manage-product`, `cancel-order`).
5. `src/entities`: Modelos, tipos, schemas Zod, repositorios y componentes atómicos de dominio (`user`, `business`, `product`, `order`, `cart`).
6. `src/shared`: Componentes UI puros reutilizables (`Button`, `Input`, `Card`, `Badge`, `Modal`), utilidades neutrales de formato (`formatCurrency`, `formatDate`), configuración y tokens CSS.

### Consecuencias
- Cero dependencias circulares.
- Reglas de negocio protegidas dentro de las capas `entities` y `features`.
- Facilidad para sustituir los repositorios mock por APIs reales en una fase posterior.

---

## ADR-02: Manejo de Moneda Entera en Céntimos (PEN)

### Contexto
El uso de números flotantes de punto flotante de JavaScript (`0.1 + 0.2 !== 0.3`) introduce errores de redondeo inaceptables en transacciones comerciales y cálculo de impuestos.

### Decisión
Todos los precios, costos unitarios, subtotales y totales se definen como enteros estrictos que representan céntimos de Sol peruano:
- Ejemplo: `S/ 18.50` se modela como `1850`.
- Todas las operaciones aritméticas de suma y multiplicación se realizan sobre enteros.
- La visualización al usuario se delega exclusivamente a la función formateadora `formatMoney(cents)` que invoca `Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })`.
- Los inputs de formulario permiten ingreso decimal amigable y convierten bidireccionalmente a céntimos con esquemas Zod rigurosos.

---

## ADR-03: Persistencia Versionada en Almacenamiento Local y Resiliencia

### Contexto
El prototipo se ejecuta completamente en el cliente sin backend servidor. El usuario necesita recargar la página, cambiar entre páginas y mantener sus cambios de prueba (nuevos productos, pedidos registrados). Si la estructura del esquema cambia o el almacenamiento se corrompe, la aplicación no debe presentar pantallas en blanco.

### Decisión
Implementamos un adaptador `LocalStoreRepository` con versionado de clave (`juacil_data_v1.0`):
- Estructura atómica que aloja: `{ version, users, businesses, products, orders, cart }`.
- Validación inicial con Zod al hidratar el estado; si la deserialización falla o la versión no coincide, se aplica un mecanismo de autorecuperación seguro restaurando el catálogo demo inicial.
- Se implementa un comando visible de **Reset de Datos Demo** para que el evaluador pueda reiniciar el prototipo a su estado de fábrica en cualquier momento.
- Las imágenes demo se almacenan mediante fixtures estáticas optimizadas y URLs seguras, sin acumular blobs pesados en `localStorage`.

---

## ADR-04: Gestión de Estado Liviana sin Redux ni Zustand

### Contexto
El prototipo cuenta con necesidades de estado bien delimitadas: sesión demo activa, carrito actual y filtros de catálogo. Introducir bibliotecas pesadas de gestión de estado global como Redux Toolkit o Zustand añadiría sobrecarga innecesaria y rompería el principio YAGNI / KISS.

### Decisión
- **Estado de Navegación y Filtros**: Se gestiona puramente a través de URL Search Params (`?search=cafe&categoria=artesania&orden=precio_asc`), lo que permite enlaces compartibles, navegación con botones atrás/adelante nativos y bajo consumo de memoria.
- **Sesión y Carrito**: Contextos React delimitados (`SessionContext`, `CartContext`, `ConnectivityContext`).
- **Estado de Formularios**: `react-hook-form` con validación Zod, minimizando renders innecesarios.
- **Operaciones Asíncronas Mock**: Promesas simuladas con retraso deliberado (150-300ms) para exponer estados de carga reales (skeletons, spinners).

---

## ADR-05: Sistema de Diseño con Tokens CSS y CSS Modules

### Contexto
El proyecto requiere una estética de alta gama con identidad de la Selva peruana (verde bosque profundo, acento lima energético, tonos tierra neutros), cumpliendo con contrastes WCAG 2.2 AA y soporte responsivo móvil/escritorio.

### Decisión
- Tokens de diseño centralizados en variables CSS globales (`src/shared/styles/tokens.css`): paleta HSL/Hex, tipografía Inter/Outfit, escala de espaciado modular (4px, 8px, 12px, 16px, 24px, 32px), radios consistentes y sombras sutiles.
- CSS Modules (`.module.css`) para componentes individuales, garantizando encapsulamiento de estilos y ausencia de colisiones de nombres sin dependencias de compilación adicionales.
- Garantía de contraste: El texto sobre fondos verde oscuro es blanco o lima claro con ratio > 7:1; el texto sobre acento lima utiliza verde bosque ultraoscuro `#062413` para asegurar ratio > 4.5:1 (nunca blanco sobre lima).

---

## ADR-06: Aislamiento Estricto de Roles y Multi-Inquilino Demo

### Contexto
El sistema cuenta con dos tipos de roles activos para demostración:
1. `cliente`: Comprador que explora tiendas, añade al carrito y consulta solo sus pedidos.
2. `merchant`: Emprendedor que administra su MYPE asignada, sus productos propios y sus órdenes recibidas.

### Decisión
- Cada perfil demo tiene un identificador único y el rol de emprendedor está vinculado a un `businessId` inmutable.
- Los componentes de página administrativa verifican la propiedad del recurso consultando al repositorio mock; si el usuario intenta acceder a la edición de un producto que pertenece a otro `businessId`, se emite una redirección a `/403`.
- No existe rol de superadministrador en el alcance inicial (cumpliendo con la especificación).
- Selector rápido de usuarios en cabecera para facilitar las pruebas del evaluador con un solo clic.
