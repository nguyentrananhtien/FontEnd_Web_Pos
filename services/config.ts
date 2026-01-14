export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
    TIMEOUT: 15000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,

    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },

    ENDPOINTS: {
        // Auth endpoints
        AUTH_REGISTER: '/api/v1/auth/register',
        AUTH_LOGIN: '/api/v1/auth/login',
        AUTH_LOGOUT: '/api/v1/auth/logout',
        AUTH_LOGOUT_ALL: '/api/v1/auth/logout-all',
        AUTH_REFRESH: '/api/v1/auth/refresh',
        AUTH_FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
        AUTH_RESET_PASSWORD: '/api/v1/auth/reset-password',
        AUTH_CURRENT_USER: '/api/v1/auth/me',

        // User endpoints
        USERS: '/api/v1/users',
        USER_BY_ID: (id: number) => `/api/v1/users/${id}`,
        USER_UPDATE: (id: number) => `/api/v1/users/${id}`,

        // Categories
        CATEGORIES: '/api/categories',
        CATEGORIES_ACTIVE: '/api/categories/active',
        CATEGORIES_SEARCH: '/api/categories/search',
        CATEGORY_BY_ID: (id: number) => `/api/categories/${id}`,
        DISHES: '/api/dishes',
        DISHES_ACTIVE: '/api/dishes/active',
        DISHES_VEGETARIAN: '/api/dishes/vegetarian',
        DISHES_VEGAN: '/api/dishes/vegan',
        DISHES_SPICY: '/api/dishes/spicy',
        DISHES_SEARCH: '/api/dishes/search',
        DISHES_BY_CATEGORY: (categoryId: number) => `/api/dishes/by-category/${categoryId}`,
        DISHES_BY_PRICE_RANGE: '/api/dishes/by-price-range',
        DISH_BY_ID: (id: number) => `/api/dishes/${id}`,
        ORDERS: '/api/orders',
        ORDER_BY_ID: (id: number) => `/api/orders/${id}`,
        ORDERS_BY_CUSTOMER: (customerId: number) => `/api/orders/by-customer/${customerId}`,
        ORDERS_BY_STATUS: (status: string) => `/api/orders/by-status/${status}`,
        ORDERS_BY_PAYMENT_STATUS: (paymentStatus: string) => `/api/orders/by-payment-status/${paymentStatus}`,
        ORDER_STATUS: (id: number) => `/api/orders/${id}/status`,
        ORDER_PAYMENT_STATUS: (id: number) => `/api/orders/${id}/payment-status`,
        PAYMENT_CREATE: '/api/payment/create',
        PAYMENT_VNPAY_RETURN: '/api/payment/vnpay-return',
        PAYMENT_BY_TXN: (txnRef: string) => `/api/payment/txn/${txnRef}`,
        PAYMENT_BY_ORDER: (orderId: number) => `/api/payment/order/${orderId}`,
        PAYMENT_BY_USER: (userId: number) => `/api/payment/user/${userId}`,
        CART: '/api/cart',
        CART_BY_SESSION: (sessionId: string) => `/api/cart/${sessionId}`,
        CART_ITEMS: (sessionId: string) => `/api/cart/${sessionId}/items`,
        CART_ITEM: (sessionId: string, itemId: number) => `/api/cart/${sessionId}/items/${itemId}`,
        CART_CLEAR: (sessionId: string) => `/api/cart/${sessionId}/clear`,
        SEARCH: '/api/search',
        TABLES: '/api/tables',
        TABLE_BY_ID: (id: number) => `/api/tables/${id}`,
    }
};
