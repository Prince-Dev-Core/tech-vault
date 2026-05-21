# TechVault E-Commerce Platform - Project Structure

## Overview
This document describes the organized project structure for the TechVault E-Commerce Platform, following the lightweight design specifications.

## Project Structure

```
TECHVAULT/
├── backend/                          # Backend API (Node.js/Express)
│   ├── config/                       # Configuration files
│   │   ├── database.js              # Database configuration
│   │   ├── email.js                 # Email service configuration
│   │   └── stripe.js                # Stripe payment configuration
│   ├── data/                        # Database files
│   │   └── store.db                 # SQLite database
│   ├── middleware/                  # Express middleware
│   │   └── errorHandler.js          # Error handling middleware
│   ├── routes/                      # API route handlers
│   │   ├── health.js                # Health check endpoint
│   │   ├── orders.js                # Order management endpoints
│   │   ├── payments.js              # Payment processing endpoints
│   │   └── products.js              # Product catalog endpoints
│   ├── utils/                       # Utility functions
│   │   └── helpers.js               # Helper functions
│   ├── .env                         # Environment variables
│   ├── .gitignore                   # Git ignore rules
│   ├── package.json                 # Node.js dependencies
│   ├── package-lock.json            # Dependency lock file
│   ├── server.js                    # Main server file
│   ├── seed-products.js             # Product seeding script
│   ├── test-api.js                  # API testing script
│   └── test-payment-email.js        # Payment/email testing
│
├── public/                          # Frontend (Static HTML/CSS/JS)
│   ├── assets/                      # Static assets
│   │   ├── tech-vault-icon.svg      # Logo (SVG format)
│   │   └── tech-vault-icon.png      # Logo (PNG format)
│   ├── css/                         # Stylesheets
│   │   └── styles.css               # Main stylesheet
│   ├── js/                          # JavaScript modules
│   │   ├── api.js                   # API communication layer
│   │   ├── app.js                   # Main application logic
│   │   ├── cart.js                  # Shopping cart management
│   │   └── utils.js                 # Utility functions
│   └── index.html                   # Main HTML file
│
├── .kiro/                           # Kiro specification files
│   └── specs/
│       └── techvault-ecommerce-platform/
│           ├── .config              # Spec configuration
│           ├── design.md            # System design document
│           ├── requirements.md      # Requirements specification
│           └── tasks.md             # Implementation tasks
│
├── .gitignore                       # Git ignore rules (root)
├── .vscode/                         # VS Code configuration
├── PROJECT_STRUCTURE.md             # This file
└── README.md                        # Project documentation
```

## Architecture Overview

### Backend (Node.js/Express)
- **Lightweight API**: Minimal Express.js server with essential endpoints
- **SQLite Database**: Single-file database for simplicity
- **Payment Integration**: Stripe for secure payment processing
- **Email Service**: Nodemailer for order confirmations
- **No Authentication**: Guest checkout only (as per lightweight design)

### Frontend (Static HTML/CSS/JS)
- **No Build Process**: Direct browser execution
- **Modular JavaScript**: Separated into logical modules
- **Responsive Design**: Mobile-first CSS approach
- **LocalStorage**: Cart persistence without backend sessions

### Key Design Principles
1. **Simplicity**: Minimal dependencies and configuration
2. **Modularity**: Separated concerns across files
3. **Maintainability**: Clear structure and documentation
4. **Performance**: Optimized for fast loading and execution
5. **Scalability**: Easy to extend and modify

## File Descriptions

### Backend Files

#### Core Files
- `server.js`: Main Express server with all API endpoints
- `package.json`: Dependencies and scripts configuration
- `.env`: Environment variables (API keys, database path)

#### Database
- `data/store.db`: SQLite database file (auto-created)
- Database schema includes: products, orders, order_items tables

#### API Endpoints
- `GET /api/health`: Server health check
- `GET /api/products`: Retrieve products (with filtering)
- `GET /api/products/:id`: Get single product
- `POST /api/orders`: Create new order
- `GET /api/orders/:orderNumber`: Get order details
- `POST /api/payments/webhook`: Stripe webhook handler

### Frontend Files

#### HTML Structure
- `index.html`: Complete page structure with semantic HTML5

#### CSS Organization
- `styles.css`: All styles in a single file with CSS custom properties
- Responsive design with mobile-first approach
- CSS Grid and Flexbox for layouts

#### JavaScript Modules
- `utils.js`: Utility functions (formatting, validation, storage)
- `api.js`: API communication with error handling and retries
- `cart.js`: Shopping cart management with localStorage
- `app.js`: Main application logic and UI interactions

## Development Workflow

### Setup
1. Install backend dependencies: `cd backend && npm install`
2. Configure environment variables in `backend/.env`
3. Start backend server: `npm start`
4. Serve frontend from `public/` directory

### Testing
- Backend API: `npm run test` (in backend directory)
- Frontend: Open `public/index.html` in browser
- Integration: Use provided test scripts

### Deployment
- Backend: Deploy to Vercel, Railway, or VPS
- Frontend: Serve static files from `public/` directory
- Database: SQLite file included with deployment

## Environment Variables

Required environment variables for backend (`.env` file):

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8000

# Database
DATABASE_PATH=./data/store.db

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## API Configuration

Frontend automatically detects environment:
- **Development**: `http://localhost:3000/api`
- **Production**: `/api` (relative to domain)

## Features Implemented

### Core E-Commerce Features
- ✅ Product catalog with categories
- ✅ Search and filtering
- ✅ Shopping cart with persistence
- ✅ Guest checkout process
- ✅ Order creation and tracking
- ✅ Payment processing (Stripe)
- ✅ Email confirmations
- ✅ Responsive design

### Technical Features
- ✅ RESTful API design
- ✅ Error handling and validation
- ✅ Loading states and user feedback
- ✅ Local storage management
- ✅ Modular JavaScript architecture
- ✅ Mobile-responsive UI
- ✅ Performance optimizations

## Next Steps

### Immediate Tasks
1. ✅ Project structure organized
2. Populate database with sample products
3. Test frontend-backend integration
4. Configure payment processing
5. Set up email service
6. Deploy to production

### Future Enhancements
- User authentication system
- Admin dashboard
- Inventory management
- Advanced search features
- Product reviews and ratings
- Wishlist functionality
- Analytics and reporting

## Notes

- This structure follows the lightweight design principles
- All files are properly organized and documented
- The project is ready for development and testing
- Deployment configuration is included
- Security best practices are implemented