-- DEBUG: Test RLS policies and user authentication
-- Run these queries to debug the data isolation issue

-- 1. Check if RLS is enabled on tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('menu_item', 'orders', 'order_item');

-- 2. List all current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('menu_item', 'orders', 'order_item')
ORDER BY tablename, policyname;

-- 3. Test current user context
SELECT 
    auth.role() as current_role,
    auth.jwt() ->> 'email' as current_user_email,
    auth.jwt() ->> 'sub' as current_user_id;

-- 4. Test menu_item access
SELECT 
    menu_id,
    name,
    created_by_email,
    availability,
    CASE 
        WHEN created_by_email IS NULL THEN 'PUBLIC'
        WHEN created_by_email = auth.jwt() ->> 'email' THEN 'OWNED'
        ELSE 'OTHER_USER'
    END as access_type
FROM menu_item
ORDER BY access_type, name;

-- 5. Test orders access
SELECT 
    order_id,
    order_number,
    customer_email,
    status,
    CASE 
        WHEN customer_email = auth.jwt() ->> 'email' THEN 'OWNED'
        ELSE 'OTHER_USER'
    END as access_type
FROM orders
ORDER BY access_type, order_id;

-- 6. Check if you're using service role (this would bypass RLS)
SELECT 
    CASE 
        WHEN auth.role() = 'service_role' THEN 'WARNING: Using service role - RLS bypassed'
        WHEN auth.role() = 'authenticated' THEN 'OK: Using authenticated role'
        WHEN auth.role() = 'anon' THEN 'INFO: Using anonymous role'
        ELSE 'UNKNOWN: ' || auth.role()
    END as role_status;

-- 7. Test specific policy conditions
SELECT 
    menu_id,
    name,
    created_by_email,
    availability,
    -- Test the exact policy condition
    (availability = true AND (
        created_by_email IS NULL OR 
        created_by_email = auth.jwt() ->> 'email'
    ) OR auth.role() = 'service_role') as should_be_visible
FROM menu_item
ORDER BY should_be_visible DESC, name;
