import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from './config';
import type {
  CategoryDTO,
  DishDTO,
  OrderDTO,
  CartDTO,
  CartItemDTO,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
} from './types';

// ============================================
// AXIOS INSTANCE SETUP
// ============================================

/**
 * Create and configure the axios instance
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor - Log all outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`);
    if (config.params) console.log('   Params:', config.params);
    if (config.data) console.log('   Data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ [API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Log responses and handle errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ [API] ${response.status} - ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    };

    console.error('❌ [API] Response Error:', errorDetails);

    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ [API] Request timeout');
    } else if (!error.response) {
      console.error('🔌 [API] Network error - Backend server might be offline');
    } else if (error.response.status >= 500) {
      console.error('🔥 [API] Server error');
    } else if (error.response.status === 404) {
      console.error('🔍 [API] Resource not found');
    } else if (error.response.status === 401) {
      console.error('🔐 [API] Unauthorized');
    } else if (error.response.status === 403) {
      console.error('🚫 [API] Forbidden');
    }

    return Promise.reject(error);
  }
);

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Retry logic for failed requests
 */
const retryRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  maxRetries: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<AxiosResponse<T>> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      console.log(`🔄 [API] Retry attempt ${attempt}/${maxRetries}`);

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt)
      );
    }
  }
  throw new Error('Max retries exceeded');
};

// ============================================
// AUTHENTICATION API
// ============================================

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH_REGISTER,
      data
    );
    if (response.data.token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH_LOGIN,
      data
    );
    if (response.data.token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.delete(API_CONFIG.ENDPOINTS.AUTH_LOGOUT);
    delete axiosInstance.defaults.headers.common['Authorization'];
  },

  logoutAll: async (): Promise<void> => {
    await axiosInstance.delete(API_CONFIG.ENDPOINTS.AUTH_LOGOUT_ALL);
    delete axiosInstance.defaults.headers.common['Authorization'];
  },

  setToken: (token: string): void => {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  clearToken: (): void => {
    delete axiosInstance.defaults.headers.common['Authorization'];
  },
};

// ============================================
// HEALTH CHECK API
// ============================================

export const healthApi = {
  /**
   * Check API health status
   */
  check: async (): Promise<{ status: string }> => {
    const response = await retryRequest(() =>
      axiosInstance.get<{ status: string }>(API_CONFIG.ENDPOINTS.HEALTH)
    );
    return response.data;
  },
};

// ============================================
// CATEGORY API
// ============================================

export const categoryApi = {
  /**
   * Get all categories
   */
  getAll: async (): Promise<CategoryDTO[]> => {
    const response = await axiosInstance.get<CategoryDTO[]>(
      API_CONFIG.ENDPOINTS.CATEGORIES
    );
    return response.data;
  },

  /**
   * Get only active categories
   */
  getActive: async (): Promise<CategoryDTO[]> => {
    const response = await axiosInstance.get<CategoryDTO[]>(
      API_CONFIG.ENDPOINTS.CATEGORIES_ACTIVE
    );
    return response.data;
  },

  /**
   * Search categories by name
   */
  search: async (name: string): Promise<CategoryDTO[]> => {
    const response = await axiosInstance.get<CategoryDTO[]>(
      API_CONFIG.ENDPOINTS.CATEGORIES_SEARCH,
      { params: { name } }
    );
    return response.data;
  },

  /**
   * Get category by ID
   */
  getById: async (id: number): Promise<CategoryDTO> => {
    const response = await axiosInstance.get<CategoryDTO>(
      API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id)
    );
    return response.data;
  },
};

// ============================================
// DISH API
// ============================================

export const dishApi = {
  /**
   * Get all dishes
   */
  getAll: async (): Promise<DishDTO[]> => {
    const response = await axiosInstance.get<DishDTO[]>(
      API_CONFIG.ENDPOINTS.DISHES
    );
    return response.data;
  },

  /**
   * Get only active dishes
   */
  getActive: async (): Promise<DishDTO[]> => {
    const response = await axiosInstance.get<DishDTO[]>(
      API_CONFIG.ENDPOINTS.DISHES_ACTIVE
    );
    return response.data;
  },

  /**
   * Get vegetarian dishes
   */
  getVegetarian: async (): Promise<DishDTO[]> => {
    const response = await axiosInstance.get<DishDTO[]>(
      API_CONFIG.ENDPOINTS.DISHES_VEGETARIAN
    );
    return response.data;
  },

  /**
   * Get vegan dishes
   */
  getVegan: async (): Promise<DishDTO[]> => {
    const response = await axiosInstance.get<DishDTO[]>(
      API_CONFIG.ENDPOINTS.DISHES_VEGAN
    );
    return response.data;
  },

  /**
   * Get spicy dishes
   */
  getSpicy: async (): Promise<DishDTO[]> => {
    const response = await axiosInstance.get<DishDTO[]>(
      API_CONFIG.ENDPOINTS.DISHES_SPICY
    );
    return response.data;
  },

  /**
   * Search dishes by name
   */
  search: async (name: string): Promise<DishDTO[]> => {
    const response = await axiosInstance.get<DishDTO[]>(
      API_CONFIG.ENDPOINTS.DISHES_SEARCH,
      { params: { name } }
    );
    return response.data;
  },

  /**
   * Get dishes by category ID
   */
  getByCategory: async (categoryId: number): Promise<DishDTO[]> => {
    const response = await axiosInstance.get<DishDTO[]>(
      API_CONFIG.ENDPOINTS.DISHES_BY_CATEGORY(categoryId)
    );
    return response.data;
  },

  /**
   * Get dishes by price range
   */
  getByPriceRange: async (
    minPrice: number,
    maxPrice: number
  ): Promise<DishDTO[]> => {
    const response = await axiosInstance.get<DishDTO[]>(
      API_CONFIG.ENDPOINTS.DISHES_BY_PRICE_RANGE,
      { params: { minPrice, maxPrice } }
    );
    return response.data;
  },

  /**
   * Get dish by ID
   */
  getById: async (id: number): Promise<DishDTO> => {
    const response = await axiosInstance.get<DishDTO>(
      API_CONFIG.ENDPOINTS.DISH_BY_ID(id)
    );
    return response.data;
  },
};

