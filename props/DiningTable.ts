// models\Table.tsx
export interface DiningTable {
  tableId: string;
  tableCode: string;
  seatingCapacity: number;
  status: 'EMPTY' | 'OCCUPIED';
  area: string;
}

export interface TableAvailableResponse {
  tableId: string;
  tableCode: string;
  seatingCapacity: number;
  area: string;
  available: boolean;
}