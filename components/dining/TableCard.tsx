import { createReservation, sendEmail, updateTableStatus } from '@/api/tableApi';
import { STATUS_COLOR_MAP } from '@/constants/table-index';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TableCardProps {
  id: string;
  pax: number;
  status: 'available' | 'occupied' | 'reserved' | 'pending';
}

export default function TableCard({ id, pax, status }: TableCardProps) {
  const color = STATUS_COLOR_MAP[status] || '#BDBDBD';
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', guests: '' });
  const [currentStatus, setcurrentStatus] = useState(status);

  const handlePress = async () => {
    if (currentStatus === 'available') {
      await updateTableStatus(id, 'Pending');
      setcurrentStatus('pending');
      setShowForm(true);
    }
  }

  const handleCancel = async () => {
    await updateTableStatus(id, 'Available');
    setcurrentStatus('available');
    setShowForm(false);
  }

  const handleConfirm = async () => {
    try {
      // Booking code có 6 kí tự ngẫu nhiên
      const bookingCode = Array.from({ length: 6 }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(
          Math.floor(Math.random() * 36)
        )
      ).join('');

      // Tạo đơnd đặt bàn
      await createReservation({
        contactName: form.name,
        contactPhone: form.phone,
        contactEmail: form.email,
        totalGuests: Number(form.guests),
        bookingCode,
        tableCode: id,
      });

      // Gửi Email
      await sendEmail({
        to: form.email,
        subject: 'Xác nhận đặt bàn',
        body: `
          Xin chào ${form.name},
          Cảm ơn bạn đã đặt bàn ${id}.
          Mã đặt bàn của bạn: ${bookingCode}.
          Số khách: ${form.guests}.
        `,
      });

      // Cập nhật trạng thái của bàn
      await updateTableStatus(id, 'Reserved');
      setcurrentStatus('reserved');
      // Gọi API tạo reservation
    } catch (error) {
      console.log(error);
      setcurrentStatus('available');
    } finally {
      setShowForm(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={handlePress}>
        {/* Hàng ghế trên */}
        <View style={styles.seatRow}>
          {[...Array(2)].map((_, i) => (
            <View key={`top-${i}`} style={[styles.seat, { backgroundColor: color }]} />
          ))}
        </View>

        <View style={styles.row}>
          {/* Ghế bên trái */}
          <View style={styles.sideSeats}>
            {[...Array(1)].map((_, i) => (
              <View key={`left-${i}`} style={[styles.seat, { backgroundColor: color }]} />
            ))}
          </View>

          {/* Thân bàn */}
          <View style={[styles.card, { backgroundColor: color }]}>
            <Text style={styles.tableId}>{id}</Text>
            <Text style={styles.tablePax}>Max pax: {pax}</Text>
          </View>

          {/* Ghế bên phải */}
          <View style={styles.sideSeats}>
            {[...Array(1)].map((_, i) => (
              <View key={`right-${i}`} style={[styles.seat, { backgroundColor: color }]} />
            ))}
          </View>
        </View>

        {/* Hàng ghế dưới */}
        <View style={styles.seatRow}>
          {[...Array(2)].map((_, i) => (
            <View key={`bottom-${i}`} style={[styles.seat, { backgroundColor: color }]} />
          ))}
        </View>

        {/* Modal form đặt bàn */}
        <Modal visible={showForm} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Đặt bàn {id}</Text>

              <TextInput
                placeholder="Tên khách hàng"
                style={styles.input}
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
                placeholderTextColor="#999"
              />
              <TextInput
                placeholder="Email"
                style={styles.input}
                value={form.email}
                onChangeText={(v) => setForm({ ...form, email: v })}
                keyboardType="email-address"
                placeholderTextColor="#999"
              />
              <TextInput
                placeholder="Số điện thoại"
                style={styles.input}
                value={form.phone}
                onChangeText={(v) => setForm({ ...form, phone: v })}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
              <TextInput
                placeholder="Số khách"
                keyboardType="numeric"
                style={styles.input}
                value={form.guests}
                onChangeText={(v) => setForm({ ...form, guests: v })}
                placeholderTextColor="#999"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={handleCancel} style={[styles.button, styles.cancelButton]}>
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm} style={[styles.button, styles.confirmButton]}>
                  <Text style={styles.buttonText}>Đồng ý</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </TouchableOpacity>
    </View>

  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '47%',
    alignItems: 'center',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 35,
  },
  sideSeats: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  seat: {
    width: 8,
    height: 8,
    borderRadius: 2,
    opacity: 0.6,
  },
  card: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  tableId: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  tablePax: {
    color: '#fff',
    fontSize: 12,
  },

  /*** Modal Styles ***/
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#E65100',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  confirmButton: {
    backgroundColor: '#E65100',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});