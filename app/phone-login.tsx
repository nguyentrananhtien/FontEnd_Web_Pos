import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from "@/api/authApi";
import { router } from "expo-router";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

const auth = getAuth(app);


export default function PhoneLoginScreen() {
    const recaptchaVerifier = useRef(null);
    const [phoneNumber, setPhoneNumber] = useState('+84');
    const [verificationId, setVerificationId] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ");
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
            Alert.alert('Thành công', 'Mã OTP đã được gửi!');
        } catch (err: any) {
            console.error(err);
            Alert.alert('Lỗi', `Không thể khởi tạo: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    const handleVerifyOTP = async () => {
        if (!code) return;
        setLoading(true);
        try {
            const credential = PhoneAuthProvider.credential(verificationId, code);
            const userCredential = await signInWithCredential(auth, credential);
            const idToken = await userCredential.user.getIdToken();
            const response = await authApi.verifyPhoneOtp(idToken);

            if (response.data?.accessToken) {
                await authApi.saveAuthData(response.data);
                Alert.alert("Thành công", "Đăng nhập POS thành công");
                router.replace('/home');
            }
        } catch (err: any) {
            Alert.alert('Lỗi', 'Mã OTP không chính xác hoặc hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
            <LinearGradient colors={['#f97316', '#ec4899']} style={{flex: 1}}>
                {/* Thành phần cực kỳ quan trọng để hiện reCAPTCHA trên Expo Go/Web */}
                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={firebaseConfig}
                    attemptInvisibleVerification={false}
                />

                <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center', padding: 20}}>
                    <View style={{backgroundColor: 'white', borderRadius: 24, padding: 30, shadowColor: '#000', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.1, shadowRadius: 20}}>
                        <Text style={{fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333'}}>Restaurant POS</Text>
                        <Text style={{fontSize: 14, textAlign: 'center', marginBottom: 30, color: '#666'}}>Xác thực số điện thoại để tiếp tục</Text>

                        {!verificationId ? (
                            <View>
                                <Text style={{fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#444'}}>Số điện thoại</Text>
                                <TextInput
                                    style={{height: 50, borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 16, marginBottom: 20, backgroundColor: '#fcfcfc', fontSize: 16}}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    placeholder="+84 944..."
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={handleSendOTP}
                                    disabled={loading}
                                    style={{backgroundColor: '#f97316', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3}}
                                >
                                    {loading ? <ActivityIndicator color="white" /> : <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Gửi mã OTP</Text>}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                <Text style={{fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#444'}}>Mã OTP 6 số</Text>
                                <TextInput
                                    style={{height: 50, borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 16, marginBottom: 20, backgroundColor: '#fcfcfc', textAlign: 'center', fontSize: 20, letterSpacing: 5}}
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                    placeholder="000000"
                                    maxLength={6}
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={handleVerifyOTP}
                                    disabled={loading}
                                    style={{backgroundColor: '#16a34a', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3}}
                                >
                                    {loading && (
                                        <View style={{ marginBottom: 15, alignItems: 'center' }}>
                                            <ActivityIndicator size="small" color="#f97316" />
                                            <Text style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
                                                Đang khởi tạo xác thực...
                                            </Text>
                                        </View>
                                    )}

                                    {loading ? <ActivityIndicator color="white" /> : <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Xác nhận đăng nhập</Text>}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setVerificationId('')} style={{marginTop: 15, alignItems: 'center'}}>
                                    <Text style={{color: '#f97316', fontWeight: '500'}}>Gửi lại mã khác</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20, alignItems: 'center'}}>
                            <Text style={{color: '#999'}}>Quay lại màn hình đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}