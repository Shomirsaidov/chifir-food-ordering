-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  table_location TEXT NOT NULL,
  comment TEXT,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'ready')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  menu_item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert themselves" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update themselves" ON users FOR UPDATE USING (true);

-- RLS Policies for admins table (read-only for checking admin status)
CREATE POLICY "Anyone can view admins" ON admins FOR SELECT USING (true);

-- RLS Policies for categories table
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Only service role can modify categories" ON categories FOR ALL USING (false);

-- RLS Policies for menu_items table
CREATE POLICY "Anyone can view active menu items" ON menu_items FOR SELECT USING (is_active = true);
CREATE POLICY "Only service role can modify menu items" ON menu_items FOR ALL USING (false);

-- RLS Policies for orders table
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Only service role can update orders" ON orders FOR UPDATE USING (false);

-- RLS Policies for order_items table
CREATE POLICY "Users can view order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Users can create order items" ON order_items FOR INSERT WITH CHECK (true);

-- Enable Realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Create indexes for better performance
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_is_active ON menu_items(is_active);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Seed initial categories
INSERT INTO categories (name, sort_order) VALUES
  ('Суши и роллы', 1),
  ('Маки', 2),
  ('Запечённые роллы', 3),
  ('Супы', 4),
  ('Салаты', 5),
  ('Пицца', 6)
ON CONFLICT DO NOTHING;

-- Seed initial menu items (prices in kopeks/cents)
-- Get category IDs
DO $$
DECLARE
  cat_sushi UUID;
  cat_maki UUID;
  cat_baked UUID;
  cat_soups UUID;
  cat_salads UUID;
  cat_pizza UUID;
BEGIN
  SELECT id INTO cat_sushi FROM categories WHERE name = 'Суши и роллы';
  SELECT id INTO cat_maki FROM categories WHERE name = 'Маки';
  SELECT id INTO cat_baked FROM categories WHERE name = 'Запечённые роллы';
  SELECT id INTO cat_soups FROM categories WHERE name = 'Супы';
  SELECT id INTO cat_salads FROM categories WHERE name = 'Салаты';
  SELECT id INTO cat_pizza FROM categories WHERE name = 'Пицца';

  -- Суши и роллы
  INSERT INTO menu_items (category_id, name, price, sort_order) VALUES
    (cat_sushi, 'Фила лайт', 61500, 1),
    (cat_sushi, 'Фила классика', 74900, 2),
    (cat_sushi, 'Калифорния с краб', 49300, 3),
    (cat_sushi, 'Калифорния с лососем', 54500, 4),
    (cat_sushi, 'Сливочный с курицей', 35900, 5),
    (cat_sushi, 'Сливочный с крабом', 39500, 6)
  ON CONFLICT DO NOTHING;

  -- Маки
  INSERT INTO menu_items (category_id, name, price, sort_order) VALUES
    (cat_maki, 'Каппа маки', 26500, 1),
    (cat_maki, 'Сяке Маки', 31300, 2),
    (cat_maki, 'Классика с крабом', 29900, 3),
    (cat_maki, 'Классика креветка', 30900, 4)
  ON CONFLICT DO NOTHING;

  -- Запечённые роллы
  INSERT INTO menu_items (category_id, name, price, sort_order) VALUES
    (cat_baked, 'Запечённый с курицей', 42900, 1),
    (cat_baked, 'Запечённый с крабом', 43900, 2),
    (cat_baked, 'Запечённый лосось', 46900, 3)
  ON CONFLICT DO NOTHING;

  -- Супы
  INSERT INTO menu_items (category_id, name, price, sort_order) VALUES
    (cat_soups, 'Том Ям', 75600, 1)
  ON CONFLICT DO NOTHING;

  -- Салаты
  INSERT INTO menu_items (category_id, name, price, sort_order) VALUES
    (cat_salads, 'Салат Цезарь', 45600, 1),
    (cat_salads, 'Салат Цезарь с креветкой', 54300, 2)
  ON CONFLICT DO NOTHING;

  -- Пицца
  INSERT INTO menu_items (category_id, name, description, price, sort_order) VALUES
    (cat_pizza, 'Пицца Мясная', 'Колбаса полукапченная, кур копчёная, сосиски молочные, колбаса салями, пеперони', 75600, 1),
    (cat_pizza, 'Пицца Цезарь', 'Курица копчёная, салат айсберг, помидоры черри, пармезан', 68500, 2),
    (cat_pizza, 'Пицца Жульен', 'грибы, шиитаке, лисички', 68500, 3),
    (cat_pizza, 'Пицца Ветчина и грибы', 'грибы, ветчина', 56900, 4),
    (cat_pizza, 'Пицца Немецкая', 'сосиски, картошка фри, ветчина', 63000, 5)
  ON CONFLICT DO NOTHING;
END $$;

-- Insert example admin (replace with actual admin username)
-- INSERT INTO admins (telegram_username) VALUES ('your_telegram_username');
