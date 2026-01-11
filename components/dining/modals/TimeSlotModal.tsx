import { TimeSlot } from "@/props/TimeSlotProps";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TimeSlotModal({ visible, loading, timeSlots, onClose, onSelect }: TimeSlot) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Chọn thời gian</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#E65100" />
          ) : (
            <ScrollView style={{ maxHeight: 400 }}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.slotId}
                  style={styles.slotItem}
                  onPress={() => onSelect(slot)}
                >
                  <Text style={styles.slotText}>{slot.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "88%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  slotItem: {
    padding: 14,
    backgroundColor: "#FFF3E0",
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FB8C00",
  },
  slotText: { fontSize: 16, fontWeight: "500" },
  cancelButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 12,
    marginTop: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: { fontSize: 16, fontWeight: "600" },
});