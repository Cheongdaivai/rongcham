# 🍽️ Database Migration Guide - Email-Based Authentication

This document describes the migration to add email-based user authentication and Row Level Security (RLS) to the La Carte Numérique ordering system.

## 🔄 Migration Overview

The migration adds:
- **Email columns** to `menu_item` and `orders` tables for user association
- **Row Level Security (RLS)** policies to ensure data isolation between users
- **Automatic email assignment** via database triggers
- **Updated API compatibility** with authentication requirements

## 📋 Migration Steps

### Step 1: Run the Migration Script
Execute the migration script on your existing database:

```sql
-- Run this in your Supabase SQL editor or database console
\i database-migration.sql
```

### Step 2: Update Environment Variables
Ensure your Supabase environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Test Authentication
After migration, test the system with:
1. User registration/login
2. Menu item creation (should be user-specific)
3. Order placement (should be user-specific)
4. Admin dashboard access

## 🔐 Security Changes

### Before Migration
- All users could see all menu items
- All users could see all orders
- No user association with data

### After Migration
- Users only see their own menu items + public items
- Users only see their own orders
- Automatic user email association with all data
- Service role retains full access for admin functions

## 🏗️ Database Schema Changes

### menu_item Table
```sql
-- Added column
created_by_email VARCHAR(255)

-- New indexes
CREATE INDEX idx_menu_item_created_by_email ON menu_item(created_by_email);
```

### orders Table
```sql
-- Added column
customer_email VARCHAR(255)

-- New indexes
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
```

### RLS Policies
New policies ensure:
- **menu_item**: Users can only CRUD their own items
- **orders**: Users can only CRUD their own orders
- **order_item**: Access controlled via related order ownership

## 🔧 API Changes

### Authentication Required
All API endpoints now require authentication:
- `POST /api/menu` - Create menu items
- `POST /api/orders` - Create orders
- `PUT /api/orders` - Update order status

### Backward Compatibility
- **GET /api/menu** - Still works, but filtered by user
- **GET /api/orders** - Still works, but filtered by user
- Existing public menu items remain accessible to all users

## 🎯 Development Notes

### TypeScript Updates
Updated interfaces include new email fields:
```typescript
interface MenuItem {
  // ...existing fields...
  created_by_email?: string;
}

interface Order {
  // ...existing fields...
  customer_email?: string;
}
```

### Database Functions
All database functions now:
- Check authentication before operations
- Use RLS policies for automatic filtering
- Handle email assignment via triggers

### Error Handling
New error cases:
- `401 Unauthorized` for unauthenticated requests
- `403 Forbidden` for insufficient permissions
- RLS policies automatically filter unauthorized data

## 🚀 Testing Checklist

After migration, verify:

- [ ] Users can register and login
- [ ] Users only see their own menu items in admin
- [ ] Users only see their own orders
- [ ] Public menu items are visible to all users
- [ ] Order creation associates with logged-in user
- [ ] Menu item creation associates with logged-in user
- [ ] Admin dashboard requires authentication
- [ ] Real-time updates work for user-specific data

## 🔄 Rollback Plan

If issues arise, you can temporarily disable RLS:

```sql
-- EMERGENCY ROLLBACK - Use with caution
ALTER TABLE menu_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_item DISABLE ROW LEVEL SECURITY;
```

**Note**: This makes all data public again. Re-enable RLS after fixing issues.

## 📞 Support

For migration issues:
1. Check Supabase logs for RLS policy errors
2. Verify user authentication in browser network tab
3. Ensure service role key has proper permissions
4. Check database triggers are working correctly

---

*Bon appétit! Your multi-tenant restaurant system is now ready to serve.*
