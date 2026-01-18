import { TABLE_STATUSES } from "@/constants/STATUS_COLOR";

export interface DishDTO {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isSpicy: boolean;
  preparationTime?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  allergens?: AllergenDTO[];
  ingredients?: DishIngredientDTO[];
}

export interface AllergenDTO {
  id: number;
  name: string;
  description: string;
}

export interface DishIngredientDTO {
  ingredientId: number;
  ingredientName: string;
  quantity: string;
}

export interface CartItemDTO {
  id?: number;
  dishId: number;
  dishName: string;
  dishImageUrl?: string;
  quantity: number;
  specialRequests?: string;
  unitPrice: number;
}

export interface CartDTO {
  id?: number;
  sessionId?: string;
  createdAt?: string;
  updatedAt?: string;
  items: CartItemDTO[];
}

export interface CategoryDTO {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface OrderDTO {
  id?: number;
  customerId?: number;
  reservationId?: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  totalAmount: number;
  items: OrderItemDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItemDTO {
  dishId: number;
  dishName: string;
  quantity: number;
  unitPrice: number;
  specialRequests?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  avatar?: string;
  roles?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: any;
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}

export interface RoleDTO {
  id: number;
  roleName: string;
}

export interface UserDTO {
  id: number;
  email: string;
  fullName?: string;
  name?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'banned';
  createdAt?: string;
  updatedAt?: string;
  roles?: RoleDTO[];
}

export interface CurrentUserResponse {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  roles: string[];
}

export interface VNPayPaymentRequest {
  orderId: number;
  amount: number;
  orderInfo: string;
}

export interface VNPayPaymentResponse {
  paymentId: number;
  txnRef: string;
  paymentUrl: string;
  amount: number;
  status: string;
}

export interface DiningTableProps {
  tableId: string;
  tableCode: string;
  seatingCapacity: number;
  status: 'EMPTY' | 'OCCUPIED';
  area: string;
}

export interface SearchResultDTO {
  resultType: 'DISH' | 'TABLE';
  id: number;
  name: string;
  code?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  status: string;
  seatingCapacity?: number;
  area?: string;
  matchedFields: string[];
}

export interface GlobalSearchResponseDTO {
  query: string;
  totalResults: number;
  dishCount: number;
  tableCount: number;
  results: SearchResultDTO[];
}

// Booking and Table related types (moved from props/)
export interface BookingRequest {
  userId?: number; // User ID của user đang đăng nhập
  name: string;
  email: string;
  phone: string;
  totalGuests: number;
  date: string;
  slotId: number;
}

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

export interface TableAvailableResponse {
  tableId: string;
  tableCode: string;
  seatingCapacity: number;
  area: string;
  available: boolean;
}

