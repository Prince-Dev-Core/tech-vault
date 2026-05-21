const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './data/store.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database error:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

const products = [
  {
    name: 'Quantum X1 Pro Laptop',
    description: 'The ultimate powerhouse for creators and professionals. Featuring the latest M3 Ultra chip, 64GB RAM, and a stunning 16-inch Liquid Retina XDR display.',
    category: 'laptops',
    price: 2499,
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
    stock: 15
  },
  {
    name: 'Nebula Phone 15 Ultra',
    description: 'Experience the future of mobile with our most advanced smartphone. Titanium design, periscope camera, and satellite connectivity.',
    category: 'phones',
    price: 1199,
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    stock: 25
  },
  {
    name: 'AeroPods Max Pro',
    description: 'Immersive spatial audio with adaptive noise cancellation. Premium materials meet cutting-edge acoustic engineering.',
    category: 'audio',
    price: 549,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    stock: 30
  },
  {
    name: 'Vortex Gaming Mouse',
    description: 'Precision engineered for esports professionals. 25K DPI sensor, ultra-lightweight design, and customizable RGB lighting.',
    category: 'gaming',
    price: 149,
    image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
    stock: 50
  },
  {
    name: 'Horizon 4K Monitor',
    description: '32-inch 4K UHD display with 144Hz refresh rate. Perfect for gaming, content creation, and professional work.',
    category: 'accessories',
    price: 899,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
    stock: 12
  },
  {
    name: 'Titan Mechanical Keyboard',
    description: 'Premium mechanical keyboard with hot-swappable switches, gasket mount design, and per-key RGB backlighting.',
    category: 'gaming',
    price: 199,
    image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&h=300&fit=crop',
    stock: 40
  },
  {
    name: 'Pulse Smart Watch Ultra',
    description: 'The most rugged and capable smartwatch ever. Built for endurance, exploration, and adventure.',
    category: 'accessories',
    price: 799,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    stock: 20
  },
  {
    name: 'Echo Studio Speaker',
    description: 'High-fidelity smart speaker with spatial audio. Room-filling sound that adapts to any space.',
    category: 'audio',
    price: 399,
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=300&fit=crop',
    stock: 35
  },
  {
    name: 'Phantom VR Headset',
    description: 'Next-generation VR with mixed reality passthrough. Experience immersive worlds like never before.',
    category: 'gaming',
    price: 599,
    image_url: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400&h=300&fit=crop',
    stock: 18
  },
  {
    name: 'Flux Power Bank 20K',
    description: 'Ultra-compact 20,000mAh power bank with 140W fast charging. Charge your laptop on the go.',
    category: 'accessories',
    price: 89,
    image_url: 'https://images.unsplash.com/photo-1609592424303-5658691a4136?w=400&h=300&fit=crop',
    stock: 100
  },
  {
    name: 'Zenith Tablet Pro',
    description: 'The most versatile tablet ever. Laptop power in an impossibly thin and light design.',
    category: 'laptops',
    price: 1099,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
    stock: 22
  },
  {
    name: 'Sonic Noise Cancelling Buds',
    description: 'True wireless earbuds with industry-leading noise cancellation and crystal-clear calls.',
    category: 'audio',
    price: 249,
    image_url: 'https://images.unsplash.com/photo-1572569028738-411a197b83cd?w=400&h=300&fit=crop',
    stock: 45
  }
];

db.serialize(() => {
  // Clear existing products
  db.run('DELETE FROM products', (err) => {
    if (err) console.error('Clear error:', err);
    else console.log('Cleared existing products');
  });

  // Insert new products
  const stmt = db.prepare(`
    INSERT INTO products (name, description, category, price, image_url, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  products.forEach((product) => {
    stmt.run(
      product.name,
      product.description,
      product.category,
      product.price,
      product.image_url,
      product.stock,
      (err) => {
        if (err) console.error('Insert error:', err);
      }
    );
  });

  stmt.finalize((err) => {
    if (err) console.error('Finalize error:', err);
    else console.log(`✅ Successfully inserted ${products.length} products`);
    
    // Verify
    db.all('SELECT COUNT(*) as count FROM products', (err, rows) => {
      if (err) console.error('Count error:', err);
      else console.log(`📊 Total products in database: ${rows[0].count}`);
      
      db.close((err) => {
        if (err) console.error('Close error:', err);
        else console.log('✅ Database closed');
        process.exit(0);
      });
    });
  });
});
