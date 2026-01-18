import React, {useState} from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Alert,
    StyleSheet, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {router, useLocalSearchParams} from 'expo-router';
import {authApi} from '@/api/authApi';

export default function ResetPasswordScreen() {
    const {email} = useLocalSearchParams<{ email: string }>();

    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmReset = async () => {
        if (!otp || !newPassword || !confirmPassword) {
            Alert.alert('Thông báo', 'Vui lòng điền đầy đủ các trường');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không trùng khớp');
            return;
        }

        setIsLoading(true);
        try {
            await authApi.resetPassword({
                email: email,
                otp: otp,
                newPassword: newPassword
            });

            Alert.alert('Thành công', 'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.',
                [
                    {text: 'OK', onPress: () => router.replace('/auth/login')}
                ]);
        } catch (error: any) {
            const msg = error.response?.data || 'Mã xác thực không chính xác';
            Alert.alert('Lỗi', msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}
        >
            <LinearGradient colors={['#f97316', '#ec4899']} style={styles.container}>
                <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
                    <View style={styles.card}>
                        <Text style={styles.title}>Thiết lập mật khẩu</Text>
                        <Text style={styles.subtitle}>Nhập mã OTP gửi tới {email}</Text>

                        {/* Input Mã OTP */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mã xác thực (OTP)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập 6 số"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="numeric"
                                maxLength={6}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mật khẩu mới</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />
                        </View>

                        {/* Input Xác nhận mật khẩu */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Xác nhận mật khẩu</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        {/* Nút Xác nhận */}
                        <TouchableOpacity
                            onPress={handleConfirmReset}
                            disabled={isLoading}
                            style={styles.buttonWrapper}
                        >
                            <LinearGradient
                                colors={['#f97316', '#ec4899']}
                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                style={styles.button}
                            >
                                <Text style={styles.buttonText}>
                                    {isLoading ? 'Đang xử lý...' : 'XÁC NHẬN'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
                            <Text style={styles.backLink}>Quay lại</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 25,
        elevation: 5
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333'
    },
    subtitle: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 5
    },
    inputGroup: {
        marginBottom: 15
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#444',
        marginBottom: 5
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f9f9f9'
    },
    buttonWrapper: {
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 10
    },
    button: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    backLink: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14
    }
});