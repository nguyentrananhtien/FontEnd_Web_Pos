// screens/DiningScreen.tsx
import FilterTabs from '@/components/dining/FilterTabs';
import LegendBar from '@/components/dining/LegendBar';
import SearchBar from '@/components/dining/SearchBar';
import TableCard from '@/components/dining/TableCard';
import BookingFormModal from '@/components/dining/modals/BookingFormModal';
import DatePickerSection from '@/components/dining/DatePickerSection';
import { useTables } from '@/hooks/useTables';
import { useAuth } from '@/providers/auth-provider';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Alert, TouchableOpacity, Modal } from 'react-native';
import { router } from 'expo-router';

interface TimeSlot {
  slotId: number;
  startTime: string;
  endTime: string;
  label: string;
  isActive: boolean;
}

export default function DiningScreen() {
  const { tables, areas, loading } = useTables();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Booking states
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [timeSlotModalVisible, setTimeSlotModalVisible] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    totalGuests: '2',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        totalGuests: '2',
      });
    }
  }, [user]);

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
    try {
      const response = await api.instance.get('/api/timeslots');
      setTimeSlots(response.data);
    } catch (error) {
      console.error('Error loading time slots:', error);
    }
  };

  const filteredTables = tables.filter((t) => {
    const matchesSearch = t.tableCode.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || t.area === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const mapStatus = (status: string) => {
    switch (status) {
      case 'Available':
        return 'available';
      case 'Occupied':
        return 'occupied';
      case 'Reserved':
        return 'reserved';
      case 'Pending':
        return 'pending';
      default:
        return 'available';
    }
  };

  const handleTablePress = (table: any) => {
    if (table.status !== 'Available') {
      Alert.alert('Thông báo', 'Bàn này hiện không khả dụng');
      return;
    }

    setSelectedTable(table);
    setBookingModalVisible(true);
  };

  const handleFormChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value.toString() }));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setTimeSlotModalVisible(false);
  };

  const handleOpenTimeSlotModal = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.totalGuests) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setBookingModalVisible(false);
    setTimeSlotModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!user?.id || !selectedTable || !selectedTimeSlot) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày và giờ đặt bàn');
      return;
    }

    const guestCount = parseInt(formData.totalGuests);
    if (isNaN(guestCount) || guestCount < 1) {
      Alert.alert('Lỗi', 'Số lượng khách không hợp lệ');
      return;
    }

    setBookingLoading(true);

    try {
      const reservationData = {
        userId: user.id,
        tableId: selectedTable.tableId,
        reservationDate: selectedDate.toISOString().split('T')[0],
        timeSlotId: selectedTimeSlot.slotId,
        numberOfGuests: guestCount,
        notes: `${formData.name} - ${formData.email} - ${formData.phone}`
      };

      console.log('Creating reservation:', reservationData);
      const response = await api.instance.post('/api/reservations', reservationData);

      console.log('Reservation created:', response.data);

      // Store reservation ID for later use
      await AsyncStorage.setItem('LAST_RESERVATION_ID', response.data.reservationId.toString());

      Alert.alert(
        'Thành công!',
        `Đặt bàn ${selectedTable.tableCode} thành công!\n\nMã đặt bàn: #${response.data.reservationId}\nNgày: ${selectedDate.toLocaleDateString('vi-VN')}\nGiờ: ${selectedTimeSlot.label}\n\nBạn có muốn đặt món ngay không?`,
        [
          {
            text: 'Để sau',
            style: 'cancel',
            onPress: () => {
              resetBookingState();
            }
          },
          {
            text: 'Đặt món ngay',
            onPress: () => {
              const reservationId = response.data.reservationId;
              const tableCode = selectedTable.tableCode;
              resetBookingState();
              router.push({
                pathname: '/(tabs)/menu',
                params: {
                  tableCode,
                  reservationId: reservationId.toString()
                }
              });
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể đặt bàn. Vui lòng thử lại.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBookingState = () => {
    setBookingModalVisible(false);
    setTimeSlotModalVisible(false);
    setSelectedTable(null);
    setSelectedTimeSlot(null);
    setSelectedDate(new Date());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dining</Text>
      <SearchBar value={search} onChange={setSearch} />
      <FilterTabs filters={areas} activeFilter={activeFilter} onSelect={setActiveFilter} />

      <LegendBar />

      {loading ? (
        <ActivityIndicator size="large" color="#E65100" />
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {filteredTables.map((t) => (
            <TableCard
              key={t.tableId}
              id={t.tableCode}
              pax={t.seatingCapacity}
              status={mapStatus(t.status) as any}
              onPress={() => handleTablePress(t)}
            />
          ))}
        </ScrollView>
      )}

      {/* Booking Form Modal */}
      {selectedTable && (
        <BookingFormModal
          visible={bookingModalVisible}
          onClose={resetBookingState}
          tableCode={selectedTable.tableCode}
          formData={formData}
          onFormChange={handleFormChange}
          onConfirm={handleOpenTimeSlotModal}
          loading={bookingLoading}
        />
      )}

      {/* Date & Time Slot Selection Modal */}
      <Modal
        visible={timeSlotModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTimeSlotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.modalTitle}>Chọn ngày và giờ</Text>

            <DatePickerSection
              selectedDate={selectedDate}
              onDateChange={handleDateSelect}
            />

            <Text style={styles.sectionTitle}>Chọn khung giờ:</Text>
            <ScrollView style={styles.timeSlotScroll}>
              {timeSlots.filter(slot => slot.isActive).map((slot) => (
                <TouchableOpacity
                  key={slot.slotId}
                  style={[
                    styles.timeSlotButton,
                    selectedTimeSlot?.slotId === slot.slotId && styles.timeSlotSelected
                  ]}
                  onPress={() => handleTimeSlotSelect(slot)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTimeSlot?.slotId === slot.slotId && styles.timeSlotTextSelected
                  ]}>
                    {slot.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedTimeSlot && (
              <View style={styles.confirmSection}>
                <Text style={styles.selectedInfo}>
                  📅 {selectedDate.toLocaleDateString('vi-VN')}
                </Text>
                <Text style={styles.selectedInfo}>
                  🕐 {selectedTimeSlot.label}
                </Text>
                <Text style={styles.selectedInfo}>
                  👥 {formData.totalGuests} khách
                </Text>

                <TouchableOpacity
                  style={styles.finalConfirmButton}
                  onPress={handleConfirmBooking}
                  disabled={bookingLoading}
                >
                  <Text style={styles.finalConfirmText}>
                    {bookingLoading ? 'Đang xử lý...' : 'Xác nhận đặt bàn'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setTimeSlotModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Changed from #fff to light gray để tránh white-on-white
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimeContainer: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  timeSlotScroll: {
    maxHeight: 200,
  },
  timeSlotButton: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  timeSlotSelected: {
    backgroundColor: '#E65100',
    borderColor: '#E65100',
  },
  timeSlotText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  confirmSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  selectedInfo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  finalConfirmButton: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#E65100',
    borderRadius: 8,
    alignItems: 'center',
  },
  finalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    padding: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
