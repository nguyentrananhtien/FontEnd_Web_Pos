import { BookingFormModalProps } from "@/services/types";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function BookingFormModal({
  visible,
  onClose,
  tableCode,
  formData,
  onFormChange,
  onConfirm,
  loading = false,
}: BookingFormModalProps) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Đặt bàn {tableCode}</Text>

          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={formData.name}
            onChangeText={(text) => onFormChange('name', text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => onFormChange('email', text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => onFormChange('phone', text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Số lượng khách"
            keyboardType="numeric"
            value={formData.totalGuests.toString()}
            onChangeText={(text) => {
              // Chỉ cho nhập số
              if (/^\d*$/.test(text)) {
                onFormChange('totalGuests', text);
              }
            }}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, loading && { opacity: 0.7 }]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.confirmText}>
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt bàn'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 12,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cancelText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#E65100',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontWeight: 'bold' },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
});