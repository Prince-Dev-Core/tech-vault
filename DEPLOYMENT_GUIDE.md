# 🚀 Deployment Guide

Complete guide to deploy TechVault to production.

## 📋 Production-Ready Checklist

- [ ] Backend tested locally
- [ ] Frontend tested locally
- [ ] Supabase connection verified
- [ ] Email configured
- [ ] Exodus Wallet addresses verified
- [ ] Supabase RLS policies configured
- [ ] Frontend-backend integration complete
- [ ] No console errors
- [ ] All forms validated

## 🌐 Deployment Options

### Option 1: Railway (Recommended for Backend)

**Pros:**
- Excellent for Node.js applications
- Generous free tier for small projects
- Easy environment variable management
- Automatic deployments from GitHub
- Good for persistent services (unlike serverless functions)

**Time:** 15 minutes

#### Step 1: Prepare Backend

```powershell
cd backend
npm install
 # Ensure your .env is configured for production (e.g., SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, EXODUS_BTC_ADDRESS, etc.)
```

#### Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

#### Step 3: Deploy Backend

```bash
npm install -g vercel
vercel deploy
```

Follow prompts:
- Project name: `techvault-backend`
- Framework: `Other`
- Root directory: `./`

#### Step 4: Set Environment Variables

In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add:
   ```
   SMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   FRONTEND_URL=https://your-frontend-domain.com
   NODE_ENV=production
   ```

#### Step 5: Deploy Frontend

1. Push frontend to GitHub
2. Go to Vercel dashboard
3. Click "New Project"
4. Select your frontend repo
5. Deploy

#### Step 6: Update API URL

In your HTML file:
```javascript
const API_URL = 'https://techvault-backend.vercel.app/api';
```

---

### Option 2: Railway (Good for Databases)

**Pros:**
- Good SQLite support
- Free tier available
- Easy database management

**Time:** 15 minutes

#### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway

#### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub"
3. Select your backend repo

#### Step 3: Configure Environment

1. Go to Variables
2. Add environment variables:
   ```
   STRIPE_SECRET_KEY=sk_live_your_key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   FRONTEND_URL=https://your-frontend-domain.com
   NODE_ENV=production
   ```

#### Step 4: Deploy

Railway auto-deploys on push to main branch

#### Step 5: Get Backend URL

1. Go to Deployments
2. Copy the URL
3. Update frontend API_URL

---

### Option 3: Self-Hosted VPS

**Pros:**
- Full control
- Cheap ($5-10/month)
- Scalable

**Time:** 30 minutes

#### Step 1: Rent VPS

Options:
- DigitalOcean ($5/month)
- Linode ($5/month)
- AWS EC2 (free tier)
- Hetzner ($3/month)

#### Step 2: Connect to VPS

```bash
ssh root@your-vps-ip
```

#### Step 3: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 4: Clone Repository

```bash
git clone https://github.com/your-username/techvault.git
cd techvault/backend
```

#### Step 5: Install Dependencies

```bash
npm install --production
```

#### Step 6: Configure Environment

```bash
nano .env
```

Add production values:
```
PORT=3000
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_your_key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=https://your-frontend-domain.com
```

#### Step 7: Install PM2

```bash
sudo npm install -g pm2
```

#### Step 8: Start Server

```bash
pm2 start server.js --name "techvault"
pm2 save
pm2 startup
```

#### Step 9: Setup Nginx Reverse Proxy

```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

#### Step 10: Setup SSL Certificate

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔐 Production Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Database backed up
- [ ] Error logging enabled
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Secrets not in code
- [ ] Database indexed
- [ ] Monitoring enabled

## 📊 Production Environment Variables

```env
# Server
PORT=3000
NODE_ENV=production

# Stripe
STRIPE_SECRET_KEY=sk_live_your_production_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# URLs
FRONTEND_URL=https://your-frontend-domain.com

# Database
DATABASE_PATH=/var/data/store.db
```

## 🔄 Continuous Deployment

### GitHub Actions (Auto-Deploy)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test
      - name: Deploy to Vercel
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 📈 Monitoring & Logging

### Setup Error Tracking

**Option 1: Sentry (Free)**

```bash
npm install @sentry/node
```

In server.js:
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

**Option 2: LogRocket (Free)**

```bash
npm install logrocket
```

### Monitor Performance

- Vercel Analytics (built-in)
- Railway Metrics (built-in)
- Google Analytics (frontend)

## 🔄 Database Backup

### Automated Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp ./data/store.db $BACKUP_DIR/store_$TIMESTAMP.db
# Keep only last 7 days
find $BACKUP_DIR -name "store_*.db" -mtime +7 -delete
EOF

chmod +x backup.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## 🧪 Post-Deployment Testing

### Test 1: Health Check
```bash
curl https://your-backend-domain.com/api/health
```

### Test 2: Load Products
```bash
curl https://your-backend-domain.com/api/products
```

### Test 3: Create Test Order
```bash
curl -X POST https://your-backend-domain.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "shipping_address": "123 Test St",
    "items": [{"product_id": 1, "quantity": 1}]
  }'
```

### Test 4: Full User Flow
1. Visit frontend
2. Browse products
3. Add to cart
4. Checkout
5. Verify order created
6. Check email

## 📊 Performance Optimization

### Frontend
- Minify CSS/JS
- Compress images
- Enable caching
- Use CDN

### Backend
- Enable gzip compression
- Add database indexes
- Cache responses
- Use connection pooling

### Database
- Regular backups
- Index optimization
- Query optimization
- Cleanup old data

## 🚨 Troubleshooting

### Backend Not Responding
```bash
# Check if running
pm2 list

# View logs
pm2 logs techvault

# Restart
pm2 restart techvault
```

### Database Issues
```bash
# Check database
sqlite3 data/store.db ".tables"

# Backup and restore
cp data/store.db data/store.db.backup
```

### Email Not Sending
- Verify credentials
- Check email provider
- Review logs
- Test with different provider

### Stripe Errors
- Verify API keys
- Check webhook configuration
- Review Stripe dashboard
- Test with test cards

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables ready
- [ ] Database backed up
- [ ] API keys obtained

### Deployment
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] Domain configured

### Post-Deployment
- [ ] Health check passes
- [ ] Products load
- [ ] Orders can be created
- [ ] Emails send
- [ ] Monitoring enabled
- [ ] Backups configured

## 🎉 You're Live!

Your TechVault store is now live in production!

### Next Steps
1. Monitor for errors
2. Track user activity
3. Optimize performance
4. Plan scaling
5. Add features

### Support
- Check logs regularly
- Monitor error tracking
- Review analytics
- Backup database
- Update dependencies

---

**Deployment complete!** 🚀

Your store is now live and ready for customers.
