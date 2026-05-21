/**
 * TechVault Product Seeding Script
 * Populates the database with sample products for testing
 */

const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const dbPath = process.env.DATABASE_PATH || './data/store.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

const sampleProducts = [
  // Cybersecurity Tools
  {
    name: 'John the Ripper Pro',
    category: 'cybersecurity',
    price: 299,
    description: 'Advanced password cracking tool with GPU acceleration. Professional edition with extended wordlists and rules.',
    image_url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    stock: 50
  },
  {
    name: 'Metasploit Framework Enterprise',
    category: 'cybersecurity',
    price: 1999,
    description: 'Complete penetration testing framework with automated exploitation and vulnerability assessment.',
    image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop',
    stock: 15
  },
  {
    name: 'Burp Suite Professional',
    category: 'cybersecurity',
    price: 399,
    description: 'Web application security testing toolkit with advanced scanning and manual testing tools.',
    image_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    stock: 75
  },
  {
    name: 'Nmap Security Scanner Pro',
    category: 'cybersecurity',
    price: 149,
    description: 'Network discovery and security auditing tool with advanced scripting engine and GUI.',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    stock: 120
  },
  {
    name: 'Wireshark Enterprise',
    category: 'cybersecurity',
    price: 599,
    description: 'Network protocol analyzer with advanced filtering, decryption, and analysis capabilities.',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    stock: 45
  },
  {
    name: 'Hashcat Advanced',
    category: 'cybersecurity',
    price: 199,
    description: 'World\'s fastest password recovery tool with GPU acceleration and extensive hash support.',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    stock: 85
  },

  // Web Development Tools
  {
    name: 'WebStorm IDE Professional',
    category: 'webdev',
    price: 199,
    description: 'Intelligent JavaScript IDE with advanced debugging, testing, and framework support.',
    image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
    stock: 200
  },
  {
    name: 'React Development Toolkit',
    category: 'webdev',
    price: 89,
    description: 'Complete React.js development environment with hot reloading, testing, and deployment tools.',
    image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    stock: 150
  },
  {
    name: 'Node.js Performance Suite',
    category: 'webdev',
    price: 299,
    description: 'Advanced Node.js monitoring, profiling, and optimization toolkit for production applications.',
    image_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
    stock: 95
  },
  {
    name: 'Docker Enterprise Platform',
    category: 'webdev',
    price: 799,
    description: 'Complete containerization platform with orchestration, security, and management tools.',
    image_url: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=300&fit=crop',
    stock: 60
  },

  // Automation Tools
  {
    name: 'Selenium Grid Pro',
    category: 'automation',
    price: 449,
    description: 'Advanced web automation framework with parallel testing and cloud integration.',
    image_url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    stock: 80
  },
  {
    name: 'Puppeteer Automation Bot',
    category: 'automation',
    price: 199,
    description: 'Headless Chrome automation tool for web scraping, testing, and PDF generation.',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
    stock: 110
  },
  {
    name: 'Zapier Enterprise Bot',
    category: 'automation',
    price: 599,
    description: 'Advanced workflow automation platform connecting 5000+ apps and services.',
    image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop',
    stock: 35
  },
  {
    name: 'GitHub Actions Pro',
    category: 'automation',
    price: 299,
    description: 'CI/CD automation platform with advanced workflows and enterprise features.',
    image_url: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=300&fit=crop',
    stock: 125
  },

  // Development Hardware
  {
    name: 'Penetration Testing Laptop',
    category: 'hardware',
    price: 2999,
    description: 'High-performance laptop pre-configured with Kali Linux and penetration testing tools.',
    image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
    stock: 25
  },
  {
    name: 'WiFi Pineapple Enterprise',
    category: 'hardware',
    price: 399,
    description: 'Advanced wireless auditing platform for penetration testing and security research.',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    stock: 40
  },
  {
    name: 'Raspberry Pi Security Kit',
    category: 'hardware',
    price: 149,
    description: 'Complete Raspberry Pi setup with security tools, sensors, and penetration testing software.',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    stock: 75
  },
  {
    name: 'USB Rubber Ducky',
    category: 'hardware',
    price: 79,
    description: 'Keystroke injection tool for penetration testing and security awareness training.',
    image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',
    stock: 200
  },

  // Cloud & DevOps Tools
  {
    name: 'Kubernetes Management Suite',
    category: 'devops',
    price: 899,
    description: 'Complete Kubernetes orchestration platform with monitoring, security, and deployment tools.',
    image_url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop',
    stock: 45
  },
  {
    name: 'Terraform Enterprise',
    category: 'devops',
    price: 699,
    description: 'Infrastructure as Code platform with advanced collaboration and governance features.',
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
    stock: 55
  },
  {
    name: 'Ansible Automation Platform',
    category: 'devops',
    price: 499,
    description: 'IT automation platform for configuration management, application deployment, and orchestration.',
    image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop',
    stock: 70
  }
];

function seedProducts() {
  console.log('\n📦 Seeding sample products...\n');

  db.serialize(() => {
    // Clear existing products
    db.run('DELETE FROM products', (err) => {
      if (err) console.error('Error clearing products:', err);
      else console.log('✅ Cleared existing products');
    });

    // Insert sample products
    const stmt = db.prepare(`
      INSERT INTO products (name, description, category, price, image_url, stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    sampleProducts.forEach((product, index) => {
      stmt.run(
        product.name,
        product.description,
        product.category,
        product.price,
        product.image_url,
        product.stock,
        (err) => {
          if (err) {
            console.error(`❌ Error inserting ${product.name}:`, err);
          } else {
            console.log(`✅ Inserted: ${product.name} ($${product.price}) - ${product.stock} in stock`);
          }
        }
      );
    });

    stmt.finalize((err) => {
      if (err) console.error('Error finalizing:', err);
      else {
        console.log(`\n✅ Successfully seeded ${sampleProducts.length} products!\n`);
        db.close((err) => {
          if (err) console.error('Error closing database:', err);
          else console.log('✅ Database connection closed\n');
          process.exit(0);
        });
      }
    });
  });
}

seedProducts();
