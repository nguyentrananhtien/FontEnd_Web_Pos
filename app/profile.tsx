import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
    Modal,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/providers/auth-provider';
import api from '@/services/api';

interface AccountData {
    id: number | null;
    email: string;
    fullName: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
    dob: string;
    avatar?: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const { user, refreshUserData, isLoading: authLoading } = useAuth();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);

    const [account, setAccount] = useState<AccountData>({
        id: null,
        email: '',
        fullName: '',
        phone: '',
        gender: 'other',
        dob: '',
        avatar: undefined,
    });

    // Load user info from auth provider
    useEffect(() => {
        if (user) {
            setAccount({
                id: user.id || null,
                email: user.email || '',
                fullName: user.fullName || user.name || '',
                phone: user.phone || '',
                gender: (user.gender as 'male' | 'female' | 'other') || 'other',
                dob: user.dob || '',
                avatar: user.avatar ,
            });
        }
    }, [user]);

    // Refresh user data on mount
    useEffect(() => {
        refreshUserData();
    }, []);

    const requestPermissions = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập thư viện ảnh để thay đổi avatar.');
                return false;
            }
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const base64Image = result.assets[0].base64;
                if (base64Image) {
                    const base64WithPrefix = `data:image/jpeg;base64,${base64Image}`;
                    setAccount({ ...account, avatar: base64WithPrefix });
                    setShowAvatarModal(false);
                }
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
            console.error('Image picker error:', error);
        }
    };

    const handleSave = async () => {
        if (!account.id) return;
        setIsSaving(true);

        try {
            const updateDto = {
                fullName: account.fullName,
                phone: account.phone,
                gender: account.gender,
                dob: account.dob,
                status: "active",
                avatar: account.avatar
            };

            // Use api.instance để tự động include token
            await api.instance.put(
                `/api/v1/accounts/${account.id}`,
                updateDto
            );

            setIsEditing(false);
            Alert.alert("Thành công", "Đã cập nhật thông tin.");

            // Refresh user data to update UI
            await refreshUserData();
        } catch (error: any) {
            console.error('Update profile error:', error);
            Alert.alert(
                "Lỗi",
                error.response?.data?.message || "Không thể cập nhật thông tin. Vui lòng thử lại."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = () => {
        router.push({
            pathname: '/auth/forgot-password' as any,
            params: { email: account.email }
        });
    };

    // Show loading when auth is loading or no user yet
    if (authLoading || !user) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#f97316" />
                <Text style={{ marginTop: 10, color: '#666' }}>Đang tải thông tin...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => isEditing ? setShowAvatarModal(true) : null}
                    style={styles.avatarContainer}
                    disabled={!isEditing}
                >
                    {account.avatar ? (
                        <Image source={{ uri: account.avatar }} style={styles.avatar} />
                    ) : (
                        <Ionicons name="person-circle" size={100} color="#f97316" />
                    )}
                    {isEditing && (
                        <View style={styles.avatarEditBadge}>
                            <Ionicons name="camera" size={18} color="#fff" />
                        </View>
                    )}
                </TouchableOpacity>
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

            {/* Các chức năng bổ trợ */}
            <View style={styles.actionSection}>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/orders')}>
                    <View style={styles.menuIconBox}><Ionicons name="receipt" size={20} color="#f97316" /></View>
                    <Text style={styles.menuText}>Đơn hàng của tôi</Text>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/invoices')}>
                    <View style={styles.menuIconBox}><Ionicons name="document-text" size={20} color="#f97316" /></View>
                    <Text style={styles.menuText}>Hóa đơn</Text>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
                    <View style={styles.menuIconBox}><Ionicons name="lock-closed" size={20} color="#f97316" /></View>
                    <Text style={styles.menuText}>Đổi mật khẩu</Text>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/home')}>
                    <View style={styles.menuIconBox}><Ionicons name="home" size={20} color="#f97316" /></View>
                    <Text style={styles.menuText}>Quay lại</Text>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>

            </View>

            <Modal
                visible={showAvatarModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowAvatarModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thay đổi ảnh đại diện</Text>
                        <Text style={styles.modalSubtitle}>Bạn có muốn chọn ảnh mới?</Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                onPress={pickImage}
                            >
                                <Ionicons name="images-outline" size={20} color="#fff" />
                                <Text style={styles.modalButtonText}>Chọn ảnh</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSecondary]}
                                onPress={() => setShowAvatarModal(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: '#6B7280' }]}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { alignItems: 'center', paddingVertical: 45, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 3 },
    avatarContainer: { position: 'relative', marginBottom: 15 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#f97316' },
    avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#f97316', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
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
    menuText: { flex: 1, marginLeft: 15, fontSize: 15, color: '#374151', fontWeight: '500' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25, width: '85%', maxWidth: 400, elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 25 },
    modalButtons: { gap: 12 },
    modalButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
    modalButtonPrimary: { backgroundColor: '#f97316' },
    modalButtonSecondary: { backgroundColor: '#F3F4F6' },
    modalButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' }
});