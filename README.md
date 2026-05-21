# TechVault E-Commerce Platform

A lightweight, modern e-commerce platform built with Node.js, Express, Supabase, and vanilla JavaScript. Features a clean, responsive design and seamless shopping experience focused on cryptocurrency payments.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git (optional)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd TECHVAULT
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Copy and edit environment variables
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Initialize Supabase & Seed Products**
   ```bash
   npm run seed
   ```

5. **Start Backend Server**
   ```bash
   npm start
   ```

6. **Serve Frontend**
   - Open `public/index.html` in your browser, or
   - Use a local server: `python -m http.server 8000` (from public/ directory)

## 📁 Project Structure

```
TECHVAULT/
├── backend/                 # Node.js/Express API
│   ├── config/             # Configuration files
│   ├── data/               # SQLite database
│   ├── routes/             # API endpoints
│   ├── utils/              # Helper functions
│   └── server.js           # Main server file
├── public/                 # Frontend (HTML/CSS/JS)
│   ├── assets/             # Images and icons
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript modules
│   └── index.html          # Main HTML file
└── .kiro/                  # Specification files
```

## ✨ Features

### Core E-Commerce
- 🛍️ Product catalog with categories
- 🔍 Search and filtering
- 🛒 Shopping cart with persistence
- 💳 Secure checkout process
- 📧 Order confirmation emails
- 💰 Stripe payment integration

### Technical
- 📱 Responsive design (mobile-first)
- ⚡ Fast loading (no build process)
- 🔒 Secure payment processing
- 📊 SQLite database
- 🎨 Modern UI with CSS Grid/Flexbox
- 🧩 Modular JavaScript architecture

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database
- **Stripe** - Payment processing
- **Nodemailer** - Email service

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **Vanilla JavaScript** - No frameworks, pure JS
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## 🔧 Configuration

### Environment Variables

Create `backend/.env` file:

```env
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8000

# Database
DATABASE_PATH=./data/store.db

# Stripe (get from https://stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Gmail App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/products` - Get products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/orders` - Create order
- `GET /api/orders/:orderNumber` - Get order details
- `POST /api/payments/webhook` - Stripe webhook

## 🧪 Testing

### Backend API Testing
```bash
cd backend
npm test
```

### Payment & Email Testing
```bash
cd backend
npm run test-payment
```

### Frontend Testing
1. Open `public/index.html` in browser
2. Test product loading, cart functionality, and checkout
3. Check browser console for errors

## 🚀 Deployment

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Option 2: Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy with one click

### Option 3: Self-hosted VPS
```bash
# Install dependencies
npm install --production

# Start with PM2
npm install -g pm2
pm2 start server.js --name techvault

# Setup Nginx reverse proxy
# Configure SSL with Let's Encrypt
```

## 📊 Database Schema

### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id)
);
```

## 🎨 Design System

### Colors
- **Primary**: `#00d4ff` (Cyan)
- **Secondary**: `#7c3aed` (Purple)
- **Accent**: `#f472b6` (Pink)
- **Background**: `#0a0a0f` (Dark)
- **Cards**: `#12121a` (Dark Gray)

### Typography
- **Headers**: Orbitron (Futuristic)
- **Body**: Inter (Clean, readable)

### Components
- Responsive grid system
- Modern card designs
- Smooth animations
- Mobile-first approach

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- HTTPS enforcement
- Secure payment processing (PCI DSS compliant)
- Environment variable protection

## 📈 Performance

- **Page Load**: < 2 seconds
- **API Response**: < 500ms
- **Database Queries**: < 100ms
- **Image Optimization**: Lazy loading
- **Caching**: Browser caching enabled

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@techvault.com
- 📖 Documentation: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core e-commerce functionality
- ✅ Payment processing
- ✅ Responsive design
- ✅ Order management

### Phase 2 (Next)
- [ ] User authentication
- [ ] Admin dashboard
- [ ] Inventory management
- [ ] Product reviews

### Phase 3 (Future)
- [ ] Advanced search
- [ ] Wishlist functionality
- [ ] Analytics dashboard
- [ ] Multi-language support

---

**Built with ❤️ by the TechVault Team**