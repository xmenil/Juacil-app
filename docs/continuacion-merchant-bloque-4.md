# Continuación de JUÁCIL: bloque 4 de merchant

## Encargo para el siguiente LLM

Implementa el bloque 4 pendiente: **Mi tienda / perfil del negocio**, siguiendo `juacil-ui` y `juacil-ux-review`. Los bloques 1, 2 y 3 ya se implementaron y verificaron. Conserva el trabajo actual y sus rutas.

El usuario autorizó **solo interfaz**: no cambiar la lógica de datos, tipos de dominio, llamadas al repositorio/API, permisos, claves de almacenamiento ni reglas de validación. Se pueden mejorar composición, CSS Modules, lenguaje, accesibilidad y estado de presentación. No implementar backend ni integraciones.

El usuario pidió utilizar agentes; se ha usado un agente para revisión de lectura. Puedes delegar la revisión UX, evitando que varios agentes editen los mismos archivos.

Al terminar, entrega un resumen breve, verificaciones y **la ruta concreta para visualizar Mi tienda**. No necesitas volver a pedir autorización para este bloque.

## Contexto y preferencias acordadas

- Proyecto local: `C:\Users\ThikPad\Desktop\PROYECTOS\Juacil-app`.
- React, TypeScript, Vite, React Router, React Hook Form, Zod, Lucide y CSS Modules.
- Skills locales:
  - [juacil-ui](../.agents/skills/juacil-ui/SKILL.md).
  - [juacil-ux-review](../.agents/skills/juacil-ux-review/SKILL.md).
- Leer instrucciones aplicables del repositorio, si existen, antes de editar.
- Consultar [requisitos](requisitos.md), [decisiones](decisiones.md), [dirección visual](JUACIL-prompt-maestro.md) y [calidad](calidad.md). El código actual es la evidencia de lo implementado; no convertir documentación antigua en ampliaciones automáticas.
- Identidad: JUÁCIL, «Tu tienda online», verde bosque, acento lima y superficies claras.
- Tokens: `src/app/styles/tokens.css`; estilos comunes: `src/app/styles/global.css`.
- Reutilizar `src/shared/ui` antes de crear componentes equivalentes.
- El usuario corrigió expresamente la composición: **sidebar oscuro en escritorio, como admin, y navegación fija inferior en móvil**. Ya está implementada. No regresar a navegación horizontal superior.
- Navegación merchant: **Resumen / Pedidos / Productos / Mi tienda**.
- Mantener una acción primaria por pantalla. Para este bloque: **Guardar cambios**.
- Evitar tarjetas anidadas, avisos técnicos repetidos, emojis, métricas inventadas y textos genéricos.
- No modificar `docs/image.png` ni `docs/image01.png`: son referencias añadidas por el usuario.

## Roles: explicación que ya recibió el usuario

Hay dos funciones distintas:

1. **Administrador general**, en `/admin`: gestiona plataforma, tiendas, usuarios y pedidos.
2. **Emprendedor**, en `/panel`: administra su negocio asignado.

El panel de una tienda no implica otro administrador general. El código permite al administrador entrar al dashboard merchant. Como su sesión no tiene `businessId`, el layout/dashboard usan el negocio demo `biz-cafe-aroma` por defecto. Esa conducta ya existía y **no se cambió**.

El layout muestra un aviso al administrador cuando entra al panel de tienda y un enlace «Volver al panel general». Las páginas independientes merchant conservan sus restricciones propias. No ampliar permisos para unificar pantallas.

## Estado del trabajo existente

### Bloque 1: estructura y resumen — terminado

- `src/app/layouts/MerchantLayout.tsx` y `.module.css`: sidebar, barra inferior móvil, identificación del negocio y del rol, aviso de contexto admin, salida y tienda pública.
- `src/pages/merchant-dashboard/MerchantSummary.tsx` y `.module.css`: pedidos pendientes, stock, cifras derivadas y pedidos recientes.
- Se retiraron la pausa sin efecto operativo, cifras de respaldo inventadas y calificaciones fijas.
- La selección de navegación se deriva de rutas/parámetros.
- `main` tiene `container-type: inline-size`; los componentes usan consultas de contenedor para adaptar columnas al espacio disponible junto al sidebar.
- En móvil el layout reserva `5rem + safe-area-inset-bottom` para la barra inferior.

### Bloque 2: pedidos — terminado

