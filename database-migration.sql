-- Migration script to add email column and update RLS policies
-- Run this script to update existing tables

-- 1. Add email column to menu_item table
ALTER TABLE menu_item 
ADD COLUMN created_by_email VARCHAR(255);

-- 2. Add email column to orders table 
ALTER TABLE orders 
ADD COLUMN customer_email VARCHAR(255);

-- 3. Create index for better performance on email lookups
CREATE INDEX idx_menu_item_created_by_email ON menu_item(created_by_email);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);

-- 4. Drop existing RLS policies
DROP POLICY IF EXISTS "Allow public read access to available menu items" ON menu_item;
DROP POLICY IF EXISTS "Allow authenticated users full access to menu items" ON menu_item;
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert access to orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to update orders" ON orders;
DROP POLICY IF EXISTS "Allow public read access to order items" ON order_item;
DROP POLICY IF EXISTS "Allow public insert access to order items" ON order_item;

-- 5. Create new RLS policies for menu_item with email-based access control
-- Allow users to read only menu items they created or available items without creator
CREATE POLICY "Allow users to read their own menu items or public items" ON menu_item
    FOR SELECT USING (
        availability = true AND (
            created_by_email IS NULL OR 
            created_by_email = auth.jwt() ->> 'email'
        ) OR
        auth.role() = 'service_role'
    );

-- Allow authenticated users to insert menu items (will be set with their email)
CREATE POLICY "Allow authenticated users to insert menu items" ON menu_item
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update only their own menu items
CREATE POLICY "Allow users to update their own menu items" ON menu_item
    FOR UPDATE USING (
        created_by_email = auth.jwt() ->> 'email' OR
        auth.role() = 'service_role'
    );

-- Allow users to delete only their own menu items
CREATE POLICY "Allow users to delete their own menu items" ON menu_item
    FOR DELETE USING (
        created_by_email = auth.jwt() ->> 'email' OR
        auth.role() = 'service_role'
    );

-- 6. Create new RLS policies for orders with email-based access control
-- Allow users to read only their own orders
CREATE POLICY "Allow users to read their own orders" ON orders
    FOR SELECT USING (
        customer_email = auth.jwt() ->> 'email' OR
        auth.role() = 'service_role'
    );

-- Allow authenticated users to insert orders (will be set with their email)
CREATE POLICY "Allow authenticated users to insert orders" ON orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update only their own orders or service role
CREATE POLICY "Allow users to update their own orders" ON orders
    FOR UPDATE USING (
        customer_email = auth.jwt() ->> 'email' OR
        auth.role() = 'service_role'
    );

-- 7. Create new RLS policies for order_item with email-based access control
-- Allow users to read order items for their own orders
CREATE POLICY "Allow users to read their own order items" ON order_item
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.order_id = order_item.order_id 
            AND (orders.customer_email = auth.jwt() ->> 'email' OR auth.role() = 'service_role')
        )
    );

-- Allow authenticated users to insert order items for their own orders
CREATE POLICY "Allow users to insert order items for their own orders" ON order_item
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.order_id = order_item.order_id 
            AND (orders.customer_email = auth.jwt() ->> 'email' OR auth.role() = 'service_role')
        )
    );

-- 8. Update existing sample data to have no creator (public items)
-- This makes existing items available to all users
UPDATE menu_item SET created_by_email = NULL WHERE created_by_email IS NULL;

-- 9. Create function to automatically set user email on insert
CREATE OR REPLACE FUNCTION set_user_email_on_menu_item()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the created_by_email to the current user's email
    NEW.created_by_email = auth.jwt() ->> 'email';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_user_email_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the customer_email to the current user's email
    NEW.customer_email = auth.jwt() ->> 'email';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create triggers to automatically set email on insert
CREATE TRIGGER trigger_set_user_email_menu_item
    BEFORE INSERT ON menu_item
    FOR EACH ROW EXECUTE FUNCTION set_user_email_on_menu_item();

CREATE TRIGGER trigger_set_user_email_order
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION set_user_email_on_order();

-- 11. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
