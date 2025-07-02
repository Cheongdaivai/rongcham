import { MenuItem } from '@/types';

export const sampleMenuItems: MenuItem[] = [
  {
    menu_id: '1',
    name: 'AMOK',
    price: 8.00,
    availability: true,
    description: 'Traditional Cambodian steamed fish curry with coconut milk, served in banana leaves.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 5,
    chef_signature: 'Master Chef Sophea'
  },
  {
    menu_id: '2',
    name: 'Bay Sach Jruk',
    price: 2.50,
    availability: true,
    description: 'Popular Cambodian pork and rice dish, slow-cooked with aromatic spices.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 4,
    chef_signature: 'Chef Pisach Special'
  },
  {
    menu_id: '3',
    name: 'Burger',
    price: 11.00,
    availability: true,
    description: 'Gourmet beef burger with fresh vegetables, premium cheese and special sauce.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rating: 5,
    chef_signature: 'International Fusion'
  }
];