- `src/features/order-management/`: `OrderList.tsx`, `OrderDetail.tsx`, `Orders.module.css`, `orderFilters.ts`.
- `src/pages/merchant-orders/`: wrappers con los permisos y operaciones originales.
- Dashboard usa `?tab=pedidos&filtro=...&pedido=ID`; las rutas independientes siguen existiendo.
- Filtros y retorno conservados; detalle con siguiente paso, contacto, notas, snapshots, total e historial.
- Cancelación con modal y acciones compatibles con la máquina existente.
- No cambiar esta implementación incidentalmente al trabajar Mi tienda.

### Bloque 3: productos — terminado

- `src/features/product-management/ProductForm.tsx`: formulario reorganizado; esquema, valores iniciales, límites de archivo, FileReader y conversiones conservados.
- Nuevos componentes/estilos: `ProductList.tsx`, `ProductList.module.css`, `ProductForm.module.css`, `ProductPhoto.tsx`, `ProductEditorFrame.tsx`, `DeleteProductModal.tsx`, `productFilters.ts`.
- `src/pages/merchant-products/`: listado, creación y edición conservan operaciones y restricciones originales.
- Dashboard mantiene modales para crear/editar; no enviar al administrador a páginas independientes que lo rechazan.
- Búsqueda `q` y filtro `filtro` en URL.
- Cierre de modales consume los parámetros `crear`/`editar` para evitar reapertura accidental.
- Guardar admite publicado o borrador; no sustituirlo por «Publicar» indiscriminadamente.

## Bloque 4: alcance y archivos que debes inspeccionar

### Entrada principal: pestaña Mi tienda

Archivo: [MerchantDashboardPage.tsx](../src/pages/merchant-dashboard/MerchantDashboardPage.tsx).

Ruta: **`/panel?tab=perfil`**.

La pestaña está al final del dashboard, bajo el comentario «PESTAÑA 4: PERFIL Y DATOS DE LA TIENDA». Todavía usa estilos inline y la composición antigua. Es el destino real de «Mi tienda» en el sidebar.

Estados locales actuales:

- `storeName`, `storeCategory`, `storeLocation`.
- `storeWhatsapp`, `storeRuc`, `storeSchedule`.
- `storeDesc`, `storeLogoUrl`, `storeBannerUrl`.
- `storeUpdateSuccess`.

Handler: `handleSaveStoreProfile`.

Contrato actual de guardado:

- `LocalStoreRepository.saveBusiness({ ...business, ...campos })`.
- Nombre, WhatsApp, horario y descripción con `trim()`.
- RUC vacío pasa a `undefined`.
- Logo/banner vacíos conservan `business.logoUrl`/`business.bannerUrl`.
- Actualiza feedback local, lo retira a los 3500 ms y llama a `refresh()`.
- Los inputs de esta pestaña son controlados; **no tiene el mismo esquema Zod de la página independiente**.

**Conservar todos sus campos**, especialmente horario, logo y banner. No sustituir esta pestaña por un enlace a `/panel/negocio`, porque esa página tiene menos campos.

### Entrada independiente: perfil del negocio

Archivo: [MerchantBusinessPage.tsx](../src/pages/merchant-business/MerchantBusinessPage.tsx).

Ruta: **`/panel/negocio`**.

Actualmente contiene:

- React Hook Form + Zod, con `values` obtenidos del negocio.
- Nombre, categoría, localidad, WhatsApp, RUC y descripción.
- **No contiene horario, logo ni banner como campos editables**.
- Restricción `isMerchant && businessId`. Un administrador general no pasa este guard.
- Guarda mediante `LocalStoreRepository.saveBusiness`, conservando `...business`.
- Feedback local y temporizador de 3000 ms.
- Cancelar vuelve al dashboard.
- Columnas inline fijas `1fr 1fr`, padding de 32 px y textos antiguos.

Validaciones actuales que no debes cambiar:

| Campo | Regla |
| --- | --- |
| Nombre | Mínimo 3 caracteres |
| Categoría y localidad | No vacías |
| WhatsApp | `/^9\d{8}$/` |
| RUC | Vacío o exactamente 11 dígitos |
| Descripción | Mínimo 10 caracteres |

### Dependencias

- `src/app/layouts/MerchantLayout.tsx` y `.module.css`.
- `src/pages/merchant-dashboard/MerchantDashboardPage.module.css`.
- `src/app/router/AppRouter.tsx` y `ProtectedRoute.tsx`.
- `src/app/providers/SessionProvider.tsx`.
- `src/entities/business/model/types.ts`.
- `src/shared/lib/storage.ts`.
- `src/shared/config/constants.ts` y `routes.ts`.
- `src/shared/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx`, `Button.tsx`, `Alert.tsx`.
- Los componentes nuevos de pedidos/productos sirven como referencia visual; no duplicar sus estilos a ciegas.

