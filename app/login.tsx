import { router } from 'expo-router';
import React, { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from '@/api/authApi';
import { WaterDropLoader } from '@/components/WaterDropLoader';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLocalLoading, setIsLocalLoading] = useState(false);
    const { handleGoogleLogin, isLoading: authLoading } = useAuth();

    const isLoading = isLocalLoading || authLoading;

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Trường tài khoản và mật khẩu không được để trống');
            return;
        }

        setIsLocalLoading(true);
        try {
            const response = await authApi.login({ email, password });
            router.replace('/home');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Đăng nhâp thất bại. Vui lòng đăng nhâp lại';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLocalLoading(false);
        }
    };

    const handleForgotPassword = () => {
        router.push('/forgot-password');
    };

    const handleRegister = () => {
        router.push('/register');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            <LinearGradient colors={['#f97316', '#ec4899']} className="flex-1">
                {isLoading && (
                    <View style={styles.loaderOverlay}>
                        <WaterDropLoader size={60} color="#ffffff" />
                        <Text style={styles.loadingText}>Connecting to Google...</Text>
                    </View>
                )}

                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
                    <View className="flex-1 justify-center p-6">
                        <View className="items-center mb-10">
                            <Text className="text-5xl">🍽️</Text>
                            <Text className="text-3xl font-bold text-white mb-2">Restaurant POS</Text>
                            <Text className="text-base text-white/90">Đăng nhập để tiếp tục</Text>
                        </View>

                        <View className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
                            {/* Email Input */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
                                <TextInput
                                    className="h-12 border border-gray-300 rounded-xl px-4 bg-gray-50"
                                    placeholder="email của bạn"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                            </View>

                            {/* Password Input */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">Password</Text>
                                <TextInput
                                    className="h-12 border border-gray-300 rounded-xl px-4 bg-gray-50"
                                    placeholder="Mật khẩu của bạn"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    editable={!isLoading}
                                />
                            </View>

                            <TouchableOpacity className="self-end mb-6" onPress={handleForgotPassword}>
                                <Text className="text-orange-600 text-sm font-semibold">Quên mật khẩu ?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="h-12 rounded-xl overflow-hidden mb-6"
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={['#f97316', '#ec4899']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="h-12 justify-center items-center"
                                >
                                    <Text className="text-white text-base font-semibold">Đăng Nhập</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View className="flex-row items-center mb-6">
                                <View className="flex-1 h-px bg-gray-300" />
                                <Text className="mx-4 text-gray-500 text-sm">OR</Text>
                                <View className="flex-1 h-px bg-gray-300" />
                            </View>

                            <TouchableOpacity
                                className="h-12 flex-row items-center justify-center rounded-xl border border-gray-300 bg-white"
                                onPress={handleGoogleLogin}
                                disabled={isLoading}
                            >
                                <Text className="text-xl font-bold mr-3">G</Text>
                                <Text className="text-base font-semibold text-gray-700">Đăng nhập bằng Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="h-12 flex-row items-center justify-center rounded-xl border border-gray-300 bg-white mt-4"
                                onPress={() => router.push('/phone-login')}
                                disabled={isLoading}
                            >
                                <Text className="text-xl mr-3">📱</Text>
                                <Text className="text-base font-semibold text-gray-700">Đăng nhập bằng Số điện thoại</Text>
                            </TouchableOpacity>

                            <View className="flex-row justify-center mt-6">
                                <Text className="text-gray-600 text-sm">Không có tài khoản? </Text>
                                <TouchableOpacity onPress={handleRegister}>
                                    <Text className="text-orange-600 text-sm font-semibold">Đăng kí</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    loaderOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50,
    },
    loadingText: { color: 'white', fontSize: 18, marginTop: 20, fontWeight: '600' },
});