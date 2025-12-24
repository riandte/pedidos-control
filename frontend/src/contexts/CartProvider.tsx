import { useState, ReactNode, useEffect } from 'react';
import { ItemCarrinho } from '../types';
import { CartContext } from './CartContextType';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ItemCarrinho[]>(() => {
    const stored = localStorage.getItem('@PedidosControl:cart');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('@PedidosControl:cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: ItemCarrinho) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantidade, 0);
  
  // Note: ItemCarrinho usually has 'precoTotalEstimado' for the whole item (qty * unit + mods)
  // or we might need to recalculate. Based on ProductModal logic:
  // cartItem.precoTotalEstimado is already the total for that item line.
  const cartTotalValue = cart.reduce((acc, item) => acc + (Number(item.precoTotalEstimado) || 0), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotalItems, cartTotalValue }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook movido para arquivo dedicado para evitar warning de react-refresh
