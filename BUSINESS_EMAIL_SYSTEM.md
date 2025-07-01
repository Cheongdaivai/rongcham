# Business Email System Documentation

## Overview

The RongCham application now supports multiple businesses using a shared database through a business email identification system. Each menu item and order is associated with a business owner's email address, allowing proper data segregation and access control.

## Key Concepts

### Business Email Association
- **Menu Items**: Each menu item is created by and belongs to a specific business owner (identified by their email)
- **Orders**: Each order is assigned to a business owner's email, indicating which business should fulfill the order
- **Shared Database**: Multiple businesses can use the same database instance while maintaining data separation

### User Types
1. **Business Owners**: Authenticated users who can create/manage menu items and view their orders
2. **Customers**: Unauthenticated users who can browse menus and place orders (no sign-up required)

## Database Schema Changes

### Menu Item Table
```sql
CREATE TABLE menu_item (
    menu_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    availability BOOLEAN DEFAULT true,
    image_url TEXT,
    description TEXT,
    business_email VARCHAR(255),  -- NEW: Associates item with business owner
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Orders Table
```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_number INTEGER GENERATED ALWAYS AS IDENTITY,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    customer_note TEXT,
    business_email VARCHAR(255),  -- NEW: Associates order with business owner
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Menu Items API (`/api/menu`)

#### GET - Fetch Menu Items
**Public Access:**
```http
GET /api/menu
# Returns only available menu items from all businesses

GET /api/menu?businessEmail=owner@business.com
# Returns only available menu items from specific business
```

**Admin Access (Authenticated):**
```http
GET /api/menu?includeUnavailable=true
# Returns all menu items belonging to authenticated user's business

GET /api/menu?includeUnavailable=true&businessEmail=owner@business.com
# Returns all menu items from specified business (admin override)
```

#### POST - Create Menu Item
**Authentication Required:**
```http
POST /api/menu
Content-Type: application/json

{
  "name": "Pad Thai",
  "price": 12.99,
  "description": "Traditional Thai stir-fried noodles",
  "availability": true,
  "image_url": "https://example.com/image.jpg"
}
```
- Automatically assigns `business_email` from authenticated user's email
- Only authenticated business owners can create menu items

#### PUT - Update Menu Item
**Authentication Required:**
```http
PUT /api/menu
Content-Type: application/json

{
  "menu_id": "uuid-here",
  "name": "Updated Pad Thai",
  "price": 14.99
}
```

#### DELETE - Delete Menu Item
**Authentication Required:**
```http
DELETE /api/menu?menu_id=uuid-here
```

### Orders API (`/api/orders`)

#### GET - Fetch Orders
**Public Access:**
```http
GET /api/orders
# Returns all orders (typically used by admin dashboard)

GET /api/orders?businessEmail=owner@business.com
# Returns orders belonging to specific business

GET /api/orders?date=2024-12-25
# Returns orders from specific date

GET /api/orders?businessEmail=owner@business.com&date=2024-12-25
# Returns orders from specific business and date
```

#### POST - Create Order
**No Authentication Required:**
```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "menu_id": "uuid-here",
      "quantity": 2
    }
  ],
  "customerNote": "Extra spicy please",
  "businessEmail": "owner@business.com"  // REQUIRED: Identifies target business
}
```
- Customers must specify which business they're ordering from
- No authentication required for customers to place orders

#### PUT - Update Order Status
**Authentication Required:**
```http
PUT /api/orders
Content-Type: application/json

{
  "orderId": 123,
  "status": "preparing"
}
```

## CRUD Operations Flow

### Menu Item Management

#### Creating Menu Items
1. Business owner authenticates via `/api/auth/login`
2. Makes POST request to `/api/menu` with menu item data
3. System automatically assigns `business_email` from authenticated user
4. Menu item is created and associated with the business

#### Fetching Menu Items
1. **Public Menu Display:**
   - Frontend calls `GET /api/menu?businessEmail=owner@business.com`
   - Returns only available items for that business
   - No authentication required

