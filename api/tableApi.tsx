// ============================================
// TABLE API MODULE
// ============================================
import { api } from '@/services/api';
import { API_CONFIG } from "@/services/config";
import { BookingRequest, DiningTableProps, TableAvailableResponse, TimeSlotItem } from "@/services/types";

// lấy thông tin của bàn
export const getTables = async (): Promise<DiningTableProps[]> => {
  try {
    const res = await api.get(`${API_CONFIG.ENDPOINTS.TABLES}`);

    return Array.isArray(res.data?.data)
      ? res.data.data
      : [];
  } catch (error) {
    console.error('Failed to load tables:', error);
    return [];
  }
};

// Lấy ra các khung thời gian đặt bàn
export const getTimeSlots = async (): Promise<TimeSlotItem[]> => {
  try {
    const res = await api.get<TimeSlotItem[]>(`${API_CONFIG.ENDPOINTS.TIMESLOTS}`);
    return res.data;
  } catch (error) {
    console.error('Failed to load time slots:', error);
    throw error;
  }
}

export const bookingTable = async (
  tableCode: string,
  request: BookingRequest,
) => {
  try {
    const response = await api.post(
      `${API_CONFIG.ENDPOINTS.BOOKING_TABLE(tableCode)}`,
      request,
    );
    return response.data;
  } catch (error) {
    console.error('Failed to book table:', error);
    throw error;
  }
};

export const getTablesAvailale = async (
  date: string,
  slotId: number
): Promise<TableAvailableResponse[]> => {
  try {
    const res = await api.get<TableAvailableResponse[]>(
      `${API_CONFIG.ENDPOINTS.AVAILABLE_TABLE}`,
      {
        params: { date, slotId, },
      }
    );
    return res.data;
  } catch (error) {
    console.error('Failed to check table availability:', error);
    throw error;
  }
};

export const checkIn = async (payload: any) => {
  try {
    const res = await api.post(
      API_CONFIG.ENDPOINTS.TABLE_CHECK_IN,
      payload // ✅ gửi payload
    );
    return res.data;
  } catch (error) {
    console.error("Failed to check-in:", error);
    throw error;
  }
};