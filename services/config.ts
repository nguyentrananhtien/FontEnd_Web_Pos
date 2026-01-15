/**
 * API Configuration - Complete endpoint mapping based on API Documentation
 * Version: 1.0
 * Last Updated: January 2026
 */

export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second

    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },

    ENDPOINTS: {
        // ==================== 1. Authentication & Account Management ====================
        AUTH_REGISTER: '/api/v1/auth/register',
        AUTH_LOGIN: '/api/v1/auth/login',
        AUTH_CURRENT_USER: '/api/v1/auth/me',
        AUTH_PHONE_LOGIN: '/api/v1/auth/phone-login',
        AUTH_FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
        AUTH_RESET_PASSWORD: '/api/v1/auth/reset-password',
        AUTH_REFRESH: '/api/v1/auth/refresh',
        AUTH_LOGOUT: '/api/v1/auth/logout',
        AUTH_LOGOUT_ALL: '/api/v1/auth/logout-all',

        // Account Management
        ACCOUNT_BY_ID: (id: number) => `/api/v1/accounts/${id}`,
        ACCOUNTS_ALL: '/api/v1/accounts',
        ACCOUNT_UPDATE: (id: number) => `/api/v1/accounts/${id}`,
        ACCOUNT_DELETE: (id: number) => `/api/v1/accounts/${id}`,

        // User shortcuts (same as Account)
        USER_BY_ID: (id: number) => `/api/v1/accounts/${id}`,
        USER_UPDATE: (id: number) => `/api/v1/accounts/${id}`,

        // ==================== 2. Global Search ====================
        SEARCH: '/api/search',

        // ==================== 3. Cart Management ====================
        // Session-based cart (Guest users)
        CART_BY_SESSION: (sessionId: string) => `/api/cart/${sessionId}`,
        CART_SESSION_ADD_ITEM: (sessionId: string) => `/api/cart/${sessionId}/items`,
        CART_SESSION_UPDATE_ITEM: (sessionId: string, itemId: number) => `/api/cart/${sessionId}/items/${itemId}`,
        CART_SESSION_REMOVE_ITEM: (sessionId: string, itemId: number) => `/api/cart/${sessionId}/items/${itemId}`,
        CART_SESSION_CLEAR: (sessionId: string) => `/api/cart/${sessionId}/clear`,

        // User-based cart (Authenticated users)
        CART_BY_USER: (userId: number) => `/api/cart/user/${userId}`,
        CART_USER_ADD_ITEM: (userId: number) => `/api/cart/user/${userId}/items`,
        CART_USER_CLEAR: (userId: number) => `/api/cart/user/${userId}/clear`,

        // Cart merge & admin
        CART_MERGE: '/api/cart/merge', // ?sessionId=X&userId=Y
        CART_ADMIN_ALL: '/api/cart/admin/all',
        CART_ADMIN_DELETE_EXPIRED: '/api/cart/admin/expired',

        // Legacy support
        CART_ITEMS: (sessionId: string) => `/api/cart/${sessionId}/items`,
        CART_ITEM: (sessionId: string, itemId: number) => `/api/cart/${sessionId}/items/${itemId}`,
        CART_CLEAR: (sessionId: string) => `/api/cart/${sessionId}/clear`,

        // ==================== 4. Order Management ====================
        ORDERS: '/api/orders',
        ORDER_BY_ID: (id: number) => `/api/orders/${id}`,
        ORDERS_BY_CUSTOMER: (customerId: number) => `/api/orders/by-customer/${customerId}`,
        ORDERS_BY_RESERVATION: (reservationId: number) => `/api/orders/by-reservation/${reservationId}`,
        ORDERS_BY_STATUS: (status: string) => `/api/orders/by-status/${status}`,
        ORDERS_BY_PAYMENT_STATUS: (paymentStatus: string) => `/api/orders/by-payment-status/${paymentStatus}`,
        ORDERS_BY_DATE_RANGE: '/api/orders/by-date-range', // ?start=X&end=Y
        ORDER_CREATE: '/api/orders',
        ORDER_UPDATE: (id: number) => `/api/orders/${id}`,
        ORDER_UPDATE_STATUS: (id: number) => `/api/orders/${id}/status`, // ?status=X
        ORDER_UPDATE_PAYMENT_STATUS: (id: number) => `/api/orders/${id}/payment-status`, // ?paymentStatus=X
        ORDER_DELETE: (id: number) => `/api/orders/${id}`,

        // Legacy support
        ORDER_STATUS: (id: number) => `/api/orders/${id}/status`,
        ORDER_PAYMENT_STATUS: (id: number) => `/api/orders/${id}/payment-status`,

        // ==================== 5. Dish & Menu Management ====================
        DISHES: '/api/dishes',
        DISHES_ACTIVE: '/api/dishes/active',
        DISHES_VEGETARIAN: '/api/dishes/vegetarian',
        DISHES_VEGAN: '/api/dishes/vegan',
        DISHES_SPICY: '/api/dishes/spicy',
        DISHES_SEARCH: '/api/dishes/search', // ?name=X
        DISHES_BY_CATEGORY: (categoryId: number) => `/api/dishes/by-category/${categoryId}`,
        DISHES_BY_PRICE_RANGE: '/api/dishes/by-price-range', // ?minPrice=X&maxPrice=Y
        DISHES_BY_ALLERGEN: (allergenId: number) => `/api/dishes/by-allergen/${allergenId}`,
        DISHES_BY_INGREDIENT: (ingredientId: number) => `/api/dishes/by-ingredient/${ingredientId}`,
        DISH_BY_ID: (id: number) => `/api/dishes/${id}`,
        DISH_CREATE: '/api/dishes',
        DISH_UPDATE: (id: number) => `/api/dishes/${id}`,
        DISH_DELETE: (id: number) => `/api/dishes/${id}`,
        DISH_ACTIVATE: (id: number) => `/api/dishes/${id}/activate`,
        DISH_DEACTIVATE: (id: number) => `/api/dishes/${id}/deactivate`,

        // ==================== 6. Category Management ====================
        CATEGORIES: '/api/categories',
        CATEGORIES_ACTIVE: '/api/categories/active',
        CATEGORIES_SEARCH: '/api/categories/search', // ?name=X
        CATEGORY_BY_ID: (id: number) => `/api/categories/${id}`,
        CATEGORY_CREATE: '/api/categories',
        CATEGORY_UPDATE: (id: number) => `/api/categories/${id}`,
        CATEGORY_DELETE: (id: number) => `/api/categories/${id}`,

        // ==================== 7. Ingredient Management ====================
        INGREDIENTS: '/api/ingredients',
        INGREDIENTS_SEARCH: '/api/ingredients/search', // ?name=X
        INGREDIENT_BY_ID: (id: number) => `/api/ingredients/${id}`,
        INGREDIENT_CREATE: '/api/ingredients',
        INGREDIENT_UPDATE: (id: number) => `/api/ingredients/${id}`,
        INGREDIENT_DELETE: (id: number) => `/api/ingredients/${id}`,

        // ==================== 8. Allergen Management ====================
        ALLERGENS: '/api/allergens',
        ALLERGENS_SEARCH: '/api/allergens/search', // ?name=X
        ALLERGEN_BY_ID: (id: number) => `/api/allergens/${id}`,
        ALLERGEN_CREATE: '/api/allergens',
        ALLERGEN_UPDATE: (id: number) => `/api/allergens/${id}`,
        ALLERGEN_DELETE: (id: number) => `/api/allergens/${id}`,

        // ==================== 9. Payment & VNPay ====================
        PAYMENT_CREATE: '/api/payment/create',
        PAYMENT_CREATE_FROM_INVOICE: (invoiceId: number) => `/api/payment/create-from-invoice/${invoiceId}`, // ?userId=X
        PAYMENT_VNPAY_RETURN: '/api/payment/vnpay-return',
        PAYMENT_BY_TXN: (txnRef: string) => `/api/payment/txn/${txnRef}`,
        PAYMENT_BY_ORDER: (orderId: number) => `/api/payment/order/${orderId}`,
        PAYMENT_BY_USER: (userId: number) => `/api/payment/user/${userId}`,

        // ==================== 10. Invoice Management ====================
        INVOICES: '/api/invoices',
        INVOICE_BY_ID: (id: number) => `/api/invoices/${id}`,
        INVOICE_CREATE: '/api/invoices',
        INVOICE_FROM_ORDER: (orderId: number) => `/api/invoices/from-order/${orderId}`, // ?discount=X
        INVOICE_BY_ORDER: (orderId: number) => `/api/invoices/order/${orderId}`,
        INVOICE_BY_USER: (userId: number) => `/api/invoices/user/${userId}`,
        INVOICE_UPDATE: (id: number) => `/api/invoices/${id}`,
        INVOICE_UPDATE_STATUS: (id: number) => `/api/invoices/${id}/status`, // ?status=X
        INVOICE_FINAL_AMOUNT: (id: number) => `/api/invoices/${id}/final-amount`,
        INVOICE_DELETE: (id: number) => `/api/invoices/${id}`,

        // ==================== 11. Notification Management ====================
        NOTIFICATIONS: '/api/notifications',
        NOTIFICATION_CREATE: '/api/notifications',
        NOTIFICATION_SEND: '/api/notifications/send', // ?userId=X&notificationId=Y
        NOTIFICATIONS_BY_USER: (userId: number) => `/api/notifications/user/${userId}`,
        NOTIFICATIONS_UNREAD: (userId: number) => `/api/notifications/user/${userId}/unread`,
        NOTIFICATIONS_UNREAD_COUNT: (userId: number) => `/api/notifications/user/${userId}/unread/count`,
        NOTIFICATION_MARK_READ: (id: number) => `/api/notifications/read/${id}`,
        NOTIFICATIONS_BY_TYPE: (type: string) => `/api/notifications/type/${type}`,
        NOTIFICATIONS_BY_PRIORITY: (priority: string) => `/api/notifications/priority/${priority}`,

        // ==================== 12. Push Notification Management ====================
        PUSH_TOKEN_REGISTER: '/api/v1/users/push-token',
        PUSH_TOKEN_REMOVE: '/api/v1/users/push-token', // DELETE ?userId=X&pushToken=Y

        // ==================== 13. Table Management ====================
        TABLES: '/api/tables',
        TABLE_BY_ID: (id: number) => `/api/tables/${id}`,
        TABLE_CREATE: '/api/tables',
        TABLE_UPDATE: (id: number) => `/api/tables/${id}`,
        TABLE_DELETE: (id: number) => `/api/tables/${id}`,
        TABLE_UPDATE_STATUS: (tableCode: string) => `/api/tables/${tableCode}/status`,
        TABLE_BOOK: (tableCode: string) => `/api/tables/${tableCode}/book`,
        TABLE_CHECK_IN: '/api/tables/check-in',
        TABLE_AVAILABILITY: '/api/tables/availability', // ?date=X&slotId=Y

        // ==================== 14. Reservation Management ====================
        RESERVATIONS: '/api/reservations',
        RESERVATION_BY_ID: (id: number) => `/api/reservations/${id}`,
        RESERVATIONS_BY_USER: (userId: number) => `/api/reservations/user/${userId}`,
        RESERVATIONS_ACTIVE_BY_USER: (userId: number) => `/api/reservations/user/${userId}/active`,
        RESERVATION_CREATE: '/api/reservations',
        RESERVATION_UPDATE: (id: number) => `/api/reservations/${id}`,
        RESERVATION_DELETE: (id: number) => `/api/reservations/${id}`,

        // ==================== 15. Time Slot Management ====================
        TIME_SLOTS: '/api/timeslots',
        TIME_SLOT_BY_ID: (id: number) => `/api/timeslots/${id}`,
        TIME_SLOTS_LABELS: '/api/timeslots/all-label',

        // ==================== 16. Email Service ====================
        EMAIL_SEND: '/api/emails/send',
    },
} as const;

console.log('🌐 API Config Loaded - Base URL:', API_CONFIG.BASE_URL);

