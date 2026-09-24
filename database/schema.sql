-- =====================================================================
-- Siva Sarvesh Crackers - database schema
-- Compatible with MySQL 8.0+ and MariaDB 10.6+
-- Run:  npm run db:setup    (or)    mysql -u root -p < database/schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS siva_sarvesh_crackers
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE siva_sarvesh_crackers;

-- ---------------------------------------------------------------------
-- Admin users (passwords are bcrypt hashes - create with `npm run seed:admin`)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  tamil_name VARCHAR(160) NULL,
  slug VARCHAR(140) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_active_order (is_active, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_code VARCHAR(30) NOT NULL,
  product_name VARCHAR(191) NOT NULL,
  tamil_name VARCHAR(191) NULL,
  category_id INT UNSIGNED NOT NULL,
  description TEXT NULL,
  unit VARCHAR(30) NOT NULL DEFAULT '1 BOX',
  image_url VARCHAR(500) NULL,
  original_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_code (product_code),
  KEY idx_products_category (category_id),
  KEY idx_products_active (is_active),
  KEY idx_products_name (product_name),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES categories (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_products_prices CHECK (original_price >= 0 AND selling_price >= 0),
  CONSTRAINT chk_products_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Promotion codes (discount is always calculated on the server)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promotion_codes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  description VARCHAR(255) NULL,
  discount_type ENUM('PERCENT','FLAT') NOT NULL DEFAULT 'PERCENT',
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_discount_amount DECIMAL(10,2) NULL,
  usage_limit INT UNSIGNED NULL,
  used_count INT UNSIGNED NOT NULL DEFAULT 0,
  valid_from DATETIME NULL,
  valid_until DATETIME NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_promotion_codes_code (code),
  CONSTRAINT chk_promotion_value CHECK (discount_value >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Email OTP verification (OTP and verification token are stored hashed)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_verifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(191) NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempt_count INT UNSIGNED NOT NULL DEFAULT 0,
  verified_at DATETIME NULL,
  verification_token_hash CHAR(64) NULL,
  token_expires_at DATETIME NULL,
  consumed_at DATETIME NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_email_verifications_email_created (email, created_at),
  KEY idx_email_verifications_token (verification_token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Daily order number sequence (SSC-YYYYMMDD-0001)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_sequences (
  seq_date DATE NOT NULL,
  `last_value` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (seq_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(30) NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_mobile VARCHAR(15) NOT NULL,
  customer_email VARCHAR(191) NOT NULL,
  state VARCHAR(60) NOT NULL,
  city VARCHAR(80) NOT NULL,
  address TEXT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  promotion_code_id INT UNSIGNED NULL,
  promotion_code VARCHAR(50) NULL,
  promotion_discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  packing_charge_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  packing_charge DECIMAL(12,2) NOT NULL DEFAULT 0,
  round_off DECIMAL(6,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  status ENUM('PENDING','PICKED_UP','DELIVERED','REJECTED') NOT NULL DEFAULT 'PENDING',
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_number (order_number),
  KEY idx_orders_status (status),
  KEY idx_orders_customer_email (customer_email),
  KEY idx_orders_customer_mobile (customer_mobile),
  KEY idx_orders_city (city),
  KEY idx_orders_created_at (created_at),
  KEY idx_orders_total_amount (total_amount),
  CONSTRAINT fk_orders_promotion FOREIGN KEY (promotion_code_id)
    REFERENCES promotion_codes (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Order items (snapshot of product details at the time of ordering)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NULL,
  product_code VARCHAR(30) NOT NULL,
  product_name VARCHAR(191) NOT NULL,
  tamil_name VARCHAR(191) NULL,
  unit VARCHAR(30) NULL,
  original_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
    REFERENCES orders (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id)
    REFERENCES products (id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT chk_order_items_quantity CHECK (quantity >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Order status history
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_status_history (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  old_status ENUM('PENDING','PICKED_UP','DELIVERED','REJECTED') NULL,
  new_status ENUM('PENDING','PICKED_UP','DELIVERED','REJECTED') NOT NULL,
  changed_by INT UNSIGNED NULL,
  changed_by_label VARCHAR(120) NOT NULL DEFAULT 'SYSTEM',
  remarks VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_status_history_order (order_id, created_at),
  CONSTRAINT fk_status_history_order FOREIGN KEY (order_id)
    REFERENCES orders (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_status_history_admin FOREIGN KEY (changed_by)
    REFERENCES admins (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- Seed data (generated from database/seedData.js - do not edit by hand)
-- Re-running is safe: existing rows are updated, not duplicated.
-- =====================================================================

INSERT INTO categories (name, tamil_name, slug, display_order, is_active) VALUES
  ('Single Sound Crackers', 'ஒற்றை வெடிகள்', 'single-sound-crackers', 1, 1),
  ('Ground Chakkars', 'தரைச்சக்கரம்', 'ground-chakkars', 2, 1),
  ('Flower Pots', 'பூச்சட்டி', 'flower-pots', 3, 1),
  ('Pencils', 'பென்சில்', 'pencils', 4, 1),
  ('Twinkling Stars', 'சாட்டை', 'twinkling-stars', 5, 1),
  ('Bombs', 'பாம்ப்ஸ்', 'bombs', 6, 1),
  ('Electric Crackers', 'எலக்ட்ரிக் கிராக்கர்ஸ்', 'electric-crackers', 7, 1),
  ('Chain Crackers', 'செயின் கிராக்கர்ஸ்', 'chain-crackers', 8, 1),
  ('Bijili Crackers', 'பிஜிலி கிராக்கர்ஸ்', 'bijili-crackers', 9, 1),
  ('Fancy Crackers', 'பேன்சி கிராக்கர்ஸ்', 'fancy-crackers', 10, 1),
  ('Multi Colour Shots', 'மல்டி கலர் சாட்ஸ்', 'multi-colour-shots', 11, 1),
  ('Fancy Fountains', 'பேன்சி வெடிகள்', 'fancy-fountains', 12, 1),
  ('Kids Special', 'குழந்தை ஸ்பெஷல்', 'kids-special', 13, 1),
  ('Rockets', 'ராக்கெட்', 'rockets', 14, 1),
  ('Paper Shots', 'பேப்பர் சாட்ஸ்', 'paper-shots', 15, 1),
  ('Laddu Flower Pots', 'லட்டு பிளவர் பாட்ஸ்', 'laddu-flower-pots', 16, 1),
  ('Sparklers', 'கம்பி மத்தாப்புகள்', 'sparklers', 17, 1),
  ('Colour Matches', 'கலர் மேட்சஸ்', 'colour-matches', 18, 1),
  ('Music Crayon', 'மியூசிக் க்ரையன்', 'music-crayon', 19, 1),
  ('Gift Boxes (Net Rate)', 'கிப்ட் பாக்ஸ்', 'gift-boxes', 20, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), tamil_name = VALUES(tamil_name), display_order = VALUES(display_order);

INSERT INTO products (product_code, product_name, tamil_name, category_id, unit, original_price, discount_percentage, selling_price, display_order, is_active) VALUES
  ('SSC001', '2¾" Kuruvi', '2¾" குருவி', (SELECT id FROM categories WHERE slug = 'single-sound-crackers'), '1 PKT', 35.00, 0.00, 35.00, 1, 1),
  ('SSC002', '3½" Lakshmi', '3½" லட்சுமி', (SELECT id FROM categories WHERE slug = 'single-sound-crackers'), '1 PKT', 75.00, 0.00, 75.00, 2, 1),
  ('SSC003', '4" Lakshmi', '4" லட்சுமி', (SELECT id FROM categories WHERE slug = 'single-sound-crackers'), '1 PKT', 125.00, 0.00, 125.00, 3, 1),
  ('SSC004', '4" Deluxe Lakshmi', '4" டீலக்ஸ் லட்சுமி', (SELECT id FROM categories WHERE slug = 'single-sound-crackers'), '1 PKT', 150.00, 0.00, 150.00, 4, 1),
  ('SSC005', 'Gold Lakshmi', 'கோல்டு லட்சுமி', (SELECT id FROM categories WHERE slug = 'single-sound-crackers'), '1 PKT', 160.00, 0.00, 160.00, 5, 1),
  ('SSC006', '5" Bahubali', '5" பாகுபலி', (SELECT id FROM categories WHERE slug = 'single-sound-crackers'), '1 PKT', 200.00, 0.00, 200.00, 6, 1),
  ('SSC007', '5" Jallikattu', '5" ஜல்லிக்கட்டு', (SELECT id FROM categories WHERE slug = 'single-sound-crackers'), '1 PKT', 200.00, 0.00, 200.00, 7, 1),
  ('SSC008', '5" Colour Vedi', '5" கலர் வெடி', (SELECT id FROM categories WHERE slug = 'single-sound-crackers'), '1 PKT', 300.00, 0.00, 300.00, 8, 1),
  ('SSC009', '6" Kumki', '6" கும்கி', (SELECT id FROM categories WHERE slug = 'single-sound-crackers'), '1 PKT', 200.00, 0.00, 200.00, 9, 1),
  ('SSC010', '2 Sound Crackers', '2 சவுண்ட் கிராக்கர்ஸ்', (SELECT id FROM categories WHERE slug = 'single-sound-crackers'), '1 PKT', 250.00, 0.00, 250.00, 10, 1),
  ('SSC011', '3 Sound Crackers', '3 சவுண்ட் கிராக்கர்ஸ்', (SELECT id FROM categories WHERE slug = 'single-sound-crackers'), '1 PKT', 250.00, 0.00, 250.00, 11, 1),
  ('SSC012', 'Ground Chakkar Big (10 Pcs)', 'சக்கரம் சிறியது 10 பீஸ்', (SELECT id FROM categories WHERE slug = 'ground-chakkars'), '1 BOX', 200.00, 0.00, 200.00, 12, 1),
  ('SSC013', 'Ground Chakkar Small (25 Pcs)', 'சக்கரம் சிறியது 25 பீஸ்', (SELECT id FROM categories WHERE slug = 'ground-chakkars'), '1 BOX', 500.00, 0.00, 500.00, 13, 1),
  ('SSC014', 'Ground Chakkar Asoka (10 Pcs)', 'சக்கரம் அசோகா 10 பீஸ்', (SELECT id FROM categories WHERE slug = 'ground-chakkars'), '1 BOX', 400.00, 0.00, 400.00, 14, 1),
  ('SSC015', 'Ground Chakkar Special (10 Pcs)', 'சக்கரம் ஸ்பெஷல் 10 பீஸ்', (SELECT id FROM categories WHERE slug = 'ground-chakkars'), '1 BOX', 500.00, 0.00, 500.00, 15, 1),
  ('SSC016', 'Ground Chakkar Deluxe (10 Pcs)', 'சக்கரம் டீலக்ஸ் 10 பீஸ்', (SELECT id FROM categories WHERE slug = 'ground-chakkars'), '1 BOX', 700.00, 0.00, 700.00, 16, 1),
  ('SSC017', 'Winner Special (10 Pcs)', 'வின்னர் ஸ்பெஷல் 10 பீஸ்', (SELECT id FROM categories WHERE slug = 'ground-chakkars'), '1 BOX', 1000.00, 0.00, 1000.00, 17, 1),
  ('SSC018', 'Winner Deluxe (10 Pcs)', 'வின்னர் டீலக்ஸ் 10 பீஸ்', (SELECT id FROM categories WHERE slug = 'ground-chakkars'), '1 BOX', 1250.00, 0.00, 1250.00, 18, 1),
  ('SSC019', 'Whistling Wheel (5 Pcs)', 'விசிலிங் வீல் 5 பீஸ்', (SELECT id FROM categories WHERE slug = 'ground-chakkars'), '1 BOX', 800.00, 0.00, 800.00, 19, 1),
  ('SSC020', '4×4 Lotus Wheel (5 Pcs)', '4X4 லோட்டஸ் வீல்', (SELECT id FROM categories WHERE slug = 'ground-chakkars'), '1 BOX', 1000.00, 0.00, 1000.00, 20, 1),
  ('SSC021', 'Flower Pot Small (10 Pcs)', 'பூச்சட்டி சிறியது', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 200.00, 0.00, 200.00, 21, 1),
  ('SSC022', 'Flower Pot Big (10 Pcs)', 'பூச்சட்டி பெரியது', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 300.00, 0.00, 300.00, 22, 1),
  ('SSC023', 'Flower Pot Special (10 Pcs)', 'பூச்சட்டி ஸ்பெஷல்', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 450.00, 0.00, 450.00, 23, 1),
  ('SSC024', 'Flower Pot Asoka (10 Pcs)', 'பூச்சட்டி அசோகா', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 600.00, 0.00, 600.00, 24, 1),
  ('SSC025', 'Flower Pot Jersey (5 Pcs)', 'பூச்சட்டி ஜெர்ஸி', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 900.00, 0.00, 900.00, 25, 1),
  ('SSC026', 'Flower Pot Giant (10 Pcs)', 'பூச்சட்டி ஜெயின்ட்', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 100.00, 0.00, 100.00, 26, 1),
  ('SSC027', 'Colour Koti (10 Pcs)', 'கலர் கோட்டி', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 100.00, 0.00, 100.00, 27, 1),
  ('SSC028', 'Colour Koti Special (10 Pcs)', 'கலர் கோட்டி ஸ்பெஷல்', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 1250.00, 0.00, 1250.00, 28, 1),
  ('SSC029', 'Multi Colour Giant', 'மல்டி கலர் ஜெயின்ட்', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 1750.00, 0.00, 1750.00, 29, 1),
  ('SSC030', 'Flower Pot Super Deluxe (2 Pcs)', 'பூச்சட்டி சூப்பர் டீலக்ஸ்', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 750.00, 0.00, 750.00, 30, 1),
  ('SSC031', 'Silver Koti', 'சில்வர் கோட்டி', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 1750.00, 0.00, 1750.00, 31, 1),
  ('SSC032', 'Flower Pot Deluxe (5 Pcs)', 'பூச்சட்டி டீலக்ஸ்', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 1250.00, 0.00, 1250.00, 32, 1),
  ('SSC033', 'Colour Koti Deluxe (10 Pcs)', 'கலர்கோட்டி டீலக்ஸ்', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 1750.00, 0.00, 1750.00, 33, 1),
  ('SSC034', 'Colour Koti Super Deluxe (10 Pcs)', 'கலர்கோட்டி சூப்பர் டீலக்ஸ்', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 2000.00, 0.00, 2000.00, 34, 1),
  ('SSC035', 'Tri Colour (5 Pcs)', 'த்ரி கலர்', (SELECT id FROM categories WHERE slug = 'flower-pots'), '1 BOX', 1750.00, 0.00, 1750.00, 35, 1),
  ('SSC036', '7 cm Pencil', '7 செ.மீ பென்சில்', (SELECT id FROM categories WHERE slug = 'pencils'), '1 BOX', 125.00, 0.00, 125.00, 36, 1),
  ('SSC037', '10 cm Pencil', '10 செ.மீ பென்சில்', (SELECT id FROM categories WHERE slug = 'pencils'), '1 BOX', 175.00, 0.00, 175.00, 37, 1),
  ('SSC038', '12 cm Pencil', '12 செ.மீ பென்சில்', (SELECT id FROM categories WHERE slug = 'pencils'), '1 BOX', 225.00, 0.00, 225.00, 38, 1),
  ('SSC039', '15 cm Pencil', '15 செ.மீ பென்சில்', (SELECT id FROM categories WHERE slug = 'pencils'), '1 BOX', 300.00, 0.00, 300.00, 39, 1),
  ('SSC040', '18 cm Pencil', '18 செ.மீ பென்சில்', (SELECT id FROM categories WHERE slug = 'pencils'), '1 BOX', 400.00, 0.00, 400.00, 40, 1),
  ('SSC041', 'SS Pyro Colour Pencil (2 Pcs)', 'பைரோ கலர் பென்சில்', (SELECT id FROM categories WHERE slug = 'pencils'), '1 BOX', 1250.00, 0.00, 1250.00, 41, 1),
  ('SSC042', 'Selfie Stick (5 Pcs)', 'செல்பி ஸ்டிக்', (SELECT id FROM categories WHERE slug = 'pencils'), '1 BOX', 1000.00, 0.00, 1000.00, 42, 1),
  ('SSC043', 'Navarang Pencil (5 Pcs)', 'நவ்ரங் பென்சில்', (SELECT id FROM categories WHERE slug = 'pencils'), '1 BOX', 800.00, 0.00, 800.00, 43, 1),
  ('SSC044', 'Sivakasi Pencil (2 Pcs)', 'சிவகாசி பென்சில்', (SELECT id FROM categories WHERE slug = 'pencils'), '1 BOX', 1000.00, 0.00, 1000.00, 44, 1),
  ('SSC045', '5G Gun', '5ஜி கன்', (SELECT id FROM categories WHERE slug = 'pencils'), '1 BOX', 1250.00, 0.00, 1250.00, 45, 1),
  ('SSC046', '1½" Twinkling Star', '1 1/2'' சாட்டை', (SELECT id FROM categories WHERE slug = 'twinkling-stars'), '1 BOX', 150.00, 0.00, 150.00, 46, 1),
  ('SSC047', '4" Twinkling Star', '4" சாட்டை', (SELECT id FROM categories WHERE slug = 'twinkling-stars'), '1 BOX', 300.00, 0.00, 300.00, 47, 1),
  ('SSC048', 'Bullet Bomb', 'புல்லட் பாம்', (SELECT id FROM categories WHERE slug = 'bombs'), '1 BOX', 150.00, 0.00, 150.00, 48, 1),
  ('SSC049', 'Atom Bomb', 'ஆட்டம் பாம்', (SELECT id FROM categories WHERE slug = 'bombs'), '1 BOX', 275.00, 0.00, 275.00, 49, 1),
  ('SSC050', 'Hydro Bomb', 'ஹைட்ரோ பாம்', (SELECT id FROM categories WHERE slug = 'bombs'), '1 BOX', 350.00, 0.00, 350.00, 50, 1),
  ('SSC051', 'King of King Bomb', 'கிங் ஆப் கிங் பாம்', (SELECT id FROM categories WHERE slug = 'bombs'), '1 BOX', 600.00, 0.00, 600.00, 51, 1),
  ('SSC052', 'Classic Bomb', 'கிளாசிக் பாம்', (SELECT id FROM categories WHERE slug = 'bombs'), '1 BOX', 750.00, 0.00, 750.00, 52, 1),
  ('SSC053', 'Agni Bomb', 'அக்னி பாம்', (SELECT id FROM categories WHERE slug = 'bombs'), '1 BOX', 1250.00, 0.00, 1250.00, 53, 1),
  ('SSC054', 'Digital Bomb', 'டிஜிட்டல் பாம்ப்', (SELECT id FROM categories WHERE slug = 'bombs'), '1 BOX', 1500.00, 0.00, 1500.00, 54, 1),
  ('SSC055', '28 Chorsa', '28 சோர்சா', (SELECT id FROM categories WHERE slug = 'electric-crackers'), '1 BOX', 75.00, 0.00, 75.00, 55, 1),
  ('SSC056', '28 Giant', '28 ஜெயிண்ட்', (SELECT id FROM categories WHERE slug = 'electric-crackers'), '1 BOX', 100.00, 0.00, 100.00, 56, 1),
  ('SSC057', '56 Giant', '56 ஜெயிண்ட்', (SELECT id FROM categories WHERE slug = 'electric-crackers'), '1 BOX', 200.00, 0.00, 200.00, 57, 1),
  ('SSC058', '24 Bada', '24 படா', (SELECT id FROM categories WHERE slug = 'electric-crackers'), '1 BOX', 250.00, 0.00, 250.00, 58, 1),
  ('SSC059', '50 Bada', '50 படா', (SELECT id FROM categories WHERE slug = 'electric-crackers'), '1 BOX', 750.00, 0.00, 750.00, 59, 1),
  ('SSC060', '100 Bada', '100 படா', (SELECT id FROM categories WHERE slug = 'electric-crackers'), '1 BOX', 1250.00, 0.00, 1250.00, 60, 1),
  ('SSC061', '100 Chain', '100 செயின்', (SELECT id FROM categories WHERE slug = 'chain-crackers'), '1 BOX', 175.00, 0.00, 175.00, 61, 1),
  ('SSC062', '200 Chain', '200 செயின்', (SELECT id FROM categories WHERE slug = 'chain-crackers'), '1 BOX', 350.00, 0.00, 350.00, 62, 1),
  ('SSC063', '300 Chain', '300 செயின்', (SELECT id FROM categories WHERE slug = 'chain-crackers'), '1 BOX', 600.00, 0.00, 600.00, 63, 1),
  ('SSC064', '600 Chain', '600 வாலா', (SELECT id FROM categories WHERE slug = 'chain-crackers'), '1 BOX', 100.00, 0.00, 100.00, 64, 1),
  ('SSC065', '1K Chain', '1 கே செயின்', (SELECT id FROM categories WHERE slug = 'chain-crackers'), '1 BOX', 1400.00, 0.00, 1400.00, 65, 1),
  ('SSC066', '2K Chain', '2 கே செயின்', (SELECT id FROM categories WHERE slug = 'chain-crackers'), '1 BOX', 2800.00, 0.00, 2800.00, 66, 1),
  ('SSC067', '5K Chain', '5 கே செயின்', (SELECT id FROM categories WHERE slug = 'chain-crackers'), '1 BOX', 7000.00, 0.00, 7000.00, 67, 1),
  ('SSC068', '10K Chain', '10 கே செயின்', (SELECT id FROM categories WHERE slug = 'chain-crackers'), '1 BOX', 14000.00, 0.00, 14000.00, 68, 1),
  ('SSC069', '1K Chain - Off Count', '1கே செயின்-ஆப் கவுண்ட்', (SELECT id FROM categories WHERE slug = 'chain-crackers'), '1 BOX', 800.00, 0.00, 800.00, 69, 1),
  ('SSC070', '2K Chain - Off Count', '2கே செயின்-ஆப் கவுண்ட்', (SELECT id FROM categories WHERE slug = 'chain-crackers'), '1 BOX', 1600.00, 0.00, 1600.00, 70, 1),
  ('SSC071', '5K Chain - Off Count', '5கே செயின்-ஆப் கவுண்ட்', (SELECT id FROM categories WHERE slug = 'chain-crackers'), '1 BOX', 4000.00, 0.00, 4000.00, 71, 1),
  ('SSC072', '10K Chain - Off Count', '10கே செயின்-ஆப் கவுண்ட்', (SELECT id FROM categories WHERE slug = 'chain-crackers'), '1 BOX', 8000.00, 0.00, 8000.00, 72, 1),
  ('SSC073', 'Red Bijili (50 Pcs)', 'ரெட் பிஜிலி 50 பீஸ்', (SELECT id FROM categories WHERE slug = 'bijili-crackers'), '1 BAG', 75.00, 0.00, 75.00, 73, 1),
  ('SSC074', 'Red Bijili (100 Pcs)', 'ரெட் பிஜிலி 100 பீஸ்', (SELECT id FROM categories WHERE slug = 'bijili-crackers'), '1 BAG', 150.00, 0.00, 150.00, 74, 1),
  ('SSC075', 'Striped Bijili (50 Pcs)', 'வரி பிஜிலி 50 பீஸ்', (SELECT id FROM categories WHERE slug = 'bijili-crackers'), '1 BAG', 80.00, 0.00, 80.00, 75, 1),
  ('SSC076', 'Striped Bijili (100 Pcs)', 'வரி பிஜிலி 100 பீஸ்', (SELECT id FROM categories WHERE slug = 'bijili-crackers'), '1 BAG', 160.00, 0.00, 160.00, 76, 1),
  ('SSC077', 'Boom Boom (25 Pcs)', 'பிஜிலி ஸ்பெஷல்', (SELECT id FROM categories WHERE slug = 'bijili-crackers'), '1 BOX', 1250.00, 0.00, 1250.00, 77, 1),
  ('SSC078', 'Light Mix (2 Pcs)', 'லைட் மிக்ஸ் (2 பீஸ்)', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 600.00, 0.00, 600.00, 78, 1),
  ('SSC079', 'Chotta Fancy', 'சோட்டா பேன்சி', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 200.00, 0.00, 200.00, 79, 1),
  ('SSC080', '2½" Pipe Fancy', '2 1/2 பைப் பேன்சி', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 500.00, 0.00, 500.00, 80, 1),
  ('SSC081', '2½" Pipe Fancy (3 Pcs)', '2 1/2 பைப் பேன்சி (3)', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 1500.00, 0.00, 1500.00, 81, 1),
  ('SSC082', '3½" Fancy Pipe', '3 1/2 பைப் பேன்சி', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 1250.00, 0.00, 1250.00, 82, 1),
  ('SSC083', '3½" Fancy Pipe Niagara Falls', '3 1/2 பேன்சி பைப் நயகரா', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 1500.00, 0.00, 1500.00, 83, 1),
  ('SSC084', '3½" Fancy Pipe Special', '3 1/2 பைப் ஸ்பெஷல்', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 1500.00, 0.00, 1500.00, 84, 1),
  ('SSC085', '3½" Fancy Pipe Special 7 Step', '3 1/2 பேன்சி பைப் ஸ்பெஷல்', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 1750.00, 0.00, 1750.00, 85, 1),
  ('SSC086', '3½" Fancy Pipe Special (2 Pcs)', '3 1/2 பேன்சி பைப் 2 பீஸ்', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 3500.00, 0.00, 3500.00, 86, 1),
  ('SSC087', '4" Fancy Pipe Special', '4" பைப் ஸ்பெஷல்', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 2000.00, 0.00, 2000.00, 87, 1),
  ('SSC088', '4" Fancy Pipe Double Ball', '4" பேன்சில் டபுள் பால்', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 2000.00, 0.00, 2000.00, 88, 1),
  ('SSC089', '4" Fancy Pipe Special (2 Pcs)', '4" பேன்சி பைப் ஸ்பெஷல்', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 4000.00, 0.00, 4000.00, 89, 1),
  ('SSC090', '5" Fancy Pipe Special (2 Pcs)', '5" பேன்சி பைப் ஸ்பெஷல்', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 4500.00, 0.00, 4500.00, 90, 1),
  ('SSC091', '6" Fancy Pipe Special (2 Pcs)', '6" பேன்சி பைப் ஸ்பெஷல்', (SELECT id FROM categories WHERE slug = 'fancy-crackers'), '1 BOX', 5000.00, 0.00, 5000.00, 91, 1),
  ('SSC092', 'Penta (5 Pcs)', 'பென்டா (5 பீஸ்)', (SELECT id FROM categories WHERE slug = 'multi-colour-shots'), '1 BOX', 1250.00, 0.00, 1250.00, 92, 1),
  ('SSC093', '7 Shot (5 Pcs)', '7 சாட் (5பீஸ்)', (SELECT id FROM categories WHERE slug = 'multi-colour-shots'), '1 BOX', 600.00, 0.00, 600.00, 93, 1),
  ('SSC094', 'Colour Celebration (5 Pcs)', 'கலர் செலிபிரேசன்', (SELECT id FROM categories WHERE slug = 'multi-colour-shots'), '1 BOX', 1250.00, 0.00, 1250.00, 94, 1),
  ('SSC095', '12 Shot Crackling', '12 சாட் கிராக்ளிங்', (SELECT id FROM categories WHERE slug = 'multi-colour-shots'), '1 BOX', 1000.00, 0.00, 1000.00, 95, 1),
  ('SSC096', '12 Shot Colour', '12 சாட் கலர்', (SELECT id FROM categories WHERE slug = 'multi-colour-shots'), '1 BOX', 1000.00, 0.00, 1000.00, 96, 1),
  ('SSC097', '25 Shot Crackling', '25 சாட் கிராக்ளிங்', (SELECT id FROM categories WHERE slug = 'multi-colour-shots'), '1 BOX', 1500.00, 0.00, 1500.00, 97, 1),
  ('SSC098', '21 Shot (1 Shot 5 Ball - 105 Balls)', '21 சாட்', (SELECT id FROM categories WHERE slug = 'multi-colour-shots'), '1 BOX', 3000.00, 0.00, 3000.00, 98, 1),
  ('SSC099', '30 Shot Colour', '30 சாட் கலர்', (SELECT id FROM categories WHERE slug = 'multi-colour-shots'), '1 BOX', 2000.00, 0.00, 2000.00, 99, 1),
  ('SSC100', '60 Shot Colour', '60 சாட் கலர்', (SELECT id FROM categories WHERE slug = 'multi-colour-shots'), '1 BOX', 4000.00, 0.00, 4000.00, 100, 1),
  ('SSC101', '120 Shot Colour', '120 சாட் கலர்', (SELECT id FROM categories WHERE slug = 'multi-colour-shots'), '1 BOX', 8000.00, 0.00, 8000.00, 101, 1),
  ('SSC102', '240 Shot Colour', '240 சாட் கலர்', (SELECT id FROM categories WHERE slug = 'multi-colour-shots'), '1 BOX', 16000.00, 0.00, 16000.00, 102, 1),
  ('SSC103', 'Colour Rain (5 Pcs)', 'கலர் மழை', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 600.00, 0.00, 600.00, 103, 1),
  ('SSC104', 'Peacock Feathers (5 Pcs)', 'பீகாக் பெதர்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 600.00, 0.00, 600.00, 104, 1),
  ('SSC105', 'Golden Globe (5 Pcs)', 'கோல்டன் குளோப்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 600.00, 0.00, 600.00, 105, 1),
  ('SSC106', 'Fountain Shower (5 Pcs)', 'பவுண்டைன் ஷோர்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 600.00, 0.00, 600.00, 106, 1),
  ('SSC107', 'Fox Star', 'பாக்ஸ் ஸ்டார்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 750.00, 0.00, 750.00, 107, 1),
  ('SSC108', 'Sing Pop', 'சிங் பாப்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1000.00, 0.00, 1000.00, 108, 1),
  ('SSC109', 'Magic Peacock', 'மேஜிக் பீகாக்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1000.00, 0.00, 1000.00, 109, 1),
  ('SSC110', 'Dancing Peacock', 'டான்சிங் பீகாக்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1000.00, 0.00, 1000.00, 110, 1),
  ('SSC111', 'Bada Peacock', 'படா பீகாக்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 2000.00, 0.00, 2000.00, 111, 1),
  ('SSC112', '90 Watts Magic Wala (3 Pcs)', '90 வாட்ஸ் மேஜிக் வாலா', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 750.00, 0.00, 750.00, 112, 1),
  ('SSC113', 'Magic Sound Magic Wala', 'மேஜிக் சவுண்ட் மேஜிக் வாலா', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1000.00, 0.00, 1000.00, 113, 1),
  ('SSC114', 'Coke (5 Pcs)', 'கோக் (5 பீஸ்)', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 600.00, 0.00, 600.00, 114, 1),
  ('SSC115', 'Fanta or Thums Up (5 Pcs)', 'பேன்டா தம்ஸ்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 750.00, 0.00, 750.00, 115, 1),
  ('SSC116', 'Jelly Pops (5 Pcs)', 'ஜெல்லி பாப்ஸ்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1000.00, 0.00, 1000.00, 116, 1),
  ('SSC117', 'Sprite or Coca-Cola (5 Pcs)', 'ஸ்பிரிட் கோகோகோலா', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1250.00, 0.00, 1250.00, 117, 1),
  ('SSC118', 'H2O Falls Red or Green', 'ஹைச் டூ ஓ அருவி', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1000.00, 0.00, 1000.00, 118, 1),
  ('SSC119', '4.5 Fountain Tin Colour Mix', '4.5 பவுண்டைன் டின் கலர் மிக்ஸ்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1000.00, 0.00, 1000.00, 119, 1),
  ('SSC120', 'Cool Drinks Shower', 'கூல் டிரிங்க்ஸ்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 750.00, 0.00, 750.00, 120, 1),
  ('SSC121', 'Sunfeast Colour Fountain (5 Pcs)', 'சன்பீஸ்ட் கலர் பவுண்டைன்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 800.00, 0.00, 800.00, 121, 1),
  ('SSC122', 'Croods Fountain', 'க்ரூட்ஸ் பவுண்டைன்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1000.00, 0.00, 1000.00, 122, 1),
  ('SSC123', 'Mini Bulls (1 Pc)', 'மினி புல்ஸ்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 250.00, 0.00, 250.00, 123, 1),
  ('SSC124', 'Lolli Pop (5 Pcs)', 'லாலி பாப்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1250.00, 0.00, 1250.00, 124, 1),
  ('SSC125', 'Rainbow Smoke (3 Pcs)', 'ரெயின்போ ஸ்மோக்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1000.00, 0.00, 1000.00, 125, 1),
  ('SSC126', 'Kung Fu Panda (1 Pc)', 'குங்பூ பேன்டா', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 300.00, 0.00, 300.00, 126, 1),
  ('SSC127', 'Mini Bulls (5 Pcs)', 'மினி புல்ஸ்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1250.00, 0.00, 1250.00, 127, 1),
  ('SSC128', 'Bat & Ball', 'பேட் & பால்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1250.00, 0.00, 1250.00, 128, 1),
  ('SSC129', 'Wire Chakkaram Hand Chakkar', 'வயர் சக்கரம்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1000.00, 0.00, 1000.00, 129, 1),
  ('SSC130', 'Kung Fu Panda (5 Pcs)', 'குங்பூ பேன்டா 5 பீஸ்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1500.00, 0.00, 1500.00, 130, 1),
  ('SSC131', 'Water Falls Fountain (1 Pc)', 'வாட்டர் பால்ஸ் பவுண்டைன்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1000.00, 0.00, 1000.00, 131, 1),
  ('SSC132', 'Water Queen', 'வாட்டர் குயின்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1000.00, 0.00, 1000.00, 132, 1),
  ('SSC133', 'Helicopter', 'ஹெலிகாப்டர்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 600.00, 0.00, 600.00, 133, 1),
  ('SSC134', 'Jasmine Flower (2 Pcs)', 'ஜேஸ்மின் ப்ளவர்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1250.00, 0.00, 1250.00, 134, 1),
  ('SSC135', 'Peacock Tail (2 Pcs)', 'பீகாக் டெயில்', (SELECT id FROM categories WHERE slug = 'fancy-fountains'), '1 BOX', 1250.00, 0.00, 1250.00, 135, 1),
  ('SSC136', 'Snake Tablet', 'பாம்பு மாத்திரை', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 100.00, 0.00, 100.00, 136, 1),
  ('SSC137', 'Roll Cap', 'ரோல் கேப்', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 600.00, 0.00, 600.00, 137, 1),
  ('SSC138', 'Stone', 'ஸ்டோன்', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 40.00, 0.00, 40.00, 138, 1),
  ('SSC139', 'Stone Green', 'ஸ்டோன் பச்சை', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 100.00, 0.00, 100.00, 139, 1),
  ('SSC140', 'Gee Boom Baa', 'ஜீ பூம் பா', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 40.00, 0.00, 40.00, 140, 1),
  ('SSC141', 'Cartoon Small (10 Pcs)', 'கார்ட்டூன் ஸ்மால்', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 100.00, 0.00, 100.00, 141, 1),
  ('SSC142', 'Cartoon Big (10 Pcs)', 'கார்ட்டூன் பிக்', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 250.00, 0.00, 250.00, 142, 1),
  ('SSC143', 'Kit Kat (10 Pcs)', 'கிட் காட்', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 125.00, 0.00, 125.00, 143, 1),
  ('SSC144', 'Butterfly (10 Pcs)', 'பட்டர் ப்ளை', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 400.00, 0.00, 400.00, 144, 1),
  ('SSC145', 'Bambaram', 'பம்பரம்', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 600.00, 0.00, 600.00, 145, 1),
  ('SSC146', 'Photo Flash (5 Pcs)', 'போட்டோ ப்பிளாஷ்', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 500.00, 0.00, 500.00, 146, 1),
  ('SSC147', 'Photo Flash Red or Green (5 Pcs)', 'போட்டோ ப்ளாஷ்', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 600.00, 0.00, 600.00, 147, 1),
  ('SSC148', 'Tim Tam (10 Pcs)', 'டிம் டாம்', (SELECT id FROM categories WHERE slug = 'kids-special'), '1 BOX', 300.00, 0.00, 300.00, 148, 1),
  ('SSC149', 'Rocket Bomb (10 Pcs)', 'ராக்கெட் பாம்ப்', (SELECT id FROM categories WHERE slug = 'rockets'), '1 BOX', 150.00, 0.00, 150.00, 149, 1),
  ('SSC150', 'Rocket Bomb Special (10 Pcs)', 'ராக்கெட் பாம்ப் ஸ்பெசல்', (SELECT id FROM categories WHERE slug = 'rockets'), '1 BOX', 400.00, 0.00, 400.00, 150, 1),
  ('SSC151', 'Musical Rocket', 'மியூசிக்கல் ராக்கெட்', (SELECT id FROM categories WHERE slug = 'rockets'), '1 BOX', 750.00, 0.00, 750.00, 151, 1),
  ('SSC152', 'Lunik Rocket (10 Pcs)', 'லூனிக் ராக்கெட்', (SELECT id FROM categories WHERE slug = 'rockets'), '1 BOX', 1000.00, 0.00, 1000.00, 152, 1),
  ('SSC153', '2 Sound Rocket (10 Pcs)', '2 சவுண்ட் ராக்கெட்', (SELECT id FROM categories WHERE slug = 'rockets'), '1 BOX', 1000.00, 0.00, 1000.00, 153, 1),
  ('SSC154', 'Whistling Rocket (10 Pcs)', 'விஸ்லிங் ராக்கெட்', (SELECT id FROM categories WHERE slug = 'rockets'), '1 BOX', 1000.00, 0.00, 1000.00, 154, 1),
  ('SSC155', 'Magic Treat Currency', 'மேஜிக் ட்ரீட் கரன்சி', (SELECT id FROM categories WHERE slug = 'paper-shots'), '1 BOX', 1500.00, 0.00, 1500.00, 155, 1),
  ('SSC156', '¼ Kilo Paper Bomb', '1/4 கிலோ பேப்பர் பாம்', (SELECT id FROM categories WHERE slug = 'paper-shots'), '1 BOX', 350.00, 0.00, 350.00, 156, 1),
  ('SSC157', '½ Kilo Paper Bomb', '1/2 கிலோ பேப்பர் பாம்', (SELECT id FROM categories WHERE slug = 'paper-shots'), '1 BOX', 700.00, 0.00, 700.00, 157, 1),
  ('SSC158', '1 Kilo Paper Bomb', '1 கிலோ பேப்பர் பாம்', (SELECT id FROM categories WHERE slug = 'paper-shots'), '1 BOX', 1400.00, 0.00, 1400.00, 158, 1),
  ('SSC159', '2 in 1 Laddu (10 Pcs)', '2 இன் 1 (10 பீஸ்)', (SELECT id FROM categories WHERE slug = 'laddu-flower-pots'), '1 BOX', 2500.00, 0.00, 2500.00, 159, 1),
  ('SSC160', 'Colour Changing Laddu (5 Pcs)', 'கலர் சேஞ்சிங் லட்டு', (SELECT id FROM categories WHERE slug = 'laddu-flower-pots'), '1 BOX', 2500.00, 0.00, 2500.00, 160, 1),
  ('SSC161', 'Deluxe Laddu (4 Pcs)', 'கலர் சேஞ்சிங் டீலக்ஸ்', (SELECT id FROM categories WHERE slug = 'laddu-flower-pots'), '1 BOX', 3000.00, 0.00, 3000.00, 161, 1),
  ('SSC162', '7 cm Electric Sparklers', '7 செ.மீ சாதா கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 75.00, 0.00, 75.00, 162, 1),
  ('SSC163', '7 cm Colour Sparklers', '7 செ.மீ கலர் கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 75.00, 0.00, 75.00, 163, 1),
  ('SSC164', '7 cm Green Sparklers', '7 செ.மீ பச்சை கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 75.00, 0.00, 75.00, 164, 1),
  ('SSC165', '7 cm Red Sparklers', '7 செ.மீ சிவப்பு கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 75.00, 0.00, 75.00, 165, 1),
  ('SSC166', '10 cm Electric Sparklers', '10 செ.மீ சாதா கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 100.00, 0.00, 100.00, 166, 1),
  ('SSC167', '10 cm Colour Sparklers', '10 செ.மீ கலர் கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 100.00, 0.00, 100.00, 167, 1),
  ('SSC168', '10 cm Green Sparklers', '10 செ.மீ பச்சை கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 100.00, 0.00, 100.00, 168, 1),
  ('SSC169', '10 cm Red Sparklers', '10 செ.மீ சிவப்பு கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 100.00, 0.00, 100.00, 169, 1),
  ('SSC170', '12 cm Electric Sparklers', '12 செ.மீ சாதா கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 150.00, 0.00, 150.00, 170, 1),
  ('SSC171', '12 cm Colour Sparklers', '12 செ.மீ கலர் கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 150.00, 0.00, 150.00, 171, 1),
  ('SSC172', '12 cm Green Sparklers', '12 செ.மீ பச்சை கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 150.00, 0.00, 150.00, 172, 1),
  ('SSC173', '12 cm Red Sparklers', '12 செ.மீ சிவப்பு கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 150.00, 0.00, 150.00, 173, 1),
  ('SSC174', '15 cm Electric Sparklers', '15 செ.மீ சாதா கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 250.00, 0.00, 250.00, 174, 1),
  ('SSC175', '15 cm Colour Sparklers', '15 செ.மீ கலர் கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 250.00, 0.00, 250.00, 175, 1),
  ('SSC176', '15 cm Green Sparklers', '15 செ.மீ பச்சை கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 250.00, 0.00, 250.00, 176, 1),
  ('SSC177', '15 cm Red Sparklers', '15 செ.மீ சிவப்பு கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 250.00, 0.00, 250.00, 177, 1),
  ('SSC178', '30 cm Electric Sparklers', '30 செ.மீ சாதா கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 250.00, 0.00, 250.00, 178, 1),
  ('SSC179', '30 cm Colour Sparklers', '30 செ.மீ கலர் கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 250.00, 0.00, 250.00, 179, 1),
  ('SSC180', '30 cm Green Sparklers', '30 செ.மீ பச்சை கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 250.00, 0.00, 250.00, 180, 1),
  ('SSC181', '30 cm Red Sparklers', '30 செ.மீ சிவப்பு கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 250.00, 0.00, 250.00, 181, 1),
  ('SSC182', '50 cm Electric Sparklers', '50 செ.மீ சாதா கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 1000.00, 0.00, 1000.00, 182, 1),
  ('SSC183', '50 cm Colour Sparklers', '50 செ.மீ கலர் கம்பி', (SELECT id FROM categories WHERE slug = 'sparklers'), '1 BOX', 1100.00, 0.00, 1100.00, 183, 1),
  ('SSC184', 'Sachin Pocket (3 Pcs)', 'சச்சின் (3 பீஸ்)', (SELECT id FROM categories WHERE slug = 'colour-matches'), '1 PKT', 100.00, 0.00, 100.00, 184, 1),
  ('SSC185', 'Sachin Pocket (5 Pcs)', 'சச்சின் (5 பீஸ்)', (SELECT id FROM categories WHERE slug = 'colour-matches'), '1 PKT', 175.00, 0.00, 175.00, 185, 1),
  ('SSC186', 'Sachin Box (10 Pcs)', 'சச்சின் பாக்ஸ்', (SELECT id FROM categories WHERE slug = 'colour-matches'), '1 BOX', 350.00, 0.00, 350.00, 186, 1),
  ('SSC187', 'Lion Laptop (10 Pcs)', 'லயன் லேப்டாப்', (SELECT id FROM categories WHERE slug = 'colour-matches'), '1 BOX', 800.00, 0.00, 800.00, 187, 1),
  ('SSC188', 'Royal Laptop (10 Pcs)', 'ராயல் லேப்டாப்', (SELECT id FROM categories WHERE slug = 'colour-matches'), '1 BOX', 1000.00, 0.00, 1000.00, 188, 1),
  ('SSC189', 'Crayon Small (5 Pcs)', 'க்ரையன் சுமால் (5 பீஸ்)', (SELECT id FROM categories WHERE slug = 'music-crayon'), '1 BOX', 750.00, 0.00, 750.00, 189, 1),
  ('SSC190', 'Crayon Big (3 Pcs)', 'க்ரையன் பிக் (3 பீஸ்)', (SELECT id FROM categories WHERE slug = 'music-crayon'), '1 BOX', 1000.00, 0.00, 1000.00, 190, 1),
  ('SSC191', '17 Item Box', '17 அயிட்டம்', (SELECT id FROM categories WHERE slug = 'gift-boxes'), '1 BOX', 250.00, 0.00, 250.00, 191, 1),
  ('SSC192', '21 Item Box', '21 அயிட்டம்', (SELECT id FROM categories WHERE slug = 'gift-boxes'), '1 BOX', 300.00, 0.00, 300.00, 192, 1),
  ('SSC193', '27 Item Box', '27 அயிட்டம்', (SELECT id FROM categories WHERE slug = 'gift-boxes'), '1 BOX', 350.00, 0.00, 350.00, 193, 1),
  ('SSC194', '31 Item Box', '31 அயிட்டம்', (SELECT id FROM categories WHERE slug = 'gift-boxes'), '1 BOX', 400.00, 0.00, 400.00, 194, 1),
  ('SSC195', '35 Item Box', '35 அயிட்டம்', (SELECT id FROM categories WHERE slug = 'gift-boxes'), '1 BOX', 500.00, 0.00, 500.00, 195, 1),
  ('SSC196', '40 Item Box', '40 அயிட்டம்', (SELECT id FROM categories WHERE slug = 'gift-boxes'), '1 BOX', 650.00, 0.00, 650.00, 196, 1),
  ('SSC197', '45 Item Box', '45 அயிட்டம்', (SELECT id FROM categories WHERE slug = 'gift-boxes'), '1 BOX', 800.00, 0.00, 800.00, 197, 1),
  ('SSC198', '50 Item Box', '50 அயிட்டம்', (SELECT id FROM categories WHERE slug = 'gift-boxes'), '1 BOX', 1000.00, 0.00, 1000.00, 198, 1),
  ('SSC199', '61 Item Family Box', 'பேமிலி பாக்ஸ்', (SELECT id FROM categories WHERE slug = 'gift-boxes'), '1 BOX', 1600.00, 0.00, 1600.00, 199, 1),
  ('SSC200', 'Combo Pack Silver', 'காம்போ பேக் சில்வர்', (SELECT id FROM categories WHERE slug = 'gift-boxes'), '1 BOX', 2500.00, 0.00, 2500.00, 200, 1),
  ('SSC201', 'Combo Pack Gold', 'காம்போ பேக் கோல்ட்', (SELECT id FROM categories WHERE slug = 'gift-boxes'), '1 BOX', 3500.00, 0.00, 3500.00, 201, 1),
  ('SSC202', 'Combo Pack Diamond', 'காம்போ பேக் டைமண்ட்', (SELECT id FROM categories WHERE slug = 'gift-boxes'), '1 BOX', 5000.00, 0.00, 5000.00, 202, 1)
ON DUPLICATE KEY UPDATE product_name = VALUES(product_name), tamil_name = VALUES(tamil_name), category_id = VALUES(category_id),
  unit = VALUES(unit), original_price = VALUES(original_price), discount_percentage = VALUES(discount_percentage),
  selling_price = VALUES(selling_price), display_order = VALUES(display_order);

-- Sample promotion code (inactive by default - activate from SQL when needed)
INSERT INTO promotion_codes (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active) VALUES
  ('DIWALI5', 'Extra 5% off on orders above Rs.5000', 'PERCENT', 5.00, 5000.00, 1000.00, 0)
ON DUPLICATE KEY UPDATE description = VALUES(description);
