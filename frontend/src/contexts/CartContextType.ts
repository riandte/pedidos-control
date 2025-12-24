import { createContext } from 'react';
import { ItemCarrinho } from '../types';

export interface CartContextData {
  cart: ItemCarrinho[];
  addToCart: (item: ItemCarrinho) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartTotalItems: number;
  cartTotalValue: number;
}

export const CartContext = createContext<CartContextData>({} as CartContextData);
