import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const SLOTS = [
  { slotId: 1, start: "06:00", label: "06:00 - 09:00" },
  { slotId: 2, start: "09:00", label: "09:00 - 12:00" },
  { slotId: 3, start: "12:00", label: "12:00 - 15:00" },
  { slotId: 4, start: "15:00", label: "15:00 - 18:00" },
  { slotId: 5, start: "18:00", label: "18:00 - 21:00" },
  { slotId: 6, start: "21:00", label: "21:00 - 24:00" },
];

export default function Food() {
  const { tableCode } = useLocalSearchParams<{ tableCode: string }>(); // 👈 Nhận tableCode trực tiếp
  const router = useRouter();

  const [bookingCode, setBookingCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  // Khi nhận được tableCode từ QR → mở modal ngay
  useEffect(() => {
    if (tableCode) {
      setShowModal(true);
    }
  }, [tableCode]);

  /** Auto detect slot */
  const autoDetectSlot = () => {
    const now = new Date();
    for (const slot of SLOTS) {
      const [sh, sm] = slot.start.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(sh, sm, 0, 0);
      const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // toàn bộ slot (3h)

      if (now >= startDate && now < endDate) {
        return slot.slotId;
      }
    }
    return null;
  };

  useEffect(() => {
    if (showModal) {
      setSelectedSlotId(autoDetectSlot());
    }
  }, [showModal]);

  /** Handle check-in */
  const handleCheckIn = async () => {
    if (!bookingCode.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã đặt bàn");
      return;
    }
    if (!selectedSlotId) {
      Alert.alert("Lỗi", "Vui lòng chọn khung giờ");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        bookingCode: bookingCode.trim(),
        tableCode: tableCode, // 👈 Dùng trực tiếp tableCode từ QR
        date: format(new Date(), "yyyy-MM-dd"),
        slotId: selectedSlotId,
      };

      const res = await fetch("http://192.168.1.13:9090/api/tables/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Check-in thất bại");
      }

      setCheckInSuccess(true);
    } catch (err: any) {
      Alert.alert("Check-in thất bại", err.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  /** SUCCESS SCREEN */
  if (checkInSuccess) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          Chào mừng quý khách!
        </Text>
        <Text style={{ marginTop: 20 }}>
          Check-in thành công. Quý khách có thể gọi món.
        </Text>
      </View>
    );
  }

  /** MAIN UI */
  return (
    <View style={{ flex: 1 }}>
      <Modal visible={showModal} animationType="slide" transparent={false}>
        <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
          <Text style={{ fontSize: 20, marginBottom: 20, textAlign: "center" }}>
            Xác nhận check-in bàn {tableCode}
          </Text>

          <TextInput
            placeholder="Nhập mã đặt bàn (OTP)"
            value={bookingCode}
            onChangeText={setBookingCode}
            style={styles.input}
            autoCapitalize="characters"
          />

          {selectedSlotId && (
            <Text style={{ marginVertical: 20, fontSize: 16 }}>
              Khung giờ tự động phát hiện:{" "}
              {SLOTS.find((s) => s.slotId === selectedSlotId)?.label}
            </Text>
          )}

          <View style={styles.actions}>
            <Button title="Hủy" onPress={() => router.back()} />
            <Button
              title={isLoading ? "Đang xử lý..." : "Check-in"}
              onPress={handleCheckIn}
              disabled={isLoading}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  actions: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