## Propuesta de interfaz acordada para Mi tienda

### Usuario y tarea

Emprendedor que actualiza la información que ven sus compradores. Puede trabajar desde celular y tener poca experiencia digital.

Tarea principal: mantener claros los datos del negocio y su contacto.

### Acción y orden de lectura

- Acción primaria única: **Guardar cambios**.
- Primero: identificación e información del negocio.
- Segundo: contacto y horario, cuando ese campo ya existe.
- Tercero: imágenes existentes y acciones de guardado.

El enlace a la tienda pública ya existe en el layout. Mantenerlo como acción secundaria, sin otro CTA lima que compita con guardar.

### Composición

**Escritorio:**

- Mantener el sidebar y cabecera existentes.
- Formulario de ancho contenido, con título y ayuda breve.
- Agrupar campos con encabezados/fieldset y divisores.
- Dos columnas solo para campos cortos relacionados, según el ancho del contenedor.
- Descripción a ancho completo.
- Acciones al final y feedback cercano, legible.

**Móvil:**

- Una columna.
- Etiquetas persistentes, campos legibles y controles de al menos 44 px.
- Botones ajustables al ancho; no introducir otra barra fija de acciones encima de la navegación inferior.
- Contenido final y campos accesibles al desplazarse; respetar áreas seguras.
- No usar mínimos rígidos de 240/280 px dentro de tarjetas o modales estrechos.

### Agrupación de campos

1. **Información del negocio:** nombre, categoría, localidad, descripción; RUC opcional puede ir aquí.
2. **Contacto y horario:** WhatsApp y horario **solo en la entrada que ya lo tiene**.
3. **Imágenes de tu tienda:** enlace del logo y enlace de la portada **solo en la pestaña que ya los tiene**.

Puedes proponer una presentación compartida en `features/business-management/`, pero esta carpeta todavía no existe. Si la creas, debe ser UI: props/callbacks o slots para los campos. Mantener formularios/validaciones/operaciones en sus padres.

Compartir apariencia **no significa unificar esquemas, agregar campos a la ruta independiente ni eliminar campos del dashboard**. Si la extracción obliga a cambiar contratos, prioriza un CSS Module compartido y composiciones equivalentes con los handlers existentes.

### Textos propuestos

- Título: **Mi tienda**.
- Ayuda: «Actualiza la información que ven tus compradores».
- Campos: «Nombre del negocio», «Categoría», «Localidad», «Descripción», «WhatsApp», «RUC», «Horario de atención», «Enlace del logo», «Enlace de la portada».
- Ayuda WhatsApp: «Ingresa 9 dígitos, sin +51».
- Ayuda RUC: «Opcional. Ingresa 11 dígitos».
- Horario: «Indica los días y horas en que atiendes».
- Imágenes: explicar brevemente qué cambia en la tienda pública; no añadir subida de archivos si no existe.
- Botones: «Cancelar», «Guardar cambios».
- Confirmación: «Los datos de tu tienda se actualizaron».
- Negocio ausente: «No encontramos tu negocio» y retorno compatible con el permiso actual.
- Mantener reglas de error existentes; puedes simplificar su redacción sin cambiar validaciones.

En el dashboard no existe actualmente botón Cancelar. Si se añade, que sea una acción de navegación de UI claramente definida; no introducir escrituras de reversión ni modificar la lógica del negocio.

## Estados y límites

| Estado | Presentación requerida |
| --- | --- |
| Carga | Lectura local síncrona: no introducir esperas ni skeletons artificiales. Usar `isSubmitting` solo donde ya existe. |
| Campos opcionales vacíos | Ayuda breve; no inventar datos del negocio. |
| Negocio no encontrado | Mensaje y salida recuperable. |
| Error por campo | Junto al campo, conservando valores; asociar con atributos accesibles. |
| Error de persistencia | Solo si la operación actual lo comunica. No inventar detección. |
| Éxito | Feedback visible, asociado al guardado. Se puede ajustar su duración como estado de UI sin alterar la operación. |

### Límites conocidos que NO debes solucionar como parte del bloque visual

