import React, { createContext, useContext, ReactNode } from 'react';
import { useCartState, CartItem } from '@/hooks/use-cart';
import { DishDTO } from '@/services/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (dish: DishDTO) => void;
  removeFromCart: (dishId: number) => void;
  updateQuantity: (dishId: number, quantity: number) => void;
  clearCart: () => void;
  getQuantityInCart: (dishId: number) => number;
  getTotalItems: () => number;
  getTotalAmount: () => number;
  selectedReservationId: number | null;
  setReservation: (reservationId: number | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const cartState = useCartState();

  return (
    <CartContext.Provider value={cartState}>
      {children}
    </CartContext.Provider>
  );
};
