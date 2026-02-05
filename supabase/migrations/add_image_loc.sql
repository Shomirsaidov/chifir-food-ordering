-- Add image_loc column to menu_items table
-- This column can store either:
-- 1. External URL (starts with http:// or https://)
-- 2. Internal filename (e.g., "sushi-roll.jpg") which will be loaded from src/assets/images/

ALTER TABLE menu_items 
ADD COLUMN image_loc TEXT;

-- Optional: Add some example data
-- External image example:
-- UPDATE menu_items SET image_loc = 'https://example.com/image.jpg' WHERE name = 'Фила лайт';

-- Internal image example:
-- UPDATE menu_items SET image_loc = 'fila-light.jpg' WHERE name = 'Фила лайт';

-- Add comment for documentation
COMMENT ON COLUMN menu_items.image_loc IS 'Image location: either external URL (http/https) or internal filename from assets/images/';
