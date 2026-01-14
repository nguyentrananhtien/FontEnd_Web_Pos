// ============================================
// TABLE API MODULE
// ============================================
import { api } from '@/services/api';
import { API_CONFIG } from "@/services/config";
import { DiningTableProps, TableAvailableResponse, BookingRequest, TimeSlotItem } from "@/services/types";

const API_URL = API_CONFIG.BASE_URL;

// lấy thông tin của bàn
export const getTables = async (): Promise<DiningTableProps[]> => {
  try {
    const res = await api.get(`${API_CONFIG.ENDPOINTS.TABLES}`);

    if (res.data.success) {
      return res.data.data;
    } else if (Array.isArray(res.data)) {
      return res.data;
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Failed to load tables:', error);
    throw error;
  }
};

// Lấy ra các khung thời gian đặt bàn
export const getTimeSlots = async (): Promise<TimeSlotItem[]> => {
  try {
    const res = await api.get<TimeSlotItem[]>(`/api/timeslots`);
    console.log('Time slots:', res.data);
    return res.data;
  } catch (error) {
    console.error('Failed to load time slots:', error);
    throw error;
  }
}

export const bookingTable = async (
  tableCode: string,
  payload: BookingRequest,
) => {
  try {
    const response = await api.post(
      `/api/tables/${tableCode}/book`,
      payload,
    );
    return response;
  } catch (error) {
    console.error('Failed to book table:', error);
    throw error;
  }
};

export const getTablesAvailale = async (
  date: string,
  slotId: number
): Promise<{ data: TableAvailableResponse[] }> => {
  try {
    const res = await api.get<TableAvailableResponse[]>(
      `/api/tables/availability`,
      {
        params: {
          date,
          slotId,
        },
      }
    );
    console.log('Available tables:', res.data);
    return { data: res.data };
  } catch (error) {
    console.error('Failed to check table availability:', error);
    throw error;
  }
};