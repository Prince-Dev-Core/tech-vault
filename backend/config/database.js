const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize SQLite Database
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/store.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database error:', err);
  else console.log('✅ Connected to SQLite database');
});

// Initialize Database Tables
function initializeDatabase() {
  db.serialize(() => {
    // Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Products table error:', err);
      else console.log('✅ Products table ready');
    });

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        shipping_address TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        crypto_currency TEXT,
        crypto_amount REAL,
        crypto_address TEXT,
        crypto_tx_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Orders table error:', err);
      else console.log('✅ Orders table ready');
    });

    // Order items table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id)
      )
    `, (err) => {
      if (err) console.error('Order items table error:', err);
      else console.log('✅ Order items table ready');
    });

    // Create indexes
    db.run(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)`);
  });
}

initializeDatabase();

module.exports = db;
