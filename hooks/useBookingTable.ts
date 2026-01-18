import { bookingTable, getTables, getTablesAvailale, getTimeSlots } from "@/api/tableApi";
import { useAuth } from "@/providers/auth-provider";
import { BookingRequest, DiningTableProps, TimeSlotItem } from "@/services/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTables } from "./useTables";

export const useBookingTables = () => {
  const [loading, setLoading] = useState(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [tableModalVisible, setTableModalVisible] = useState(false);

  // Tables
  const { tables, setTables, areas, loading: tableLoading } = useTables();
  const [selectedArea, setSelectedArea] = useState("All");
  const [searchText, setSearchText] = useState("");

  // Time slots
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlotItem[]>([]);

  // Date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // User
  const { user } = useAuth();

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchArea = selectedArea === "All" || t.area === selectedArea;
      const matchSearch = t.tableCode
        .toLowerCase()
        .includes(searchText.toLowerCase());
      return matchArea && matchSearch;
    });
  }, [tables, selectedArea, searchText]);

  const onSelectTimeSlot = async (slot: TimeSlotItem) => {
    if (loading) return;
    setSelectedSlotId(slot.slotId);
    await AsyncStorage.setItem("selectedSlotId", slot.slotId.toString());
    setTableModalVisible(true);
    setModalVisible(false);
    await fetchTablesBySlot(slot.slotId);
  };

  const fetchTablesBySlot = async (slotId: number) => {
    setLoading(true);
    try {
      const date = selectedDate.toISOString().split("T")[0];
      const res = await getTablesAvailale(date, slotId);

      const mappedTables: DiningTableProps[] = res.map((t) => ({
        tableId: t.tableId,
        tableCode: t.tableCode,
        name: t.tableCode,
        seatingCapacity: t.seatingCapacity,
        area: t.area,
        status: t.available ? 'EMPTY' : 'OCCUPIED',
      }));

      setTables(mappedTables);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const response = await getTimeSlots();
      setTimeSlots(response);
      setModalVisible(true);
    } catch (error) {
      console.error("Failed to fetch time slots", error);
    } finally {
      setLoading(false);
    }
  };

  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedTableCode, setSelectedTableCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    totalGuests: '1',
  });

  const openBookingForm = (tableCode: string) => {
    setSelectedTableCode(tableCode);
    // Reset form nếu cần
    setFormData({
      name: user?.fullName || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      totalGuests: '1',
    });
    setBookingModalVisible(true);
  };

  const closeBookingForm = () => {
    setBookingModalVisible(false);
    setSelectedTableCode(null);
  };

  const [bookingLoading, setBookingLoading] = useState(false);

  const handleBookTable = async () => {
    if (!selectedTableCode) return;
    const totalGuestsNumber = Number(formData.totalGuests);

    // Validate đơn giản
    if (!formData.name || !formData.email || !formData.phone || !totalGuestsNumber || totalGuestsNumber < 1) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Validate số lượng khách không vượt quá sức chứa của bàn
    const selectedTable = tables.find(t => t.tableCode === selectedTableCode);
    if (selectedTable && totalGuestsNumber > selectedTable.seatingCapacity) {
      Alert.alert(
        'Lỗi',
        `Số lượng khách (${totalGuestsNumber}) vượt quá sức chứa của bàn (${selectedTable.seatingCapacity} người). Vui lòng chọn bàn khác hoặc giảm số lượng khách.`
      );
      return;
    }

    setBookingLoading(true);

    try {
      const payload: BookingRequest = {
        userId: user?.id, // Thêm userId của user đang đăng nhập
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        totalGuests: Number(formData.totalGuests),
        date: selectedDate.toISOString().split('T')[0],
        slotId: selectedSlotId!,
      };

      const response = await bookingTable(selectedTableCode, payload);

      console.log(response.data);
      if (response.success) {
        Alert.alert('Thành công', 'Đặt bàn thành công! Mã đặt bàn đã được gửi qua email.');

        closeBookingForm();
        getTables();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Đã có lỗi xảy ra rồi';
      Alert.alert('Lỗi', msg);
    } finally {
      setBookingLoading(false);
    }
  };

  return {
    // state
    loading,
    modalVisible,
    tableModalVisible,
    timeSlots,
    selectedDate,
    selectedArea,
    searchText,
    areas,
    tableLoading,
    filteredTables,
    bookingModalVisible,
    selectedTableCode,
    formData,
    bookingLoading,

    // setters
    setModalVisible,
    setTableModalVisible,
    setSelectedDate,
    setSelectedArea,
    setSearchText,
    setBookingModalVisible,
    setSelectedTableCode,
    setFormData,
    setBookingLoading,

    // actions
    fetchTimeSlots,
    onSelectTimeSlot,
    openBookingForm,
    closeBookingForm,
    handleBookTable,
    fetchTablesBySlot,
  };
};