-- Orders table migration
-- Timezone: Europe/Istanbul (+03:00)

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_id INT NOT NULL,
  status ENUM('open', 'paid', 'cancelled') NOT NULL DEFAULT 'open',
  items JSON NOT NULL,
  note TEXT,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME NULL,
  INDEX idx_orders_open (closed_at, table_id),
  INDEX idx_orders_table (table_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Set timezone for MySQL session
SET time_zone = '+03:00';


