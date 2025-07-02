export interface MenuItem {
  menu_id: string;
  name: string;
  price: number;
  availability: boolean;
  image_url?: string;
  description?: string;
  created_by_email?: string;
  total_ordered: number;
  created_at: string;
  updated_at: string;
  rating?: number;
  chef_signature?: string;
}

export interface Order {
  order_id: number;
  order_number: number;
  total_amount: number;
  status: 'pending' | 'done' | 'cancelled';
  customer_note?: string;
  customer_email?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: number;
  menu_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  menu_item?: MenuItem;
}

export interface CartItem {
  menu_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

// Legacy types for backward compatibility
export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  createOrder: (customerNote?: string, businessEmail?: string) => Promise<Order | null>;
  // Checkout modal state
  isCheckoutModalOpen: boolean;
  checkoutOrderTotal: number;
  showCheckoutModal: (orderTotal: number) => void;
  hideCheckoutModal: () => void;
}
