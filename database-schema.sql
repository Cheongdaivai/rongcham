-- Create menu_item table
CREATE TABLE menu_item (
    menu_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    availability BOOLEAN DEFAULT true,
    image_url TEXT,
    description TEXT,
    business_email VARCHAR(255),
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
    business_email VARCHAR(255),
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

-- Enable Row Level Security (RLS)
ALTER TABLE menu_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_item
-- Allow everyone to read available menu items
CREATE POLICY "Allow public read access to available menu items" ON menu_item
    FOR SELECT USING (availability = true);

-- Allow authenticated users (admins) to do everything
CREATE POLICY "Allow authenticated users full access to menu items" ON menu_item
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for orders
-- Allow everyone to read orders (for public order tracking)
CREATE POLICY "Allow public read access to orders" ON orders
    FOR SELECT USING (true);

-- Allow everyone to insert orders (customers placing orders)
CREATE POLICY "Allow public insert access to orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admins) to update orders
CREATE POLICY "Allow authenticated users to update orders" ON orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for order_item
-- Allow everyone to read order items
CREATE POLICY "Allow public read access to order items" ON order_item
    FOR SELECT USING (true);

-- Allow everyone to insert order items (when placing orders)
CREATE POLICY "Allow public insert access to order items" ON order_item
    FOR INSERT WITH CHECK (true);

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

-- Triggers to update updated_at timestamps
CREATE TRIGGER trigger_menu_item_updated_at
    BEFORE UPDATE ON menu_item
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample menu items
INSERT INTO menu_item (name, price, availability, description) VALUES
('Pad Thai', 12.99, true, 'Traditional Thai stir-fried rice noodles'),
('Green Curry', 14.99, true, 'Spicy green curry with coconut milk'),
('Tom Yum Soup', 8.99, true, 'Hot and sour Thai soup'),
('Mango Sticky Rice', 6.99, true, 'Traditional Thai dessert'),
('Thai Fried Rice', 11.99, true, 'Fragrant jasmine rice stir-fried with vegetables');
