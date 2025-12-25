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
  user: any;
  token: any;
  accessToken: string;
  refreshToken: string;
}

export interface RoleDTO {
  id: number;
  roleName: string;
}

export interface UserDTO {
  user: any;
  id: number;
  email: string;
  fullName?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'banned';
  createdAt?: string;
  updatedAt?: string;
  roles?: RoleDTO[];
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

