import { DiningTable } from '@/props/Table';
import axios from 'axios';
const API_URL = 'http://localhost:9090/api';
// export const API_URL = 'http://192.168.1.13:9090/api'; Dùng ipV4 của mạng đang kết nối

// lấy thông tin của bàn
export const getTables = async (): Promise<DiningTable[]> => {
  try {
    const res = await fetch(`${API_URL}/tables`);
    const json = await res.json();

    if (json.success) {
      return json.data;
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Failed to load tables:', error);
    throw error;
  }
};

// Lấy ra các khung thời gian đặt bàn
export const getTimeSlots = async () => {
  try {
    const res = await axios.get<TimeSlotItem[]>(`${API_URL}/timeslots`);
    console.log(res.data)
    return res.data;
  } catch (error) {
    throw error;
  }
}

export const bookingTable = async (
  tableCode: string,
  payload: BookingRequest,
) => {
  try {
    const response = await axios.post(
      `${API_URL}/tables/${tableCode}/book`,
      payload,
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTablesAvailale = async (
  date: string,
  slotId: number
): Promise<{ data: TableAvailableResponse[] }> => {
  try {
    const res = await axios.get<TableAvailableResponse[]>(
      `${API_URL}/tables/availability`,
      {
        params: {
          date,
          slotId,
        },
      }
    );
    console.log(res.data);
    return { data: res.data };
  } catch (error) {
    throw error;
  }
};