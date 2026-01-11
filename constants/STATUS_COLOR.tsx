// constants\table-index.tsx
export type TABLE_STATUSES = 'available' | 'occupied';

export const STATUS_COLOR_MAP: Record<TABLE_STATUSES, string> = {
  available: '#4CAF50',
  occupied: '#F44336',
};