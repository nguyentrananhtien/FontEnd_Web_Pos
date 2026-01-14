// constants\STATUS_COLOR.tsx
export type TABLE_STATUSES = 'available' | 'occupied' | 'reserved' | 'pending';

export const STATUS_COLOR_MAP: Record<TABLE_STATUSES, string> = {
  available: '#4CAF50',    // Green - Có sẵn
  occupied: '#F44336',     // Red - Đang dùng
  reserved: '#FF9800',     // Orange - Đã đặt
  pending: '#9E9E9E',      // Gray - Đang chờ
};