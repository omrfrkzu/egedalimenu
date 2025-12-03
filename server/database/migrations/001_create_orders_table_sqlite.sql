-- Orders table migration for SQLite
-- Timezone: Europe/Istanbul (+03:00) - handled in application

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'paid', 'cancelled')),
  items TEXT NOT NULL, -- JSON string
  note TEXT,
  total REAL NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT (datetime('now', 'localtime')),
  closed_at DATETIME NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_open ON orders(closed_at, table_id);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);


