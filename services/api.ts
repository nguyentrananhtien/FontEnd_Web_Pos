import { STORAGE_KEYS } from "@/constants/STORAGE_KEYS";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';
import type {
  AuthResponse,
  CartDTO,
  CartItemDTO,
  CategoryDTO,
  DishDTO,
  GlobalSearchResponseDTO,
  LoginRequest,
  OrderDTO,
  RegisterRequest,
  UserDTO,
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

const TOKEN_KEY = STORAGE_KEYS.TOKEN;
const REFRESH_TOKEN_KEY = STORAGE_KEYS.REFRESH_TOKEN;
const USER_KEY = STORAGE_KEYS.USER;

// Request interceptor - Auto attach token and log requests
axiosInstance.interceptors.request.use(
  async (config) => {
    // Automatically load and attach token from AsyncStorage
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`);
    if (config.params) console.log('   Params:', config.params);
    if (config.data) console.log('   Data:', config.data);
    if (token) console.log('   🔑 Token:', token.substring(0, 20) + '...');

    return config;
  },
  (error) => {
    console.error('❌ [API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor - Handle errors and auto-refresh token on 401
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ [API] ${response.status} - ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    };

    console.error('❌ [API] Response Error:', errorDetails);

    // Handle specific error types BEFORE 401 handling

    // 502 Bad Gateway - Backend might be down or ngrok issue
    if (error.response?.status === 502) {
      console.error('🔥 [API] 502 Bad Gateway - Possible causes:');
      console.error('   1. Backend server is not running');
      console.error('   2. Ngrok tunnel is down');
      console.error('   3. Wrong backend URL in .env');
      console.error(`   Current URL: ${API_CONFIG.BASE_URL}`);

      // Don't retry on 502
      return Promise.reject({
        ...error,
        message: '🔥 Backend không phản hồi. Kiểm tra: 1) Backend đang chạy? 2) Ngrok đang hoạt động? 3) URL trong .env đúng?',
        userMessage: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
      });
    }

    // 503 Service Unavailable
    if (error.response?.status === 503) {
      console.error('⚠️ [API] 503 Service Unavailable - Backend đang bảo trì');
      return Promise.reject({
        ...error,
        message: 'Máy chủ đang bảo trì',
        userMessage: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
      });
    }

    // Network errors (no response)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        console.error('⏱️ [API] Request timeout');
        return Promise.reject({
          ...error,
          message: 'Request timeout - Mạng chậm hoặc backend không phản hồi',
          userMessage: 'Yêu cầu quá lâu. Vui lòng kiểm tra kết nối mạng.',
        });
      }

      console.error('🔌 [API] Network error - Possible causes:');
      console.error('   1. No internet connection');
      console.error('   2. Backend server offline');
      console.error('   3. Firewall blocking request');
      console.error('   4. Wrong ngrok URL');
      console.error(`   Current URL: ${API_CONFIG.BASE_URL}`);

      return Promise.reject({
        ...error,
        message: '🔌 Không có kết nối mạng hoặc backend offline',
        userMessage: 'Không thể kết nối. Kiểm tra kết nối mạng.',
      });
    }

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          console.error('🔐 [API] No refresh token available');
          processQueue(new Error('No refresh token'), null);
          await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
          return Promise.reject({
            ...error,
            message: 'No refresh token - User needs to login again',
            userMessage: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
          });
        }

        console.log('🔄 [API] Attempting to refresh token...');

        // Call refresh endpoint
        const response = await axios.post<AuthResponse>(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_REFRESH}`,
          { refreshToken },
          { headers: API_CONFIG.HEADERS }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Save new tokens
        await AsyncStorage.setItem(TOKEN_KEY, accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

        console.log('✅ [API] Token refreshed successfully');

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error('❌ [API] Token refresh failed:', refreshError);
        processQueue(refreshError, null);

        // Clear all auth data
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);

        return Promise.reject({
          message: 'Token refresh failed - User needs to login again',
          userMessage: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
        });
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other HTTP error codes
    if (error.response) {
      if (error.response.status === 404) {
        console.error('🔍 [API] Resource not found');
      } else if (error.response.status === 403) {
        console.error('🚫 [API] Forbidden - Insufficient permissions');
      } else if (error.response.status >= 500) {
        console.error('🔥 [API] Server error');
      }
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
    // Save tokens to AsyncStorage
    if (response.data.accessToken) {
      await AsyncStorage.setItem(TOKEN_KEY, response.data.accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
    }
    if (response.data.user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH_LOGIN,
      data
    );
    console.log('✅ Login response:', response.data);

    // Save tokens to AsyncStorage
    if (response.data.accessToken) {
      await AsyncStorage.setItem(TOKEN_KEY, response.data.accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
      console.log('✅ Token saved to AsyncStorage');
    }
    if (response.data.user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      console.log('✅ User data saved to AsyncStorage');
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.delete(API_CONFIG.ENDPOINTS.AUTH_LOGOUT);
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    }
  },

  logoutAll: async (): Promise<void> => {
    try {
      await axiosInstance.delete(API_CONFIG.ENDPOINTS.AUTH_LOGOUT_ALL);
    } catch (error) {
      console.error('Logout all API error:', error);
    } finally {
      // Always clear local storage
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    }
  },

  setToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  clearToken: async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  getUser: async (): Promise<UserDTO | null> => {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post<AuthResponse>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_REFRESH}`,
      { refreshToken },
      { headers: API_CONFIG.HEADERS }
    );

    // Save new tokens
    if (response.data.accessToken) {
      await AsyncStorage.setItem(TOKEN_KEY, response.data.accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
    }

    return response.data;
  },

  /**
   * Get current user info (from JWT/Redis)
   */
  getCurrentUser: async (): Promise<UserDTO> => {
    const response = await axiosInstance.get<UserDTO>(
      API_CONFIG.ENDPOINTS.AUTH_CURRENT_USER
    );

    // Update user data in AsyncStorage
    if (response.data) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
    }

    return response.data;
  },
};

// ============================================
// USER API
// ============================================

export const userApi = {
  /**
   * Get user by ID
   */
  getById: async (id: number): Promise<UserDTO> => {
    const response = await axiosInstance.get<UserDTO>(
      API_CONFIG.ENDPOINTS.USER_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Update user info
   */
  update: async (id: number, data: Partial<UserDTO>): Promise<UserDTO> => {
    const response = await axiosInstance.put<UserDTO>(
      API_CONFIG.ENDPOINTS.USER_UPDATE(id),
      data
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
      API_CONFIG.ENDPOINTS.PAYMENT_CREATE,
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
// SEARCH API
// ============================================

export const searchApi = {
  /**
   * Global search for dishes and tables
   */
  search: async (query: string): Promise<GlobalSearchResponseDTO> => {
    const response = await axiosInstance.get<GlobalSearchResponseDTO>(
      API_CONFIG.ENDPOINTS.SEARCH,
      { params: { q: query } }
    );
    return response.data;
  },
};

// ============================================
// RESERVATION API
// ============================================

export interface ReservationDTO {
  reservationId?: number;
  userId: number;
  userName?: string;
  tableId: number;
  tableCode?: string;
  reservationDate: string;
  timeSlotId: number;
  timeSlotLabel?: string;
  numberOfGuests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const reservationApi = {
  /**
   * Get all reservations (admin)
   */
  getAll: async (): Promise<ReservationDTO[]> => {
    const response = await axiosInstance.get<ReservationDTO[]>('/api/reservations');
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as any).data;
    }
    return response.data;
  },

  /**
   * Get reservation by ID
   */
  getById: async (id: number): Promise<ReservationDTO> => {
    const response = await axiosInstance.get<ReservationDTO>(`/api/reservations/${id}`);
    return response.data;
  },

  /**
   * Get reservations by user ID
   */
  getByUserId: async (userId: number): Promise<ReservationDTO[]> => {
    const response = await axiosInstance.get<ReservationDTO[]>(`/api/reservations/user/${userId}`);
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as any).data;
    }
    return response.data;
  },

  /**
   * Create a new reservation
   */
  create: async (data: Omit<ReservationDTO, 'reservationId' | 'createdAt' | 'updatedAt'>): Promise<ReservationDTO> => {
    const response = await axiosInstance.post<ReservationDTO>('/api/reservations', data);
    return response.data;
  },

  /**
   * Update reservation
   */
  update: async (id: number, data: Partial<ReservationDTO>): Promise<ReservationDTO> => {
    const response = await axiosInstance.put<ReservationDTO>(`/api/reservations/${id}`, data);
    return response.data;
  },

  /**
   * Delete reservation
   */
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/reservations/${id}`);
  },
};


// ============================================
// EXPORTS
// ============================================

// Export axios instance for custom requests
export const api = axiosInstance;

/**
 * Payment API
 */
export const paymentApi = {
  /**
   * Create payment
   */
  create: async (data: {
    amount: number;
    orderId: number;
    userId: number;
    orderInfo: string;
    returnUrl: string;
  }): Promise<{ paymentUrl: string; txnRef: string }> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.PAYMENT_CREATE,
      data
    );
    return response.data;
  },

  /**
   * Create payment from invoice (VNPay)
   */
  createFromInvoice: async (invoiceId: number, userId?: number): Promise<{ paymentUrl: string; txnRef: string }> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.PAYMENT_CREATE_FROM_INVOICE(invoiceId),
      null,
      userId ? { params: { userId } } : undefined
    );
    return response.data;
  },

  /**
   * Get payment by transaction reference
   */
  getByTxnRef: async (txnRef: string): Promise<any> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.PAYMENT_BY_TXN(txnRef)
    );
    return response.data;
  },

  /**
   * Get payments by order ID
   */
  getByOrderId: async (orderId: number): Promise<any[]> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.PAYMENT_BY_ORDER(orderId)
    );
    return response.data;
  },

  /**
   * Get payments by user ID
   */
  getByUserId: async (userId: number): Promise<any[]> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.PAYMENT_BY_USER(userId)
    );
    return response.data;
  },

  /**
   * Get payment status (legacy)
   */
  getStatus: async (orderId: string): Promise<any> => {
    const response = await axiosInstance.get(
      `/api/payment/status/${orderId}`
    );
    return response.data;
  }
};

