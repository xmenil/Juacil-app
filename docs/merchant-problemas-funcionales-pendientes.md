# Problemas funcionales pendientes de JUÁCIL

Este documento complementa [el traspaso del bloque 4 de merchant](continuacion-merchant-bloque-4.md). Describe problemas y decisiones funcionales que quedaron fuera de los bloques 1–3 porque el usuario autorizó **solo interfaz**, conservando datos, tipos, operaciones y permisos.

**Estado:** diagnóstico documentado; no se implementaron las correcciones descritas aquí. Solicitar alcance funcional explícito antes de cambiar repositorio, reglas o permisos. La petición de crear este documento no autoriza corregirlos.

Las referencias corresponden al código revisado al escribir este archivo. Las líneas pueden cambiar. Distinguir evidencia de código, comportamiento ya comprobado y riesgos pendientes de reproducción.

## Prioridades

| Prioridad | Pendiente | Consecuencia principal |
| --- | --- | --- |
| Crítico | Edición de producto ajeno mediante parámetro del dashboard | Modificación y posible traslado entre negocios |
| Importante | Fallos de almacenamiento ocultos con respuestas de éxito | La persona cree que guardó cambios que no persistieron |
| Importante | Fotografías grandes guardadas como data URL | Riesgo de agotar almacenamiento y activar el problema anterior |
| Importante | Validaciones distintas en los dos perfiles del negocio | Se admiten datos por una entrada que la otra rechaza |
| Decisión de alcance | Acceso admin a merchant y negocio demo de respaldo | Contexto y alcance de gestión no seleccionados explícitamente |
| Importante | Mensaje WhatsApp del dashboard orientado al interlocutor equivocado | Texto de coordinación confuso aunque el enlace sea válido |

Orden recomendado: aislamiento de productos, contrato de persistencia y manejo de imágenes. Después, acordar validaciones y política de acceso; corregir el mensaje de coordinación.

## 1. Edición de productos ajenos desde el dashboard

**Prioridad:** crítico.

### Evidencia

- `src/pages/merchant-dashboard/MerchantDashboardPage.tsx:60`: lee `searchParams.get('editar')`.
- En `:62` busca mediante `LocalStoreRepository.getProductById(editId)`.
- Si existe, lo asigna a `editingProduct` sin comprobar `found.businessId === business.id`.
- `handleEditProductSubmit`, alrededor de `:154`, guarda usando el ID del producto encontrado, pero asigna `businessId: business.id`.
- `src/shared/lib/storage.ts:183`, `saveProduct`, reemplaza el producto por ID; no aplica comprobación de propietario.

La página independiente `src/pages/merchant-products/MerchantProductEditPage.tsx` sí rechaza productos cuyo `businessId` no coincide con el de la sesión. Proteger una ruta no protege automáticamente la variante con parámetros del dashboard.

### Efecto

Un emprendedor puede introducir el ID de un producto de otro negocio en:

```text
/panel?tab=productos&editar=ID_AJENO
```

El modal puede mostrarlo. Al guardar, puede modificar ese producto y cambiar su negocio al negocio activo. Esto contradice el aislamiento demo requerido. No es una afirmación de seguridad de backend: JUÁCIL sigue siendo un prototipo local.

**Verificación actual:** confirmado por lectura de código. No se ejecutó esta operación sobre datos del usuario ni se realizó una reproducción destructiva en su navegador.

### Corrección funcional propuesta

- Verificar propiedad al resolver el ID antes de abrir el modal.
- Volver a comprobarla al guardar; no confiar solamente en el filtro visual del listado.
- Conservar el `businessId` del recurso válido en vez de reasignarlo incidentalmente.
- Acordar el caso admin conforme a la política del punto 5, sin conceder permisos nuevos automáticamente.
- Mantener recuperación para producto inexistente y rechazo para recurso ajeno.
- Evaluar una función común de acceso a recursos para evitar diferencias entre ruta independiente y dashboard.

### Pruebas de aceptación

En un contexto aislado, con dos emprendedores y productos propios/ajenos:

1. Editar un producto propio debe seguir funcionando.
2. URL ajena en ruta independiente y en dashboard debe rechazarse.
3. No deben mostrarse datos del producto ajeno.
4. Intentar guardar no debe cambiar nombre, precio, stock, negocio ni fechas del recurso ajeno.
5. Un ID inexistente debe ofrecer salida recuperable.
6. Verificar que parámetros codificados o cambio manual de URL no omitan la comprobación.

## 2. Persistencia: errores ocultos y éxito aparente

