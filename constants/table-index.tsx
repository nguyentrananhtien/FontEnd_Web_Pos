export const TABLE_STATUSES = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  RESERVED: 'Reserved',
  PENDING: 'Pending',
} as const;

export const STATUS_COLOR_MAP: Record<string, string> = {
  available: '#4CAF50',
  occupied: '#F44336',
  reserved: '#FF9800',
  pending: '#838383',
};