/**
 * Invoice API
 */
export interface InvoiceDTO {
  invoiceId?: number;
  orderId: number;
  userId: number;
  userName?: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  finalAmount?: number;
  status?: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  createdAt?: string;
  updatedAt?: string;
  items?: any[];
}

export const invoiceApi = {
  /**
   * Get all invoices (admin)
   */
  getAll: async (): Promise<InvoiceDTO[]> => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.INVOICES);
    return response.data;
  },

  /**
   * Get invoice by ID
   */
  getById: async (id: number): Promise<InvoiceDTO> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.INVOICE_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Create invoice from order
   */
  createFromOrder: async (orderId: number, discount?: number): Promise<InvoiceDTO> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.INVOICE_FROM_ORDER(orderId),
      null,
      discount !== undefined ? { params: { discount } } : undefined
    );
    return response.data;
  },

  /**
   * Create invoice manually
   */
  create: async (data: Omit<InvoiceDTO, 'invoiceId' | 'createdAt' | 'updatedAt'>): Promise<InvoiceDTO> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.INVOICE_CREATE,
      data
    );
    return response.data;
  },

  /**
   * Get invoice by order ID
   */
  getByOrderId: async (orderId: number): Promise<InvoiceDTO> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.INVOICE_BY_ORDER(orderId)
    );
    return response.data;
  },

  /**
   * Get invoices by user ID
   */
  getByUserId: async (userId: number): Promise<InvoiceDTO[]> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.INVOICE_BY_USER(userId)
    );
    return response.data;
  },

  /**
   * Update invoice
   */
  update: async (id: number, data: Partial<InvoiceDTO>): Promise<InvoiceDTO> => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.INVOICE_UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Update invoice status
   */
  updateStatus: async (id: number, status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'): Promise<InvoiceDTO> => {
    const response = await axiosInstance.patch(
      API_CONFIG.ENDPOINTS.INVOICE_UPDATE_STATUS(id),
      null,
      { params: { status } }
    );
    return response.data;
  },

  /**
   * Get invoice final amount
   */
  getFinalAmount: async (id: number): Promise<number> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.INVOICE_FINAL_AMOUNT(id)
    );
    return response.data;
  },

  /**
   * Delete invoice
   */
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(API_CONFIG.ENDPOINTS.INVOICE_DELETE(id));
  },
};

