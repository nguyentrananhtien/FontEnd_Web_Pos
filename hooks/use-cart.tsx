import { useState } from 'react';
import { DishDTO } from '@/services/types';

export interface CartItem {
  dishId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export const useCartState = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (dish: DishDTO) => {
    const existingItem = cart.find(item => item.dishId === dish.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.dishId === dish.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
        imageUrl: dish.imageUrl
      }]);
    }
  };

  const removeFromCart = (dishId: number) => {
    const existingItem = cart.find(item => item.dishId === dishId);

    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item =>
        item.dishId === dishId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.dishId !== dishId));
    }
  };

  const updateQuantity = (dishId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.dishId !== dishId));
    } else {
      setCart(cart.map(item =>
        item.dishId === dishId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getQuantityInCart = (dishId: number): number => {
    const item = cart.find(item => item.dishId === dishId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = (): number => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getQuantityInCart,
    getTotalItems,
    getTotalAmount
  };
};
