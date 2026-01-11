import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View, } from "react-native";

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePickerSection({ selectedDate, onDateChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = async (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        setShowPicker(false);
        return;
      }

      if (date) {
        onDateChange(date);
        await AsyncStorage.setItem("selectedDate", date.toISOString().split("T")[0]);
        console.log("Date saved to AsyncStorage: ", date.toISOString().split("T")[0]);
      }

      setShowPicker(false);
    } else {
      if (date) {
        onDateChange(date);
        await AsyncStorage.setItem("selectedDate", date.toISOString());
        console.log("Date saved to AsyncStorage: ", date.toISOString());
      }
    }
  };

  return (
    <View>
      {/* Nút mở DatePicker */}
      <TouchableOpacity style={styles.dateWrapper} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateLabel}>📅 Ngày đặt bàn</Text>
        <Text style={styles.dateValue}>
          {selectedDate.toLocaleDateString("vi-VN")}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          onChange={handleChange}
          locale="vi-VN"
          minimumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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