/**
 * Notification API
 */
export interface NotificationDTO {
  notificationId?: number;
  title: string;
  message: string;
  type: 'PROMOTION' | 'ORDER_UPDATE' | 'RESERVATION' | 'SYSTEM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt?: string;
}

export interface UserNotificationDTO {
  userNotificationId: number;
  userId: number;
  notificationId: number;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
  notification: NotificationDTO;
}

export const notificationApi = {
  /**
   * Create notification (admin)
   */
  create: async (data: Omit<NotificationDTO, 'notificationId' | 'createdAt'>): Promise<NotificationDTO> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.NOTIFICATION_CREATE,
      data
    );
    return response.data;
  },

  /**
   * Send notification to user (admin)
   */
  sendToUser: async (userId: number, notificationId: number): Promise<UserNotificationDTO> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.NOTIFICATION_SEND,
      null,
      { params: { userId, notificationId } }
    );
    return response.data;
  },

  /**
   * Get notifications for user
   */
  getByUserId: async (userId: number): Promise<UserNotificationDTO[]> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS_BY_USER(userId)
    );
    return response.data;
  },

  /**
   * Get unread notifications
   */
  getUnread: async (userId: number): Promise<UserNotificationDTO[]> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS_UNREAD(userId)
    );
    return response.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (userId: number): Promise<number> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT(userId)
    );
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (userNotificationId: number): Promise<UserNotificationDTO> => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.NOTIFICATION_MARK_READ(userNotificationId)
    );
    return response.data;
  },

  /**
   * Get notifications by type (admin)
   */
  getByType: async (type: 'PROMOTION' | 'ORDER_UPDATE' | 'RESERVATION' | 'SYSTEM'): Promise<NotificationDTO[]> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS_BY_TYPE(type)
    );
    return response.data;
  },

  /**
   * Get notifications by priority (admin)
   */
  getByPriority: async (priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'): Promise<NotificationDTO[]> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS_BY_PRIORITY(priority)
    );
    return response.data;
  },
};

