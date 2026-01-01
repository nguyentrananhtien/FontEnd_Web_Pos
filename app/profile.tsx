import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Interface chuẩn khớp với UpdateAccountRequest DTO của bạn
interface AccountData {
    id: number | null;
    email: string;
    fullName: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
    dob: string;
}

interface MyTokenPayload extends JwtPayload {
    sub: string;
    id?: number;
}

export default function ProfileScreen() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const ACCESSTOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlcyI6WyJ2aWV3X2Rhc2hib2FyZCIsInZpZXdfb3JkZXJzIiwiY3VzdG9tZXIiXSwic3ViIjoibGV2dWh1bmc2NzhAZ21haWwuY29tIiwianRpIjoiMDQ3OGY1NTktM2MwYS00NGRlLThlNzUtNmFiNTAxMzcxYmYzIiwiaWF0IjoxNzY3MjM4NTUwLCJleHAiOjE3NjcyNDIxNTB9.-RsCt5-XHLWLYNg7QdSOXHN6GzXg5xATNwowfmAAIAtPLdC3paRscGsDi0vSNz-xR0ZsWFwgkwDDfGM58SeoFg";

    const [account, setAccount] = useState<AccountData>({
        id: null,
        email: '',
        fullName: 'Lê Văn Hùng',
        phone: '0912345678',
        gender: 'other',
        dob: '1998-10-20',
    });

    useEffect(() => {
        try {
            const decoded = jwtDecode<MyTokenPayload>(ACCESSTOKEN);
            setAccount(prev => ({
                ...prev,
                email: decoded.sub || '',
                id: decoded.id || 1 // Backend cần ID này cho PathVariable {id}
            }));
        } catch (error) {
            console.error("JWT Decode Error:", error);
        }
    }, []);

    const handleSave = async () => {
        if (!account.id) return;
        setIsSaving(true);

        // Lấy URL từ file .env
        const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
        const API_URL = `${BASE_URL}/api/v1/accounts/${account.id}`;

        try {
            const updateDto = {
                fullName: account.fullName,
                phone: account.phone,
                gender: account.gender,
                dob: account.dob,
                status: "active"
            };

            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESSTOKEN}`
                },
                body: JSON.stringify(updateDto)
            });

            if (response.ok) {
                setIsEditing(false);
                Alert.alert("Thành công", "Đã cập nhật thông tin.");
            } else {
                Alert.alert("Lỗi", "Không thể lưu dữ liệu.");
            }
        } catch (error) {
            Alert.alert("Lỗi kết nối", "Vui lòng kiểm tra cấu hình mạng trong file .env");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = () => {
        router.push({
            pathname: '/forgot-password' as any,
            params: { email: account.email }
        });
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header section */}
            <View style={styles.header}>
                <Ionicons name="person-circle" size={100} color="#f97316" />
                <Text style={styles.emailText}>{account.email || 'Loading...'}</Text>

                <TouchableOpacity
                    style={[styles.editOption, isEditing && styles.editingBtn]}
                    onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Ionicons name={isEditing ? "save-outline" : "create-outline"} size={18} color={isEditing ? "#fff" : "#f97316"} />
                            <Text style={[styles.editOptionText, isEditing && { color: '#fff' }]}>
                                {isEditing ? "Lưu thay đổi" : "Thay đổi thông tin cá nhân"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Thông tin chi tiết (Read-only khi không edit) */}
            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.readOnlyInput]}
                        value={account.fullName}
                        editable={isEditing}
                        onChangeText={(t) => setAccount({ ...account, fullName: t })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Số điện thoại</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.readOnlyInput]}
                        value={account.phone}
                        editable={isEditing}
                        keyboardType="phone-pad"
                        onChangeText={(t) => setAccount({ ...account, phone: t })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ngày sinh (YYYY-MM-DD)</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.readOnlyInput]}
                        value={account.dob}
                        editable={isEditing}
                        onChangeText={(t) => setAccount({ ...account, dob: t })}
                    />
                </View>
            </View>

            {/* Các chức năng bổ trợ đã khôi phục */}
            <View style={styles.actionSection}>
                <Text style={styles.sectionTitle}>Tài khoản & Hoạt động</Text>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/history' as any)}>
                    <View style={styles.menuIconBox}><Ionicons name="receipt" size={20} color="#f97316" /></View>
                    <Text style={styles.menuText}>Lịch sử mua hàng</Text>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
                    <View style={styles.menuIconBox}><Ionicons name="lock-closed" size={20} color="#f97316" /></View>
                    <Text style={styles.menuText}>Đổi mật khẩu</Text>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.menuItem, { borderBottomWidth: 0 }]}
                    onPress={() => router.replace('/login' as any)}
                >
                    <View style={[styles.menuIconBox, { backgroundColor: '#FEE2E2' }]}><Ionicons name="log-out" size={20} color="#EF4444" /></View>
                    <Text style={[styles.menuText, { color: '#EF4444' }]}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { alignItems: 'center', paddingVertical: 45, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 3 },
    emailText: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 10 },
    editOption: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FFEDD5' },
    editingBtn: { backgroundColor: '#f97316', borderColor: '#f97316' },
    editOptionText: { marginLeft: 8, color: '#f97316', fontWeight: 'bold', fontSize: 14 },
    formSection: { backgroundColor: '#fff', marginTop: 15, padding: 25, marginHorizontal: 15, borderRadius: 20, elevation: 1 },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 20, color: '#9CA3AF', textTransform: 'uppercase' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 12, color: '#9CA3AF', marginBottom: 5 },
    input: { borderBottomWidth: 1.5, borderColor: '#F3F4F6', paddingVertical: 10, fontSize: 16, color: '#1F2937' },
    readOnlyInput: { color: '#9CA3AF', borderBottomWidth: 0 },
    actionSection: { backgroundColor: '#fff', marginTop: 15, paddingHorizontal: 25, marginHorizontal: 15, borderRadius: 20, marginBottom: 30, elevation: 1 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    menuIconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' },
    menuText: { flex: 1, marginLeft: 15, fontSize: 15, color: '#374151', fontWeight: '500' }
});