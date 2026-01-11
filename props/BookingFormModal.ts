
export interface BookingFormModalProps {
  visible: boolean;
  onClose: () => void;
  tableCode: string | null;
  formData: {
    name: string;
    email: string;
    phone: string;
    totalGuests: string;
  };
  onFormChange: (field: string, value: string | number) => void;
  onConfirm: () => void;
  loading?: boolean;
}