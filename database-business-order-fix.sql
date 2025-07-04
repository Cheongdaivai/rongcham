-- Fix for business owner order management
-- This allows business owners to manage orders for their menu items

-- 1. Add business_email column to orders table
ALTER TABLE orders ADD COLUMN business_email VARCHAR(255);

-- 2. Create index for performance
CREATE INDEX idx_orders_business_email ON orders(business_email);

-- 3. Create function to automatically set business_email when order is created
CREATE OR REPLACE FUNCTION set_business_email_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the business email from the first menu item in the order
    -- This assumes all items in an order belong to the same business
    SELECT DISTINCT mi.created_by_email INTO NEW.business_email
    FROM order_item oi
    JOIN menu_item mi ON oi.menu_id = mi.menu_id
    WHERE oi.order_id = NEW.order_id
    LIMIT 1;
    
    -- If no business email found, keep it NULL
    IF NEW.business_email IS NULL THEN
        NEW.business_email = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger to set business_email after order_item is inserted
CREATE OR REPLACE FUNCTION update_order_business_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the order's business_email based on the menu item
    UPDATE orders 
    SET business_email = (
        SELECT mi.created_by_email
        FROM menu_item mi
        WHERE mi.menu_id = NEW.menu_id
    )
    WHERE order_id = NEW.order_id
    AND business_email IS NULL;  -- Only update if not already set
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger that runs after order_item insert
CREATE TRIGGER trigger_update_order_business_email
    AFTER INSERT ON order_item
    FOR EACH ROW EXECUTE FUNCTION update_order_business_email();

-- 6. Update existing RLS policies for orders
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow users to read their own orders" ON orders;
DROP POLICY IF EXISTS "Allow users to update their own orders" ON orders;

-- Create new policies that allow both customers and business owners to access orders
CREATE POLICY "Allow users to read their own orders or orders for their business" ON orders
    FOR SELECT USING (
        customer_email = auth.jwt() ->> 'email' OR
        business_email = auth.jwt() ->> 'email' OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Allow users to update their own orders or orders for their business" ON orders
    FOR UPDATE USING (
        customer_email = auth.jwt() ->> 'email' OR
        business_email = auth.jwt() ->> 'email' OR
        auth.role() = 'service_role'
    );

-- 7. Update existing orders to set business_email
-- This finds the business owner for each existing order based on the menu items
UPDATE orders 
SET business_email = (
    SELECT DISTINCT mi.created_by_email
    FROM order_item oi
    JOIN menu_item mi ON oi.menu_id = mi.menu_id
    WHERE oi.order_id = orders.order_id
    LIMIT 1
)
WHERE business_email IS NULL;

-- 8. Create a view for easy querying of orders with business context
CREATE OR REPLACE VIEW order_with_business AS
SELECT 
    o.*,
    CASE 
        WHEN o.business_email IS NOT NULL THEN o.business_email
        ELSE 'public'
    END as business_owner,
    CASE 
        WHEN o.customer_email = o.business_email THEN 'business_owner'
        ELSE 'customer'
    END as order_type
FROM orders o;

-- Grant access to the view
GRANT SELECT ON order_with_business TO authenticated;