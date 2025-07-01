'use client';

import React, { createContext, useContext, useReducer, ReactNode, useState } from 'react';
import { CartItem, MenuItem, CartContextType, Order } from '@/types';
import { createOrder } from '@/lib/database';

type CartAction = 
  | { type: 'ADD_ITEM'; payload: MenuItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { menu_id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartState {
  items: CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.menu_id === action.payload.menu_id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.menu_id === action.payload.menu_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      
      return {
        ...state,
        items: [...state.items, {
          menu_id: action.payload.menu_id,
          name: action.payload.name,
          price: action.payload.price,
          quantity: 1,
          image_url: action.payload.image_url
        }],
      };
    }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.menu_id !== action.payload),
      };
    
    case 'UPDATE_QUANTITY': {
      const { menu_id, quantity } = action.payload;
      
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.menu_id !== menu_id),
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.menu_id === menu_id ? { ...item, quantity } : item
        ),
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };
    
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutOrderTotal, setCheckoutOrderTotal] = useState(0);

  const addItem = (item: MenuItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (menuId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: menuId });
  };

  const updateQuantity = (menuId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { menu_id: menuId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const showCheckoutModal = (orderTotal: number) => {
    setCheckoutOrderTotal(orderTotal);
    setIsCheckoutModalOpen(true);
  };

  const hideCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutOrderTotal(0);
  };

  const createOrderFromCart = async (customerNote?: string, businessEmail?: string): Promise<Order | null> => {
    if (state.items.length === 0) return null;

    const orderItems = state.items.map(item => ({
      menu_id: item.menu_id,
      quantity: item.quantity
    }));

    try {
      const order = await createOrder(orderItems, customerNote, businessEmail);
      if (order) {
        clearCart(); // Clear cart after successful order
      }
      return order;
    } catch (error) {
      console.error('Error creating mock order:', error);
      return null;
    }
  };

  const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    createOrder: createOrderFromCart,
    isCheckoutModalOpen,
    checkoutOrderTotal,
    showCheckoutModal,
    hideCheckoutModal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