**Prioridad:** importante; puede causar pérdida de cambios desde la perspectiva del usuario.

### Evidencia

`src/shared/lib/storage.ts:64`:

```ts
private static save(data: StorageSchema): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error al persistir en localStorage:', e);
  }
}
```

El error no se propaga ni se devuelve al llamador.

Ejemplos de métodos que comunican resultado favorable después de llamar a `save`:

- `saveBusiness`, alrededor de `:131`: devuelve el negocio.
- `saveProduct`, alrededor de `:183`: devuelve el producto.
- `deleteProduct`, alrededor de `:200`: puede devolver `true` aunque falle la persistencia.
- `createOrder`, alrededor de `:319`: devuelve `success: true`.
- `updateOrderStatus`, alrededor de `:366`: devuelve `success: true`.

Los formularios y las acciones muestran confirmación, cierran modales o navegan a partir de esas respuestas. Ejemplo: `MerchantDashboardPage.tsx:193` muestra éxito al guardar Mi tienda.

### Efecto

Si localStorage rechaza la escritura, la persona puede ver «guardado» o un estado exitoso sin que el nuevo estado se haya almacenado. Tras volver a leer o recargar, pueden reaparecer los valores anteriores.

El efecto no se limita a merchant: el repositorio es compartido. Al corregirlo habrá que revisar consumidores, no cambiar un solo mensaje.

**Verificación actual:** mecanismo confirmado por código. No se inyectó un fallo de cuota en el navegador del usuario. Las pruebas de guardado normal sí pasaron; eso no demuestra el comportamiento ante una escritura fallida.

### Corrección funcional propuesta

- Definir un contrato explícito de éxito/error de persistencia: resultado tipado o excepción controlada.
- Actualizar consumidores para que éxito, cierre y navegación ocurran solo cuando la escritura se confirme.
- Conservar lo ingresado ante fallo y permitir reintento.
- No prometer un guardado exitoso a partir de un cambio de estado local.
- Preservar claves, datos existentes, cálculos en céntimos, snapshots y reglas de stock.
- Revisar lectura/autorecuperación del repositorio cuando la escritura de datos iniciales también falle; no introducir borrados ni resets como recuperación silenciosa.

Esta corrección puede requerir cambiar firmas de métodos y sus consumidores. **No cabe dentro de un rediseño exclusivamente visual.**

### Pruebas de aceptación

Simular `localStorage.setItem` lanzando una excepción en pruebas aisladas:

1. Guardar perfil/producto debe informar fallo y conservar el formulario.
2. No cerrar ni anunciar éxito incorrectamente.
3. Cambiar o cancelar un pedido no debe devolver éxito si el estado no se almacenó.
4. Eliminar no debe anunciar eliminación persistida ante fallo de escritura.
5. Al recuperar almacenamiento y reintentar, la operación debe completarse una sola vez.
6. Comprobar consistencia entre pedido y stock, y evitar reposición doble al cancelar.
7. Confirmar que los recorridos normales continúan funcionando.

## 3. Fotografías grandes y almacenamiento local

**Prioridad:** importante; riesgo ligado al punto 2.

### Evidencia

- `src/features/product-management/ProductForm.tsx:98`, `processFile`.
- Acepta archivos de imagen hasta **15 MB**, comprobando `file.size`.
- `:118` usa `FileReader.readAsDataURL(file)`.
- El resultado se guarda como `imageUrl` del producto.
- El repositorio serializa el conjunto de datos en localStorage.

Una data URL añade codificación y metadatos al archivo original. El límite admitido por el selector no equivale al espacio disponible en almacenamiento. Ese espacio varía; no asumir una cuota universal ni afirmar un máximo exacto sin medirlo.

### Efecto

Una o varias fotografías grandes pueden superar el espacio disponible. En la implementación actual, ese fallo queda oculto por `save()`. La vista previa puede funcionar porque tiene la imagen en memoria mientras el producto no llega a persistir.

**Verificación actual:** lectura de código. Se comprobó que el formulario rechaza archivos mayores a 15 MB y acepta una imagen pequeña. No se comprobó la persistencia de una imagen cercana a ese máximo.

### Corrección funcional propuesta

Acordar una estrategia compatible con el prototipo antes de implementar:

- Limitar tamaño de entrada y/o reducir dimensiones/calidad antes de persistir.
- Distinguir tamaño del archivo de tamaño codificado y espacio restante.
- Si se adopta otro almacenamiento local, planificar compatibilidad y migración; no introducirlo como cambio incidental.
- Informar que la foto no pudo guardarse, conservando el resto del formulario.
- No sustituir por subida remota, backend ni servicio de imágenes sin autorización.

