import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {router} from 'expo-router';
import {authApi} from '@/api/authApi';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendEmail = async () => {
        if (!email) {
            Alert.alert('Thông báo', 'Vui lòng nhập email của bạn');
            return;
        }

        setIsLoading(true);
        try {
            await authApi.forgotPassword({email});

            Alert.alert('Thành công', 'Mã xác thực đã được gửi đến hòm thư của bạn');
            router.push({
                pathname: '/auth/reset-password',
                params: {email: email}
            });
        } catch (error: any) {
            const msg = error.response?.data || 'Email không tồn tại hoặc lỗi hệ thống';
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
                <View style={styles.card}>
                    <Text style={styles.title}>Quên mật khẩu</Text>

                    <Text style={styles.instruction}>
                        Mã xác thực (OTP) sẽ được gửi đến hòm thư cá nhân của bạn.
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email hệ thống</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="example@gmail.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSendEmail}
                        disabled={isLoading}
                        style={styles.buttonWrapper}
                    >
                        <LinearGradient
                            colors={['#f97316', '#ec4899']}
                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? 'Đang gửi...' : 'Lấy mã OTP'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
                        <Text style={styles.backLink}>Quay lại đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 25,
        elevation: 5
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333'
    },
    instruction: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20
    },
    inputContainer: {
        marginBottom: 25
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 15,
        backgroundColor: '#f9f9f9'
    },
    buttonWrapper: {
        borderRadius: 12,
        overflow: 'hidden'
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
        color: '#f97316',
        fontWeight: '600'
    }
});