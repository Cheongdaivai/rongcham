-- Create menu_item table
CREATE TABLE menu_item (
    menu_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    availability BOOLEAN DEFAULT true,
    image_url TEXT,
    description TEXT,
    created_by_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table (for order tracking)
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_number INTEGER GENERATED ALWAYS AS IDENTITY,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'done', 'cancelled')),
    customer_note TEXT,
    customer_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_item table (junction table for orders and menu items)
CREATE TABLE order_item (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    menu_id UUID REFERENCES menu_item(menu_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_item_order_id ON order_item(order_id);
CREATE INDEX idx_menu_item_availability ON menu_item(availability);
CREATE INDEX idx_menu_item_created_by_email ON menu_item(created_by_email);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);

-- Enable Row Level Security (RLS)
ALTER TABLE menu_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_item
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

-- RLS Policies for orders
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

-- RLS Policies for order_item
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

-- Function to update order total when order items change
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders 
    SET 
        total_amount = (
            SELECT COALESCE(SUM(subtotal), 0) 
            FROM order_item 
            WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
        ),
        updated_at = NOW()
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update order totals
CREATE TRIGGER trigger_update_order_total_insert
    AFTER INSERT ON order_item
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE TRIGGER trigger_update_order_total_update
    AFTER UPDATE ON order_item
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE TRIGGER trigger_update_order_total_delete
    AFTER DELETE ON order_item
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set user email on menu item insert
CREATE OR REPLACE FUNCTION set_user_email_on_menu_item()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the created_by_email to the current user's email
    NEW.created_by_email = auth.jwt() ->> 'email';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically set user email on order insert
CREATE OR REPLACE FUNCTION set_user_email_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the customer_email to the current user's email
    NEW.customer_email = auth.jwt() ->> 'email';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to update updated_at timestamps
CREATE TRIGGER trigger_menu_item_updated_at
    BEFORE UPDATE ON menu_item
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers to automatically set user email
CREATE TRIGGER trigger_set_user_email_menu_item
    BEFORE INSERT ON menu_item
    FOR EACH ROW EXECUTE FUNCTION set_user_email_on_menu_item();

CREATE TRIGGER trigger_set_user_email_order
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION set_user_email_on_order();

-- Insert some sample menu items
INSERT INTO menu_item (name, price, availability, description) VALUES
('Pad Thai', 12.99, true, 'Traditional Thai stir-fried rice noodles'),
('Green Curry', 14.99, true, 'Spicy green curry with coconut milk'),
('Tom Yum Soup', 8.99, true, 'Hot and sour Thai soup'),
('Mango Sticky Rice', 6.99, true, 'Traditional Thai dessert'),
('Thai Fried Rice', 11.99, true, 'Fragrant jasmine rice stir-fried with vegetables');