### Pruebas de aceptación

- Imagen pequeña válida, archivo inválido y archivo sobre el límite.
- Imágenes grandes y varios productos con fotos bajo cuota restringida.
- Error visible, sin falso éxito ni pérdida del formulario.
- Persistencia y recuperación después de recargar.
- Comportamiento adecuado en móvil, sin congelamientos ni operaciones externas.

## 4. Validaciones distintas en Mi tienda

**Prioridad:** importante; pendiente de decisión funcional.

### Evidencia

Hay dos entradas:

1. `/panel?tab=perfil`, dentro de `MerchantDashboardPage.tsx`.
2. `/panel/negocio`, en `MerchantBusinessPage.tsx`.

La ruta independiente utiliza `businessSchema` y React Hook Form:

- Nombre: mínimo 3 caracteres.
- Categoría y localidad no vacías.
- WhatsApp: `/^9\d{8}$/`.
- RUC vacío o 11 dígitos.
- Descripción: mínimo 10 caracteres.

La pestaña utiliza inputs controlados. Su handler aplica `trim()`, pero no el mismo esquema. El atributo visual `isRequired` muestra una marca; no equivale por sí solo a esa validación Zod.

Además, la pestaña tiene horario, logo y banner; la ruta independiente no permite editar esos tres campos.

### Efecto

Un dato puede guardarse por una entrada y ser rechazado por la otra. Esto afecta especialmente teléfono, RUC, nombre y descripción. Las diferencias de campos también impiden reemplazar una entrada por la otra sin perder capacidades visibles.

**Verificación actual:** confirmada por lectura. No se probaron todos los valores inválidos en la pestaña.

### Corrección funcional propuesta

- Acordar cuáles deben ser las reglas comunes y qué campos pertenecen a cada entrada.
- Si se autoriza unificar validación, hacerlo explícitamente y conservar campos/valores.
- Mantener errores por campo y valores ingresados.
- No copiar el esquema de la ruta independiente al dashboard durante el bloque 4 sin autorización: eso cambia los valores admitidos.
- La interfaz puede compartir grupos, estilos y textos mientras conserva los contratos actuales.

### Pruebas de aceptación

Después de acordar las reglas:

- Probar nombre/descripción cortos, espacios, teléfono inválido y RUC vacío/inválido.
- Verificar resultado equivalente en los campos comunes de ambas entradas.
- Confirmar que horario, logo y banner siguen disponibles donde ya existían.
- No borrar imágenes previas al guardar enlaces vacíos si la regla acordada sigue siendo conservarlas.

## 5. Acceso admin a merchant y negocio de respaldo

**Clasificación:** decisión de alcance/permisos; no tratar el acceso del administrador como vulnerabilidad por sí mismo.

### Evidencia

- `src/app/router/ProtectedRoute.tsx`: una ruta merchant permite también `isAdmin`.
- `src/app/providers/SessionProvider.tsx`: `businessId` se obtiene para merchant; una cuenta admin no tiene negocio asignado mediante ese valor.
- `MerchantLayout.tsx:21` y `MerchantDashboardPage.tsx:34` usan `businessId || 'biz-cafe-aroma'`.
- Las páginas independientes de productos, pedidos y negocio conservan guards más restrictivos de merchant/propiedad.

El usuario observó «Admin General JUÁCIL» dentro de una tienda y pidió aclaración. Ya se explicó la diferencia de roles y se agregó un aviso de contexto con retorno al panel general. **La interfaz quedó más clara, pero la política y el fallback siguen igual.**

### Efecto

El administrador entra a un negocio demo sin seleccionarlo explícitamente. Un emprendedor sin `businessId` también puede caer en ese fallback del dashboard. Las entradas independientes no tienen necesariamente las mismas capacidades de acceso.

No asumir que todos los administradores deben tener un negocio ni que hay que prohibir toda gestión general de tiendas.

### Decisión propuesta

- Definir si admin puede gestionar tiendas desde merchant o debe hacerlo solo desde su panel general.
- Si puede hacerlo, acordar selección explícita de negocio y contexto inequívoco.
- Definir qué ocurre con merchant sin negocio asignado: recuperación/onboarding/denegación según producto; no asignarle silenciosamente otro negocio.
- Hacer coherentes los guards conforme a esa política, sin abrir recursos ajenos a emprendedores.

### Pruebas de aceptación

Una vez acordada la política:

