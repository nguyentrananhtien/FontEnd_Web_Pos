import axios from 'axios';
import { OrderDTO, VNPayPaymentRequest, VNPayPaymentResponse } from '@/services/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/services/config';

const TOKEN_KEY = '@auth_token';

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const orderApi = {
  async createOrder(data: OrderDTO): Promise<OrderDTO> {
    const response = await axiosInstance.post<OrderDTO>(
      API_CONFIG.ENDPOINTS.ORDERS,
      data
    );
    return response.data;
  },

  async getOrdersByCustomer(customerId: number): Promise<OrderDTO[]> {
    const response = await axiosInstance.get<OrderDTO[]>(
      API_CONFIG.ENDPOINTS.ORDERS_BY_CUSTOMER(customerId)
    );
    return response.data;
  },

  async getOrdersByStatus(status: string): Promise<OrderDTO[]> {
    const response = await axiosInstance.get<OrderDTO[]>(
      API_CONFIG.ENDPOINTS.ORDERS_BY_STATUS(status)
    );
    return response.data;
  },

  async getOrderById(orderId: number): Promise<OrderDTO> {
    const response = await axiosInstance.get<OrderDTO>(
      API_CONFIG.ENDPOINTS.ORDER_BY_ID(orderId)
    );
    return response.data;
  },

  async updateOrderStatus(orderId: number, status: string): Promise<OrderDTO> {
    const response = await axiosInstance.patch<OrderDTO>(
      `${API_CONFIG.ENDPOINTS.ORDER_STATUS(orderId)}?status=${status}`
    );
    return response.data;
  },

  async updatePaymentStatus(orderId: number, paymentStatus: string): Promise<OrderDTO> {
    const response = await axiosInstance.patch<OrderDTO>(
      `${API_CONFIG.ENDPOINTS.ORDER_PAYMENT_STATUS(orderId)}?paymentStatus=${paymentStatus}`
    );
    return response.data;
  },

  async createVNPayPayment(data: VNPayPaymentRequest): Promise<VNPayPaymentResponse> {
    const response = await axiosInstance.post<VNPayPaymentResponse>(
      API_CONFIG.ENDPOINTS.PAYMENT_CREATE,
      data
    );
    return response.data;
  },

  async getPaymentByOrder(orderId: number): Promise<any> {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.PAYMENT_BY_ORDER(orderId)
    );
    return response.data;
  },
};

