import { TABLE_STATUSES } from "@/constants/STATUS_COLOR";

export interface TableListProps {
  visible: boolean;
  onClose: () => void;
  search: string;
  onSearch: (v: string) => void;
  areas: string[];
  selectedArea: string;
  onSelectArea: (a: string) => void;
  tables: any[];
  tableLoading: boolean;
  onTableSelect: (tableCode: string) => void;
}

export interface TableCardProps {
  id: string;
  pax: number;
  status: TABLE_STATUSES;
  disabled?: boolean;
  onPress?: () => void;
}
