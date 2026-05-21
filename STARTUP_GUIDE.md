# 🚀 TECHVAULT - COMPLETE STARTUP GUIDE

**Application:** TechVault E-Commerce Platform  
**Version:** 1.0.0  
**Status:** ✅ Production-Ready  
**Last Updated:** May 20, 2026

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 minutes)](#quick-start-5-minutes)
3. [Detailed Setup](#detailed-setup)
4. [Configuration](#configuration)
5. [Verification](#verification)
6. [Running Tests](#running-tests)
7. [Troubleshooting](#troubleshooting)
8. [Deployment Options](#deployment-options)

---

## 📦 PREREQUISITES

### Required Software
- **Node.js** 18.0+ ([download](https://nodejs.org/))
- **npm** 9.0+ (comes with Node.js)
- **Git** (optional, for version control)
- **Python 3.0+** (optional, for simple HTTP server)

### Verify Installation
```powershell
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher
```

### System Requirements
- **RAM:** 2GB minimum (4GB recommended)
- **Storage:** 500MB free space
- **OS:** Windows, macOS, or Linux
- **Browser:** Modern browser (Chrome, Firefox, Safari, Edge)

---

## ⚡ QUICK START (5 MINUTES)

### Step 1: Navigate to Project
```powershell
cd c:\Users\NIGHTSTUDIOS\Downloads\TECHVAULT
```

### Step 2: Start Backend Server
```powershell
cd backend
npm start
```

**Expected Output:**
```
✅ Connected to SQLite database
✅ Products table ready
✅ Orders table ready
✅ Order items table ready
🚀 TechVault server running on port 3000
📝 Environment: development
💾 Database: ./data/store.db
🌐 Frontend URL: http://localhost:8000
✅ Server ready for requests
```

### Step 3: Start Frontend (New Terminal)
```powershell
cd c:\Users\NIGHTSTUDIOS\Downloads\TECHVAULT
python -m http.server 8000
```

**Expected Output:**
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

### Step 4: Access Application
- **Frontend:** http://localhost:8000
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

### Step 5: Test APIs
```powershell
# Get products
curl http://localhost:3000/api/products

# Check health
curl http://localhost:3000/api/health
```

---

## 📖 DETAILED SETUP

### Backend Installation & Setup

#### 1. Install Backend Dependencies
```powershell
cd c:\Users\NIGHTSTUDIOS\Downloads\TECHVAULT\backend
npm install
```

**What gets installed:**
- Express.js web framework
- SQLite3 database
- Stripe payment SDK
- Nodemailer for emails
- Bitcoin/Ethereum libraries
- And more (13 total packages)

#### 2. Create Database
The database is automatically created on first run, but you can manually seed products:

```powershell
# Seed sample products
npm run seed

# Output:
# ✅ Database initialized
# ✅ 21 products added successfully
```

#### 3. Start Backend Server
```powershell
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

### Frontend Setup

#### 1. Install Frontend Dependencies (Optional)
```powershell
cd c:\Users\NIGHTSTUDIOS\Downloads\TECHVAULT
npm install
```

This installs Jest for running tests. Frontend itself uses no framework dependencies.

#### 2. Serve Frontend Locally
```powershell
# Option 1: Python HTTP Server (Recommended)
cd public
python -m http.server 8000

# Option 2: Node.js HTTP Server
cd public
npx http-server -p 8000

# Option 3: VS Code Live Server extension
# (Right-click index.html → Open with Live Server)
```

---

## ⚙️ CONFIGURATION

### Environment Variables

#### 1. Backend Configuration (.env file)
Located at: `backend/.env`

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8000

# Database
DATABASE_PATH=./data/store.db

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Stripe Payment (Optional)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Cryptocurrency Addresses (For Testing)
BTC_WALLET_ADDRESS=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
ETH_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C0532950532950
```

#### 2. Setting Up Email Service (Gmail)
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Generate App Password:
   - Go to App passwords
   - Select Mail and Windows Computer
   - Copy the generated password
   - Paste into `EMAIL_PASSWORD` in `.env`

#### 3. Setting Up Stripe (Optional)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your Test Keys from Developers → API Keys
3. Copy `Publishable key` → `STRIPE_PUBLIC_KEY`
4. Copy `Secret key` → `STRIPE_SECRET_KEY`

#### 4. Frontend Configuration
Frontend automatically detects backend:
- If serving on localhost → connects to `http://localhost:3000/api`
- If on domain → connects to `/api` (proxy to backend)

### Database Configuration

#### Verify Database
```powershell
# Check if database exists and has data
cd c:\Users\NIGHTSTUDIOS\Downloads\TECHVAULT\backend
node -e "
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/store.db');
db.all('SELECT COUNT(*) as count FROM products', (err, row) => {
  console.log('Products in DB:', row[0].count);
  db.close();
});
"
```

#### Reset Database
```powershell
cd c:\Users\NIGHTSTUDIOS\Downloads\TECHVAULT\backend

# Delete existing database
del .\data\store.db

# Seeds with fresh data
npm run seed
```

---

## ✅ VERIFICATION

### Verify Backend is Running
```powershell
# Check health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"success": true, "message": "Server is running"}
```

### Verify Products Load
```powershell
# Get products
curl http://localhost:3000/api/products

# Should return JSON with array of products
```

### Verify Database Connection
```powershell
# Check database file exists
Test-Path c:\Users\NIGHTSTUDIOS\Downloads\TECHVAULT\backend\data\store.db
# Should output: True

# Check product count
node -e "const db = require('sqlite3').Database; const d = new db('./backend/data/store.db'); d.all('SELECT COUNT(*) as count FROM products', (e,r) => { console.log(r[0].count); d.close(); })"
# Should output: 21
```

### Verify Frontend Loads
1. Open browser: http://localhost:8000
2. Should see TechVault homepage
3. Check browser console (F12) for any errors
4. Products should load from API

### Run Health Checks
```powershell
cd c:\Users\NIGHTSTUDIOS\Downloads\TECHVAULT

# Test backend
npm run test --prefix backend

# Test frontend
npm test
```

---

## 🧪 RUNNING TESTS

### Run All Tests
```powershell
cd c:\Users\NIGHTSTUDIOS\Downloads\TECHVAULT

# Run all frontend tests
npm test

# Expected output:
# Test Suites: 9 passed, 9 total
# Tests: 389 passed, 389 total
```

### Run Specific Test Suite
```powershell
# Run just navigation controller tests
npm test -- navigationController.test.js

# Run just search filter tests
npm test -- searchFilterBar.test.js

# Run just AppSettings tests
npm test -- appSettings.test.js
```

### Test Coverage Report
```powershell
# Generate coverage report
npm run test:coverage

# View in browser (if available)
open coverage/lcov-report/index.html
```

### Backend API Tests
```powershell
cd backend

# Run API tests
npm run test

# Run payment/email tests
npm run test-payment
```

---

## 🔧 TROUBLESHOOTING

### Port Already in Use
```powershell
# If port 3000 is already in use
# Option 1: Use different port
$env:PORT=3001
npm start

# Option 2: Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Database Locked Error
```powershell
# If you get "database is locked" error:
# SQLite doesn't support concurrent writes
# Solution: Stop the server and restart it
# Or use PostgreSQL for production

# Clear locks:
cd backend
del data/store.db
npm run seed
npm start
```

### Dependencies Not Installing
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -r node_modules
rm package-lock.json

# Reinstall
npm install
```

### Email Not Sending
```
✓ Check EMAIL_USER and EMAIL_PASSWORD in .env
✓ Verify Gmail app password (not regular password)
✓ Check firewall/antivirus not blocking SMTP
✓ Try sending test email:
  npm run test-payment
```

### Frontend Not Connecting to API
```
✓ Check backend is running: http://localhost:3000/api/health
✓ Check CORS is enabled in backend
✓ Check API URLs in appSettings
✓ Check browser console (F12) for error messages
```

### Tests Failing
```powershell
# Clear Jest cache
npx jest --clearCache

# Run specific test with verbose output
npm test -- --verbose appSettings.test.js

# Check for node_modules issues
rm -r node_modules
npm install
npm test
```

### Stripe Payments Not Working
```
✓ Check Stripe keys in .env
✓ Use test mode keys (pk_test_*, sk_test_*)
✓ Use test card: 4242 4242 4242 4242
✓ Check webhook endpoint configured
✓ View logs at: https://dashboard.stripe.com/test/logs
```

---

## 🌍 DEPLOYMENT OPTIONS

### Option 1: Heroku (Simple)
```powershell
# Install Heroku CLI
# Create app
heroku create techvault-app

# Deploy
git push heroku main

# Set environment variables
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set EMAIL_PASSWORD=your-app-password
```

### Option 2: Railway (Recommended)
```powershell
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway init
railway up
```

### Option 3: Vercel (Frontend + Serverless Backend)
```powershell
# Deploy frontend to Vercel
vercel --prod

# Deploy backend as serverless functions
# Or use Railway for backend
```

### Option 4: Self-Hosted VPS
```powershell
# 1. SSH into VPS
ssh user@your-vps.com

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone/upload project
git clone <repo>
cd TECHVAULT

# 4. Install dependencies
npm install
cd backend && npm install

# 5. Install PM2 (process manager)
npm install -g pm2

# 6. Start with PM2
pm2 start backend/server.js --name "techvault"
pm2 startup
pm2 save

# 7. Use Nginx as reverse proxy (recommended)
```

### Option 5: Docker
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN cd backend && npm install
EXPOSE 3000
CMD ["node", "backend/server.js"]
```

```powershell
# Build and run
docker build -t techvault .
docker run -p 3000:3000 -e PORT=3000 techvault
```

---

## 📊 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────┐
│        Browser (http://localhost:8000)  │
│  ┌─────────────────────────────────────┐│
│  │  HTML5 + CSS3 + Vanilla JavaScript  ││
│  │  - React-like components            ││
│  │  - LocalStorage persistence         ││
│  │  - Real-time responsiveness         ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
              │
        REST API (JSON)
              │
┌─────────────────────────────────────────┐
│  Express.js Server (Port 3000)          │
│  ┌─────────────────────────────────────┐│
│  │  15+ API Endpoints                  ││
│  │  - Product management               ││
│  │  - Order processing                 ││
│  │  - Payment handling                 ││
│  │  - User authentication              ││
│  │  - Email notifications              ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │  SQLite Database                    ││
│  │  - Products (21 items)              ││
│  │  - Orders                           ││
│  │  - Order Items                      ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
    Stripe Mailer  Crypto
   Payments Emails  Payments
```

---

## 📝 USEFUL COMMANDS

### Backend Commands
```powershell
cd backend

# Start production server
npm start

# Start development server (auto-reload)
npm run dev

# Seed database with products
npm run seed

# Run API tests
npm run test

# Run payment/email tests
npm run test-payment

# Run all backend tests
npm run test-all
```

### Frontend Commands
```powershell
cd c:\Users\NIGHTSTUDIOS\Downloads\TECHVAULT

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Serve static files (via Python)
python -m http.server 8000
```

### Database Commands
```powershell
cd backend

# Check database
node -e "const db = require('sqlite3').Database; const d = new db('./data/store.db'); d.all('SELECT COUNT(*) FROM products', (e,r) => console.log('Products:', r[0]['COUNT(*)']); d.close())"

# Reset database
rm data/store.db
npm run seed

# Backup database
cp data/store.db data/store.db.backup
```

---

## 📞 GETTING HELP

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change PORT in .env or kill process |
| Database locked | Restart server or delete db and reseed |
| Email not sending | Check credentials and app password |
| Tests failing | Clear cache: `npx jest --clearCache` |
| Stripe error | Verify test keys in .env |
| CORS error | Check CORS config in backend/server.js |
| API not responding | Check backend running on port 3000 |

### Debug Mode
```powershell
# Enable verbose logging
$env:DEBUG=*
npm run dev

# Check environment variables
$env:PORT
$env:NODE_ENV
```

---

## ✅ FINAL VERIFICATION CHECKLIST

- [ ] Node.js and npm installed
- [ ] Backend dependencies installed
- [ ] .env file configured
- [ ] Database created with 21 products
- [ ] Backend server running on :3000
- [ ] Frontend accessible on :8000
- [ ] API health check passing
- [ ] Products loading in browser
- [ ] All 389 tests passing
- [ ] No console errors

---

## 🎉 SUCCESS!

Once you've completed the setup:

✅ **Backend:** http://localhost:3000/api  
✅ **Frontend:** http://localhost:8000  
✅ **Database:** 21 products loaded  
✅ **Tests:** 389/389 passing  
✅ **Ready:** For use and deployment  

---

## 📚 Additional Resources

- **API Documentation:** [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)
- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Architecture Overview:** [FULL_FOLDER_ANALYSIS.md](FULL_FOLDER_ANALYSIS.md)
- **Full Project Checklist:** [COMPLETION_CHECKLIST.md](COMPLETION_CHECKLIST.md)

---

**Application Status:** ✅ **PRODUCTION-READY**  
**Last Updated:** May 20, 2026  
**All Systems:** Go ✅

🚀 **Ready to launch!**
