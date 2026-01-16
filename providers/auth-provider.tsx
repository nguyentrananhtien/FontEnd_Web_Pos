import { authApi } from '@/services/api';
import { LoginRequest, RegisterRequest, UserDTO } from '@/services/types';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { STORAGE_KEYS } from '@/constants/STORAGE_KEYS';
import { API_CONFIG } from "@/services/config";
import inAppNotificationService from '@/services/inAppNotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';


interface AuthContextType {
    user: UserDTO | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    loginSuccess: (accessToken: string, refreshToken: string) => Promise<void>;
    handleGoogleLogin: () => Promise<void>;
    logout: () => Promise<void>;
    logoutAll: () => Promise<void>;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    // Initialize notifications when user is authenticated
    useEffect(() => {
        if (user?.id) {
            initializeNotifications();
        } else {
            inAppNotificationService.stopNotificationPolling();
        }

        return () => {
            inAppNotificationService.stopNotificationPolling();
        };
    }, [user?.id]);

    const initializeNotifications = async () => {
        try {
            // Initialize notification permissions
            const hasPermission = await inAppNotificationService.initializeNotifications();

            if (hasPermission && user?.id) {
                // Sync initial badge count
                await inAppNotificationService.syncBadgeCount(user.id);

                // Start polling for new notifications (every 30 seconds)
                inAppNotificationService.startNotificationPolling(user.id, 30000);

                console.log('✅ In-app notifications initialized for user:', user.id);
            }
        } catch (error) {
            console.error('❌ Failed to initialize notifications:', error);
        }
    };

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
            if (token) {
                // Set token to axios instance
                await authApi.setToken(token);

                // Fetch current user from backend (uses JWT from Redis)
                try {
                    const userData = await authApi.getCurrentUser();
                    setUser(userData);
                } catch (error: any) {
                    // Token expired or invalid - clear it silently
                    const status = error.response?.status;
                    if (status === 401) {
                        console.log('🔄 Token expired, clearing...');
                    } else {
                        console.error('Auth check failed:', error);
                    }

                    // Clear invalid/expired token
                    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
                    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                    await authApi.clearToken();
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUserData = async () => {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
            if (token) {
                await authApi.setToken(token);
                const userData = await authApi.getCurrentUser();
                setUser(userData);
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    };

    const loginSuccess = async (accessToken: string, refreshToken: string) => {
        try {
            console.log('💾 Saving auth tokens...');
            await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
            await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

            // Fetch full user data from backend
            const userData = await authApi.getCurrentUser();
            console.log('✅ Login success, user:', userData.email);
            setUser(userData);
        } catch (error) {
            console.error('❌ Failed to persist auth data', error);
            throw error;
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {

            const authUrl = API_CONFIG.BASE_URL + `/oauth2/authorization/google`;

            const redirectUrl = Linking.createURL('/auth-success');

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

            if (result.type === 'success' && result.url) {
                const parsedUrl = Linking.parse(result.url);
                const { accessToken, refreshToken } = parsedUrl.queryParams as any;

                if (accessToken) {
                    await loginSuccess(accessToken, refreshToken);
                    router.replace('/(tabs)/home');
                }
            }
        } catch (error) {
            console.error(" Lỗi redirect:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (data: LoginRequest) => {
        const response = await authApi.login(data);
        await loginSuccess(response.accessToken, response.refreshToken);
    };

    const register = async (data: RegisterRequest) => {
        const response = await authApi.register(data);
        await loginSuccess(response.accessToken, response.refreshToken);
    };

    const logout = async () => {
        try {
            // Stop notification polling
            inAppNotificationService.stopNotificationPolling();

            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            await authApi.clearToken();
            setUser(null);
        }
    };

    const logoutAll = async () => {
        try {
            // Stop notification polling
            inAppNotificationService.stopNotificationPolling();

            await authApi.logoutAll();
        } catch (error) {
            console.error('Logout all error:', error);
        } finally {
            await authApi.clearToken();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                loginSuccess,
                handleGoogleLogin,
                logout,
                logoutAll,
                refreshUserData,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};