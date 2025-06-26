export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: Date;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: FoodItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}
