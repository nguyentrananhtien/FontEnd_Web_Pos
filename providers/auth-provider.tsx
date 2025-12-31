import React, {createContext, useContext, ReactNode, useState, useEffect} from 'react';
import {authApi} from '@/api/authApi';
import {UserDTO, LoginRequest, RegisterRequest} from '@/services/types';

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import {router} from 'expo-router';


interface AuthContextType {
    user: UserDTO | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    loginSuccess: (accessToken: string, refreshToken: string) => Promise<void>;
    handleGoogleLogin: () => Promise<void>; // Thêm vào interface
    logout: () => Promise<void>;
    logoutAll: () => Promise<void>;
}

interface MyTokenPayload {
    sub: string;
    fullName?: string;
    roles?: string[];

    [key: string]: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('@auth_token');
            if (token) {
                const userData = await authApi.getUser();
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loginSuccess = async (accessToken: string, refreshToken: string) => {
        try {
            await AsyncStorage.setItem('access_token', accessToken);
            await AsyncStorage.setItem('refresh_token', refreshToken);

            const decoded = jwtDecode<MyTokenPayload>(accessToken);
            const userDto = {
                id: decoded.userId || decoded.sub,
                email: decoded.sub,
                fullName: decoded.fullName || 'Google User',
                roles: decoded.roles || ['customer'],
            } as unknown as UserDTO;

            setUser(userDto);
        } catch (error) {
            console.error('Failed to persist auth data', error);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {

            const authUrl = `https://jasmine-unphlegmatical-cognately.ngrok-free.dev/oauth2/authorization/google`;

            const redirectUrl = Linking.createURL('/auth-success');

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

            if (result.type === 'success' && result.url) {
                const parsedUrl = Linking.parse(result.url);
                const { accessToken, refreshToken } = parsedUrl.queryParams as any;

                if (accessToken) {
                    await loginSuccess(accessToken, refreshToken);
                    router.replace('/home');
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
        setUser(response.user);
    };

    const register = async (data: RegisterRequest) => {
        const response = await authApi.register(data);
        setUser(response.user);
    };

    const logout = async () => {
        await AsyncStorage.clear();
        setUser(null);
    };

    const logoutAll = async () => {
        await AsyncStorage.clear();
        setUser(null);
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