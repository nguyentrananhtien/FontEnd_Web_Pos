import React, {useState, useRef} from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';

import {initializeApp, getApp, getApps} from 'firebase/app';
import {
    initializeAuth,
    PhoneAuthProvider,
    signInWithCredential,
} from 'firebase/auth';

import {FirebaseRecaptchaVerifierModal} from 'expo-firebase-recaptcha';
import {LinearGradient} from 'expo-linear-gradient';
import {router} from 'expo-router';

import {authApi} from '@/api/authApi';


const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};


const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();


const auth = initializeAuth(app, {
    persistence: undefined,
});


export default function PhoneLoginScreen() {
    const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

    const [phoneNumber, setPhoneNumber] = useState('+84');
    const [verificationId, setVerificationId] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);


    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại hợp lệ');
            return;
        }

        setLoading(true);
        try {
            const phoneProvider = new PhoneAuthProvider(auth);
            const id = await phoneProvider.verifyPhoneNumber(
                phoneNumber,
                recaptchaVerifier.current!
            );

            setVerificationId(id);
            Alert.alert('Thành công', 'Mã OTP đã được gửi');
        } catch (err: any) {
            console.error(err);
            Alert.alert('Lỗi', err.message || 'Không thể gửi OTP');
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyOTP = async () => {
        if (!code || code.length !== 6) return;

        setLoading(true);
        try {
            const credential = PhoneAuthProvider.credential(verificationId, code);
            const userCredential = await signInWithCredential(auth, credential);

            const idToken = await userCredential.user.getIdToken();
            const response = await authApi.verifyPhoneOtp(idToken);

            if (response?.data?.accessToken) {
                await authApi.saveAuthData(response.data);
                Alert.alert('Thành công', 'Đăng nhập POS thành công');
                router.replace('/(tabs)/home');
            }
        } catch (err) {
            Alert.alert('Lỗi', 'Mã OTP không chính xác hoặc đã hết hạn');
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}
        >
            <LinearGradient colors={['#f97316', '#ec4899']} style={{flex: 1}}>
                {/* BẮT BUỘC cho Firebase Phone Auth */}
                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={firebaseConfig}
                    attemptInvisibleVerification={true}
                />

                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        padding: 20,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 24,
                            padding: 30,
                            shadowColor: '#000',
                            shadowOffset: {width: 0, height: 10},
                            shadowOpacity: 0.1,
                            shadowRadius: 20,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 26,
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginBottom: 10,
                                color: '#333',
                            }}
                        >
                            Restaurant POS
                        </Text>

                        <Text
                            style={{
                                fontSize: 14,
                                textAlign: 'center',
                                marginBottom: 30,
                                color: '#666',
                            }}
                        >
                            Xác thực số điện thoại để tiếp tục
                        </Text>

                        {!verificationId ? (
                            <>
                                <Text style={{fontWeight: '600', marginBottom: 8}}>
                                    Số điện thoại
                                </Text>

                                <TextInput
                                    style={{
                                        height: 50,
                                        borderWidth: 1,
                                        borderColor: '#eee',
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        marginBottom: 20,
                                    }}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    editable={!loading}
                                />

                                <TouchableOpacity
                                    onPress={handleSendOTP}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#f97316',
                                        height: 55,
                                        borderRadius: 15,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white"/>
                                    ) : (
                                        <Text style={{color: 'white', fontWeight: 'bold'}}>
                                            Gửi mã OTP
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={{fontWeight: '600', marginBottom: 8}}>
                                    Mã OTP
                                </Text>

                                <TextInput
                                    style={{
                                        height: 50,
                                        borderWidth: 1,
                                        borderColor: '#eee',
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        marginBottom: 20,
                                        textAlign: 'center',
                                        fontSize: 20,
                                        letterSpacing: 5,
                                    }}
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />

                                <TouchableOpacity
                                    onPress={handleVerifyOTP}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#16a34a',
                                        height: 55,
                                        borderRadius: 15,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white"/>
                                    ) : (
                                        <Text style={{color: 'white', fontWeight: 'bold'}}>
                                            Xác nhận đăng nhập
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setVerificationId('')}
                                    style={{marginTop: 15, alignItems: 'center'}}
                                >
                                    <Text style={{color: '#f97316'}}>Gửi lại mã</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={{marginTop: 20, alignItems: 'center'}}
                        >
                            <Text style={{color: '#999'}}>Quay lại</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}