/**
 * Push Notification API
 */
export const pushNotificationApi = {
  /**
   * Register push token
   */
  registerToken: async (data: {
    userId: number;
    pushToken: string;
    platform: 'android' | 'ios';
    deviceInfo?: string;
  }): Promise<any> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.PUSH_TOKEN_REGISTER,
      data
    );
    return response.data;
  },

  /**
   * Remove push token
   */
  removeToken: async (userId: number, pushToken: string): Promise<void> => {
    await axiosInstance.delete(
      API_CONFIG.ENDPOINTS.PUSH_TOKEN_REMOVE,
      { params: { userId, pushToken } }
    );
  },
};

/**
 * Ingredient API
 */
export interface IngredientDTO {
  ingredientId?: number;
  ingredientName: string;
  description?: string;
}

export const ingredientApi = {
  /**
   * Get all ingredients
   */
  getAll: async (): Promise<IngredientDTO[]> => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.INGREDIENTS);
    return response.data;
  },

  /**
   * Search ingredients by name
   */
  search: async (name: string): Promise<IngredientDTO[]> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.INGREDIENTS_SEARCH,
      { params: { name } }
    );
    return response.data;
  },

  /**
   * Get ingredient by ID
   */
  getById: async (id: number): Promise<IngredientDTO> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.INGREDIENT_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Create ingredient (admin)
   */
  create: async (data: Omit<IngredientDTO, 'ingredientId'>): Promise<IngredientDTO> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.INGREDIENT_CREATE,
      data
    );
    return response.data;
  },

  /**
   * Update ingredient (admin)
   */
  update: async (id: number, data: Partial<IngredientDTO>): Promise<IngredientDTO> => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.INGREDIENT_UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Delete ingredient (admin)
   */
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(API_CONFIG.ENDPOINTS.INGREDIENT_DELETE(id));
  },
};

/**
 * Allergen API
 */
export interface AllergenDTO {
  allergenId?: number;
  allergenName: string;
  description?: string;
}

export const allergenApi = {
  /**
   * Get all allergens
   */
  getAll: async (): Promise<AllergenDTO[]> => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.ALLERGENS);
    return response.data;
  },

  /**
   * Search allergens by name
   */
  search: async (name: string): Promise<AllergenDTO[]> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.ALLERGENS_SEARCH,
      { params: { name } }
    );
    return response.data;
  },

  /**
   * Get allergen by ID
   */
  getById: async (id: number): Promise<AllergenDTO> => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.ALLERGEN_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Create allergen (admin)
   */
  create: async (data: Omit<AllergenDTO, 'allergenId'>): Promise<AllergenDTO> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.ALLERGEN_CREATE,
      data
    );
    return response.data;
  },

  /**
   * Update allergen (admin)
   */
  update: async (id: number, data: Partial<AllergenDTO>): Promise<AllergenDTO> => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.ALLERGEN_UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Delete allergen (admin)
   */
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(API_CONFIG.ENDPOINTS.ALLERGEN_DELETE(id));
  },
};

/**
 * Email API
 */
export const emailApi = {
  /**
   * Send email (admin)
   */
  send: async (data: {
    to: string;
    subject: string;
    body: string;
  }): Promise<string> => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.EMAIL_SEND,
      data
    );
    return response.data;
  },
};

export default {
  auth: authApi,
  user: userApi,
  category: categoryApi,
  dish: dishApi,
  order: orderApi,
  cart: cartApi,
  search: searchApi,
  reservation: reservationApi,
  payment: paymentApi,
  invoice: invoiceApi,
  notification: notificationApi,
  pushNotification: pushNotificationApi,
  ingredient: ingredientApi,
  allergen: allergenApi,
  email: emailApi,
  instance: axiosInstance,
};

