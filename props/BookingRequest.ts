export interface BookingRequest {
  name: string;
  email: string;
  phone: string;
  totalGuests: number;
  date: string; // hoặc Date
  slotId: number;
}