- Admin general, merchant con negocio y merchant sin negocio.
- Entrada por dashboard, rutas independientes y URL manipulada.
- Negocio visible y negocio realmente modificado coincidentes.
- Mantener al emprendedor aislado de otros negocios.
- Avisos y retorno adecuados sin cambios de sesión inesperados.

## 6. Mensaje WhatsApp del dashboard orientado al comprador

**Prioridad:** importante para claridad de coordinación.

### Evidencia

- `src/shared/lib/whatsapp.ts:33`, `buildOrderWhatsAppMessage`, construye un texto orientado a un comprador que escribe al negocio.
- Comienza saludando al `businessName` y pregunta por coordinación de pago/entrega.
- `MerchantDashboardPage.tsx:226` usa ese helper en el detalle merchant.
- `:240` crea el enlace con **el teléfono del cliente**.
- La página independiente `MerchantOrderDetailPage.tsx` usa un mensaje distinto, que sí presenta al negocio hablando con el cliente.

### Efecto

El enlace puede ser técnicamente válido, pero el texto saluda al negocio cuando el destinatario es el cliente. El emprendedor debe corregir el mensaje antes de enviarlo. «Abrir WhatsApp» no significa que el mensaje ya haya sido enviado.

**Verificación actual:** confirmado al inspeccionar la construcción del texto y el destinatario. Las pruebas comprobaron el enlace sin abrir contactos externos.

### Corrección propuesta

- Crear/reutilizar un generador específico negocio → cliente con código de pedido y estado.
- Conservar el helper comprador → negocio para sus consumidores correctos.
- No modificar globalmente el helper y romper checkout u otros recorridos.
- Usar el mismo texto coherente en ambas entradas merchant cuando se autorice esa corrección.
- No enviar mensajes automáticamente.

### Pruebas de aceptación

- Número del cliente normalizado correctamente.
- Saludo al cliente, identificación del negocio, código y estado correctos.
- Texto codificado en URL sin pérdida de caracteres.
- Ningún cambio en el mensaje comprador → negocio.
- Validar el enlace generado sin contactar a una persona real.

## Hallazgos anteriores que ya se atendieron

No reabrir estos puntos como si siguieran pendientes en las vistas rediseñadas:

- Ventas de respaldo, calificación y satisfacción inventadas: retiradas.
- Pausa de pedidos que solo cambiaba un indicador: retirada de la interfaz; no se implementó una pausa operativa.
- Actualización visible al publicar/pasar a borrador en el listado independiente: se corrigió el refresco de UI.
- Listado sin vacío diferenciado o recuperación: corregido en pedidos/productos.
- Controles de pedidos/productos repetidos entre dashboard y rutas: ahora comparten presentación.
- Botones dentro de enlaces en las vistas intervenidas: corregidos.
- Cancelación ofrecida en preparado: la UI actual usa la máquina existente y no ofrece esa acción.
- Reapertura de modales por parámetros `crear`/`editar` al cerrarlos: se consumen esos parámetros.
- Sidebar escritorio y navegación inferior móvil: implementados y verificados.

El bloque 4 de Mi tienda aún conserva composición y estilos antiguos. Eso es trabajo de interfaz pendiente, detallado en el otro documento, y no debe mezclarse con una autorización para modificar reglas.

## Documentación y evidencia

`docs/calidad.md` contiene afirmaciones de aislamiento y fiabilidad completos. El hallazgo 1 y la persistencia del punto 2 limitan esas afirmaciones.

Al resolver problemas funcionales, actualizar las afirmaciones con pruebas realmente ejecutadas. No presentar la revisión visual de los bloques 1–3 como auditoría exhaustiva de seguridad, fiabilidad o compatibilidad multi-navegador.

Los tests existentes pasaron en los escenarios normales seleccionados y se comprobaron recorridos en Edge headless. Eso no demuestra que los casos de fallo descritos aquí estén cubiertos.

## Reglas para retomar este trabajo

- Mantener los cambios sin commit y archivos nuevos de los bloques 1–3; no resetear el workspace.
- No tocar las capturas añadidas por el usuario.
- Leer las skills de JUÁCIL y los archivos citados.
- Antes de corregir, distinguir reparación funcional autorizada de rediseño visual.
- Añadir pruebas de regresión que reproduzcan el problema, especialmente aislamiento y persistencia; no limitarse a pruebas que repliquen la implementación.
- Usar contextos y almacenamiento aislados. No borrar datos del navegador del usuario ni activar WhatsApp real.
- Preservar céntimos, snapshots de pedidos, estados permitidos, carrito de un negocio y reposición de stock una sola vez.
- Al cerrar, indicar qué quedó resuelto, qué se probó y qué sigue pendiente.
