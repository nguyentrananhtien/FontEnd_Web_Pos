// ============================================
// AUTH API MODULE
// ============================================
import axios, {AxiosError} from 'axios';
import {AuthResponse, LoginRequest, RegisterRequest, UserDTO} from '@/services/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_CONFIG} from '@/services/config';
import {STORAGE_KEYS} from "@/constants/STORAGE_KEYS";

// Create axios instance with configuration
const axiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
});

const TOKEN_KEY = STORAGE_KEYS.TOKEN;
const REFRESH_TOKEN_KEY = STORAGE_KEYS.REFRESH_TOKEN;
const USER_KEY = STORAGE_KEYS.USER;

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

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Phiên đăng nhập hết hạn hoặc Token không hợp lệ");
            await authApi.clearAuthData();

        }
        return Promise.reject(error);
    }
);


export const authApi = {
    async register(data: RegisterRequest): Promise<UserDTO> {
        const response = await axiosInstance.post<UserDTO>(
            API_CONFIG.ENDPOINTS.AUTH_REGISTER,
            data
        );
        return response.data;
    },
    verifyPhoneOtp: (idToken: string) => {
        return axiosInstance.post('/api/v1/auth/verify-sms-otp', { idToken });
    },

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await axiosInstance.post<AuthResponse>(
            API_CONFIG.ENDPOINTS.AUTH_LOGIN,
            data
        );
        if (response.data.accessToken) {
            await this.saveAuthData(response.data);
        }
        if (response.data.user) {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async logout(): Promise<void> {
        try {
            console.log("Logout")
            await axiosInstance.delete(API_CONFIG.ENDPOINTS.AUTH_LOGOUT);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("Status:", err.response?.status);
                console.error("Message:", err.message);
            } else {
                console.error("Unexpected error:", err);
            }
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

    async forgotPassword(data: any): Promise<string> {
        const response = await axiosInstance.post(
            API_CONFIG.ENDPOINTS.AUTH_FORGOT_PASSWORD,
            data,
        );
        return response.data;
    },

    async resetPassword(data: any): Promise<void> {
        const response = await axiosInstance.post(
            API_CONFIG.ENDPOINTS.AUTH_RESET_PASSWORD,
            data
        )
        return response.data;
    }



};

