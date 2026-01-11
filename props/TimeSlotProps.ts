export interface TimeSlotItem {
  slotId: number;
  label: string;
}

export interface TimeSlot {
  visible: boolean;
  loading: boolean;
  timeSlots: TimeSlotItem[];
  onClose: () => void;
  onSelect: (slot: TimeSlotItem) => void;
}