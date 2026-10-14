export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalogo',
  PRODUCT_DETAIL: (id: string = ':id') => `/productos/${id}`,
  STORE_DETAIL: (id: string = ':id') => `/tiendas/${id}`,
  HELP: '/ayuda',
  
  // Auth
  LOGIN: '/acceso',
  REGISTER_CUSTOMER: '/registro/cliente',
  REGISTER_BUSINESS: '/registro/emprendimiento',
  RECOVER_ACCESS: '/recuperar-acceso',
  
  // Cliente
  CART: '/carrito',
  CHECKOUT: '/pedido/confirmar',
  CUSTOMER_ORDERS: '/mis-pedidos',
  CUSTOMER_ORDER_DETAIL: (id: string = ':id') => `/mis-pedidos/${id}`,
  CUSTOMER_ACCOUNT: '/mi-cuenta',
  CUSTOMER_PROFILE: '/perfil',
  
  // Emprendedor / MYPE
  MERCHANT_DASHBOARD: '/panel',
  MERCHANT_BUSINESS: '/panel/negocio',
  MERCHANT_PRODUCTS: '/panel/productos',
  MERCHANT_PRODUCT_NEW: '/panel/productos/nuevo',
  MERCHANT_PRODUCT_EDIT: (id: string = ':id') => `/panel/productos/${id}/editar`,
  MERCHANT_ORDERS: '/panel/pedidos',
  MERCHANT_ORDER_DETAIL: (id: string = ':id') => `/panel/pedidos/${id}`,
  MERCHANT_NOTIFICATIONS: '/panel/notificaciones',

  // Super Administrador de Plataforma
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/usuarios',
  ADMIN_STORES: '/admin/tiendas',
  ADMIN_ORDERS: '/admin/pedidos',
  
  // Errores
  FORBIDDEN: '/403',
  NOT_FOUND: '/404',
} as const;
