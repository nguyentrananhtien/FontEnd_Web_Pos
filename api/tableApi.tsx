import { Table } from '@/models/Table';
import axios from 'axios';
const API_URL = 'http://localhost:9090/api';

// lấy thông tin của bàn
export const getTables = async (): Promise<Table[]> => {
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

// tạo đợn đặt bàn
export const createReservation = async (data: any) => {
  const res = await axios.post(`${API_URL}/reservations`, data);
  return res.data;
};

export const updateTableStatus = async (tableCode: string, status: string) => {
  const res = await axios.put(`${API_URL}/tables/${tableCode}/status`, { status });
  return res.data;
}

export const sendEmail = async (payload: { to: string; subject: string; body: string }) => {
  const res = await axios.post(`${API_URL}/emails/send`, payload);
  return res.data;
}