// ============================================
// ORDER API
// ============================================

export const orderApi = {
  /**
   * Get all orders
   */
  getAll: async (): Promise<OrderDTO[]> => {
    const response = await axiosInstance.get<OrderDTO[]>(
      API_CONFIG.ENDPOINTS.ORDERS
    );
    return response.data;
  },

  /**
   * Get orders by status
   */
  getByStatus: async (status: string): Promise<OrderDTO[]> => {
    const response = await axiosInstance.get<OrderDTO[]>(
      API_CONFIG.ENDPOINTS.ORDERS_BY_STATUS(status)
    );
    return response.data;
  },

  /**
   * Get order by ID
   */
  getById: async (id: number): Promise<OrderDTO> => {
    const response = await axiosInstance.get<OrderDTO>(
      API_CONFIG.ENDPOINTS.ORDER_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Create new order
   */
  create: async (
    order: Omit<OrderDTO, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<OrderDTO> => {
    const response = await axiosInstance.post<OrderDTO>(
      API_CONFIG.ENDPOINTS.ORDERS,
      order
    );
    return response.data;
  },

  /**
   * Update existing order
   */
  update: async (id: number, order: Partial<OrderDTO>): Promise<OrderDTO> => {
    const response = await axiosInstance.put<OrderDTO>(
      API_CONFIG.ENDPOINTS.ORDER_BY_ID(id),
      order
    );
    return response.data;
  },

  /**
   * Update order status
   */
  updateStatus: async (id: number, status: string): Promise<OrderDTO> => {
    const response = await axiosInstance.patch<OrderDTO>(
      API_CONFIG.ENDPOINTS.ORDER_STATUS(id),
      null,
      { params: { status } }
    );
    return response.data;
  },

  /**
   * Update payment status
   */
  updatePaymentStatus: async (
    id: number,
    paymentStatus: string
  ): Promise<OrderDTO> => {
    const response = await axiosInstance.patch<OrderDTO>(
      API_CONFIG.ENDPOINTS.ORDER_PAYMENT_STATUS(id),
      null,
      { params: { paymentStatus } }
    );
    return response.data;
  },

  /**
   * Delete order
   */
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(API_CONFIG.ENDPOINTS.ORDER_BY_ID(id));
  },

  /**
   * Create VNPay payment
   */
  createVNPayPayment: async (data: {
    orderId: number;
    amount: number;
    orderInfo: string;
    returnUrl: string;
  }): Promise<{ paymentUrl: string }> => {
    const response = await axiosInstance.post<{ paymentUrl: string }>(
      API_CONFIG.ENDPOINTS.VNPAY_CREATE_PAYMENT,
      data
    );
    return response.data;
  },

  /**
   * Get orders by customer
   */
  getByCustomer: async (customerId: number): Promise<OrderDTO[]> => {
    const response = await axiosInstance.get<OrderDTO[]>(
      API_CONFIG.ENDPOINTS.ORDERS_BY_CUSTOMER(customerId)
    );
    return response.data;
  },
};

// ============================================
// CART API
// ============================================

export const cartApi = {
  /**
   * Get cart by session ID
   */
  getBySession: async (sessionId: string): Promise<CartDTO> => {
    const response = await axiosInstance.get<CartDTO>(
      API_CONFIG.ENDPOINTS.CART_BY_SESSION(sessionId)
    );
    return response.data;
  },

  /**
   * Get cart items by session ID
   */
  getItems: async (sessionId: string): Promise<CartItemDTO[]> => {
    const response = await axiosInstance.get<CartItemDTO[]>(
      API_CONFIG.ENDPOINTS.CART_ITEMS(sessionId)
    );
    return response.data;
  },

  /**
   * Add item to cart
   */
  addItem: async (
    sessionId: string,
    item: Omit<CartItemDTO, 'id'>
  ): Promise<CartItemDTO> => {
    const response = await axiosInstance.post<CartItemDTO>(
      API_CONFIG.ENDPOINTS.CART_ITEMS(sessionId),
      item
    );
    return response.data;
  },

  /**
   * Update cart item
   */
  updateItem: async (
    sessionId: string,
    itemId: number,
    item: Partial<CartItemDTO>
  ): Promise<CartItemDTO> => {
    const response = await axiosInstance.put<CartItemDTO>(
      API_CONFIG.ENDPOINTS.CART_ITEM(sessionId, itemId),
      item
    );
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeItem: async (sessionId: string, itemId: number): Promise<void> => {
    await axiosInstance.delete(
      API_CONFIG.ENDPOINTS.CART_ITEM(sessionId, itemId)
    );
  },

  /**
   * Clear all items from cart
   */
  clear: async (sessionId: string): Promise<void> => {
    await axiosInstance.delete(API_CONFIG.ENDPOINTS.CART_CLEAR(sessionId));
  },
};

// ============================================
// EXPORTS
// ============================================

// Export axios instance for custom requests
export const api = axiosInstance;

export default {
  auth: authApi,
  health: healthApi,
  category: categoryApi,
  dish: dishApi,
  order: orderApi,
  cart: cartApi,
  instance: axiosInstance,
};