2. **Admin Menu Management:**
   - Admin authenticates first
   - Frontend calls `GET /api/menu?includeUnavailable=true`
   - Returns all items (available + unavailable) for authenticated user's business

#### Updating Menu Items
1. Business owner authenticates
2. Makes PUT request with menu item updates
3. System validates ownership (menu item must belong to authenticated user)
4. Updates are applied

### Order Management

#### Placing Orders (Customer Flow)
1. Customer browses public menu: `GET /api/menu?businessEmail=owner@business.com`
2. Customer adds items to cart (client-side state)
3. Customer places order: `POST /api/orders` with `businessEmail` specified
4. Order is created and assigned to the target business
5. Business receives the order in their dashboard

#### Managing Orders (Business Owner Flow)
1. Business owner authenticates
2. Fetches their orders: `GET /api/orders?businessEmail=authenticated-user@email.com`
3. Updates order status: `PUT /api/orders` with new status
4. Customers can see status updates in real-time

## Data Isolation and Security

### Access Control
- **Menu Items**: Business owners can only manage their own menu items
- **Orders**: Business owners can only view/manage orders assigned to their email
- **Public Access**: Customers can view available menu items and place orders without authentication

### Row Level Security (RLS) Considerations
Current RLS policies may need updates to incorporate business email filtering:

```sql
-- Example updated policy for menu_item
CREATE POLICY "Business owners can manage their menu items" ON menu_item
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        business_email = auth.jwt() ->> 'email'
    );

-- Example policy for orders
CREATE POLICY "Business owners can manage their orders" ON orders
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        business_email = auth.jwt() ->> 'email'
    );
```

## Usage Examples

### Multi-Business Scenario
1. **Business A** (owner-a@restaurant.com):
   - Creates menu items → automatically tagged with `business_email: "owner-a@restaurant.com"`
   - Receives orders placed with `businessEmail: "owner-a@restaurant.com"`

2. **Business B** (owner-b@cafe.com):
   - Creates different menu items → tagged with `business_email: "owner-b@cafe.com"`
   - Receives orders placed with `businessEmail: "owner-b@cafe.com"`

3. **Customers**:
   - Browse Business A's menu: `/api/menu?businessEmail=owner-a@restaurant.com`
   - Browse Business B's menu: `/api/menu?businessEmail=owner-b@cafe.com`
   - Place order for Business A with `businessEmail: "owner-a@restaurant.com"`

### Frontend Integration
```typescript
// Fetching menu for specific business
const fetchBusinessMenu = async (businessEmail: string) => {
  const response = await fetch(`/api/menu?businessEmail=${businessEmail}`);
  return response.json();
};

// Placing order for specific business
const placeOrder = async (items: CartItem[], customerNote: string, businessEmail: string) => {
  const { createOrder } = useCart();
  return await createOrder(customerNote, businessEmail);
};

// Admin: Fetching own menu items
const fetchOwnMenuItems = async () => {
  const response = await fetch('/api/menu?includeUnavailable=true');
  return response.json();
};

// Admin: Fetching own orders
const fetchOwnOrders = async (date?: string) => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  // businessEmail is automatically determined from authentication on server-side
  const response = await fetch(`/api/orders?${params.toString()}`);
  return response.json();
};
```

## Migration Notes

### From Previous System
- `created_by_email` renamed to `business_email` in menu items
- `customer_email` renamed to `business_email` in orders (semantic change)
- Customer email collection removed - orders are now anonymous from customer perspective
- All existing API calls need to be updated to handle business email parameter

### Database Migration Required
```sql
-- Update existing tables if migrating from old schema
ALTER TABLE menu_item RENAME COLUMN created_by_email TO business_email;
ALTER TABLE orders RENAME COLUMN customer_email TO business_email;
```

This system provides complete data isolation between businesses while maintaining a shared infrastructure and allowing customers to place orders without authentication requirements.