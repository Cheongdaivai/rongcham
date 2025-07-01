-- HOTFIX: Fix RLS policies for proper user data isolation
-- Run this script to fix the data isolation issue

-- 1. Drop the problematic menu_item read policy
DROP POLICY IF EXISTS "Allow users to read their own menu items or public items" ON menu_item;

-- 2. Create the corrected menu_item read policy
CREATE POLICY "Allow users to read their own menu items or public items" ON menu_item
    FOR SELECT USING (
        availability = true AND (
            created_by_email IS NULL OR 
            created_by_email = auth.jwt() ->> 'email'
        ) OR
        auth.role() = 'service_role'
    );

-- 3. Verify orders policy is correct (should already be right)
-- Just in case, let's recreate it to be sure
DROP POLICY IF EXISTS "Allow users to read their own orders" ON orders;
CREATE POLICY "Allow users to read their own orders" ON orders
    FOR SELECT USING (
        customer_email = auth.jwt() ->> 'email' OR
        auth.role() = 'service_role'
    );

-- 4. Also fix the order_item policy to be more explicit
DROP POLICY IF EXISTS "Allow users to read their own order items" ON order_item;
CREATE POLICY "Allow users to read their own order items" ON order_item
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.order_id = order_item.order_id 
            AND (orders.customer_email = auth.jwt() ->> 'email' OR auth.role() = 'service_role')
        )
    );

-- 5. Test the policies by checking what a user can see
-- You can run this as a test after the policies are applied:
-- SELECT auth.jwt() ->> 'email' AS current_user_email;
-- SELECT * FROM menu_item; -- Should only show user's items + public items
-- SELECT * FROM orders; -- Should only show user's orders