- `LocalStoreRepository.save()` captura fallos de localStorage y solo escribe en consola. `saveBusiness` no expone resultado de persistencia. La interfaz no puede garantizar el guardado si ese almacenamiento falla.
- La pestaña y la página independiente tienen validaciones diferentes. No reemplazar una por la otra silenciosamente.
- El administrador usa un negocio demo de respaldo en dashboard/layout. No cambiar ese fallback ni extender permisos.
- Sigue pendiente un problema previo: la edición de producto por `?editar=ID` en dashboard no comprueba propiedad. No es parte del bloque 4; no presentar el aislamiento global como resuelto.
- Datos/ubicaciones actuales incluyen ejemplos de Tingo María y Valle del Monzón. Preservar el contenido vigente; no migrar fixtures por una preferencia visual.
- No cambiar tipos de negocio, claves de almacenamiento, onboarding, stock, pedidos o carrito.

## Verificaciones y cierre

1. Revisar ambos accesos: `/panel?tab=perfil` y `/panel/negocio`.
2. Comprobar una cuenta merchant, negocio correcto y restricciones originales de la ruta independiente.
3. Verificar que nombre/categoría/localidad/WhatsApp/RUC/descripción funcionan como antes.
4. En dashboard, verificar horario/logo/banner y su conservación al guardar con valores vacíos conforme al handler actual.
5. Comprobar errores por campo en la página independiente, feedback, cancelar y navegación.
6. Confirmar resultado en la tienda pública sin activar contactos externos.
7. Probar 320, 360, 390, 768 y 1440 px, texto al 200%, nombres/descripciones largos, teclado y foco.
8. Mantener selección «Mi tienda» en sidebar/barra inferior, y que la barra no tape el final del formulario.
9. Ejecutar `npm run build`, `npm run lint` y `git diff --check`. Elegir pruebas acordes al cambio; no escribir pruebas que solo repliquen CSS/JSX.
10. Aplicar `juacil-ux-review` al resultado, corregir hallazgos dentro de alcance y comunicar límites de validación.

Los bloques anteriores pasaron compilación y lint sin errores, con advertencias existentes de React y tamaño del bundle. En el bloque 3 pasaron 10 pruebas existentes de dinero/almacenamiento/carrito y las pruebas de navegador de catálogo/formularios. No afirmar que `product-add.test.tsx` prueba el formulario: prueba el agregado al carrito.

## Estado del workspace y herramientas

- **Hay cambios sin commit de los bloques 1–3 y archivos nuevos sin seguimiento.** Revisar `git status`/`git diff` y conservarlos. No resetear, limpiar, sobrescribir con HEAD ni crear commits sin solicitud.
- Las capturas `docs/image.png` y `docs/image01.png` son archivos del usuario.
- El servidor local utilizado al cerrar el bloque 3 estaba en **`http://127.0.0.1:4173`**. Comprobar si sigue activo; no asumirlo en otra sesión.
- Rutas de acceso:
  - Sesión demo: `/acceso`.
  - Mi tienda principal: `/panel?tab=perfil`.
  - Perfil independiente: `/panel/negocio`.
- Para iniciar Vite si hace falta: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173`. El paso de argumentos de `npm run dev -- ...` falló en esta configuración PowerShell; el comando directo funcionó.
- En esta sesión algunas ejecuciones del shell dentro del sandbox fallaron al crear PowerShell con «Acceso denegado». `exec_command` con `require_escalated` funcionó tras revisión automática. No confundir ese fallo de herramienta con un problema del proyecto.
- Playwright ya estaba instalado fuera del repo en `%TEMP%/juacil-admin-preview/node_modules/playwright`; se utilizó Edge headless (`channel: 'msedge'`). Verificar disponibilidad en la nueva sesión antes de usarlo.
- Los scripts y capturas de comprobación están en TEMP y pueden desaparecer; no son pruebas versionadas:
  - `juacil-merchant-products-preview.cjs`, `juacil-products-final-check.cjs`.
  - `juacil-merchant-orders-preview.cjs`.
  - `juacil-merchant-products-captures/`, `juacil-merchant-orders-captures/`.
- Las pruebas de navegador usan contextos aislados y datos demo; no resetear el almacenamiento del navegador del usuario.
- Al probar scroll tras ampliar texto, dejar estabilizar layout y usar desplazamiento instantáneo para que una animación no cause falsos fallos.

## Respuesta esperada al usuario al finalizar

Indicar que el bloque 4 está implementado, qué cambió y qué se verificó. Confirmar que la lógica de datos permanece intacta y entregar la URL local comprobada de **`/panel?tab=perfil`**. Si no hubo navegador disponible, decirlo explícitamente y no afirmar validación visual.
