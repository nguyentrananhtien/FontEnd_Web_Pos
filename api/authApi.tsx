import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, UserDTO } from '@/services/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/services/config';

const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';
const USER_KEY = '@user_data';

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

export const authApi = {
  async register(data: RegisterRequest): Promise<UserDTO> {
    const response = await axiosInstance.post<UserDTO>(
      API_CONFIG.ENDPOINTS.AUTH_REGISTER,
      data
    );
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH_LOGIN,
      data
    );
    if (response.data.accessToken) {
      await this.saveAuthData(response.data);
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.delete(API_CONFIG.ENDPOINTS.AUTH_LOGOUT);
    } finally {
      await this.clearAuthData();
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await axiosInstance.delete(API_CONFIG.ENDPOINTS.AUTH_LOGOUT_ALL);
    } finally {
      await this.clearAuthData();
    }
  },

  async saveAuthData(data: AuthResponse): Promise<void> {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, data.accessToken],
      [REFRESH_TOKEN_KEY, data.refreshToken],
    ]);
  },

  async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },

  async getUser(): Promise<UserDTO | null> {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },
};

