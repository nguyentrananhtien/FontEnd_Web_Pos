// screens/DiningScreen.tsx
import DatePickerSection from '@/components/dining/DatePickerSection';
import BookingFormModal from '@/components/dining/modals/BookingFormModal';
import TableListModal from '@/components/dining/modals/TableListModal';
import TimeSlotModal from '@/components/dining/modals/TimeSlotModal';
import { useBookingTables } from '@/hooks/useBookingTable';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DiningScreen() {
  const e = useBookingTables();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dining</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={e.fetchTimeSlots}
        disabled={e.loading}
      >
        {e.loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đặt bàn</Text>
        )}
      </TouchableOpacity>

      <DatePickerSection selectedDate={e.selectedDate} onDateChange={e.setSelectedDate} />

      <TimeSlotModal
        visible={e.modalVisible}
        loading={e.loading}
        timeSlots={e.timeSlots}
        onClose={() => e.setModalVisible(false)}
        onSelect={e.onSelectTimeSlot}
      />

      <TableListModal
        visible={e.tableModalVisible}
        onClose={() => e.setTableModalVisible(false)}
        search={e.searchText}
        onSearch={e.setSearchText}
        areas={e.areas}
        selectedArea={e.selectedArea}
        onSelectArea={e.setSelectedArea}
        tables={e.filteredTables}
        tableLoading={e.tableLoading}
        onTableSelect={e.openBookingForm}
      />

      <BookingFormModal
        visible={e.bookingModalVisible}
        onClose={e.closeBookingForm}
        tableCode={e.selectedTableCode}
        formData={e.formData}
        onFormChange={(field, value) => e.setFormData(prev => ({ ...prev, [field]: value }))}
        onConfirm={e.handleBookTable}
        loading={e.bookingLoading} // thêm state loading nếu cần
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#FF6F00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  dateWrapper: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateLabel: {
    color: "#777",
    fontSize: 14,
    marginBottom: 4,
  },
  dateValue: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
  },
});