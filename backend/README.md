# TechVault Backend

Lightweight Node.js/Express backend for the TechVault e-commerce platform.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit `.env` with your settings:
```
PORT=3000
STRIPE_SECRET_KEY=sk_test_your_key
SENDGRID_API_KEY=SG.your_key
FRONTEND_URL=http://localhost:8000
```

### 3. Initialize Database

```bash
npm run init-products
```

This creates the SQLite database and adds 12 sample products.

### 4. Start Server

```bash
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

### Products

**GET /api/products**
- Get all products
- Query params: `category` (optional)
- Example: `/api/products?category=laptops`

**GET /api/products/:id**
- Get single product by ID

### Orders

**POST /api/orders**
- Create new order
- Body:
  ```json
  {
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890",
    "shipping_address": "123 Tech St, San Francisco, CA 94102",
    "items": [
      {"product_id": 1, "quantity": 2}
    ]
  }
  ```

**GET /api/orders/:orderNumber**
- Get order details
- Example: `/api/orders/ORD-1234567890`

### Health

**GET /api/health**
- Server health check

## Testing Endpoints

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Get Products by Category
```bash
curl http://localhost:3000/api/products?category=laptops
```

### Get Single Product
```bash
curl http://localhost:3000/api/products/1
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890",
    "shipping_address": "123 Tech St, San Francisco, CA 94102",
    "items": [
      {"product_id": 1, "quantity": 2}
    ]
  }'
```

### Get Order
```bash
curl http://localhost:3000/api/orders/ORD-1234567890
```

## Database

SQLite database stored in `data/store.db`

### Tables

- **products**: Product catalog
- **orders**: Customer orders
- **order_items**: Items in each order

### Add Products Manually

```bash
sqlite3 data/store.db
INSERT INTO products (name, description, category, price, image_url, stock) 
VALUES ('Product Name', 'Description', 'category', 99.99, 'https://...', 10);
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 3000) |
| NODE_ENV | Environment | No (default: development) |
| STRIPE_SECRET_KEY | Stripe API key | No (for payments) |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret | No (for webhooks) |
| EMAIL_USER | Email address | No (for notifications) |
| EMAIL_PASSWORD | Email password | No (for notifications) |
| FRONTEND_URL | Frontend URL | No (for redirects) |
| DATABASE_PATH | Database file path | No (default: ./data/store.db) |

## Stripe Integration

### Get API Keys

1. Go to https://stripe.com
2. Sign up for free account
3. Go to Dashboard → API Keys
4. Copy Secret Key
5. Add to `.env` as `STRIPE_SECRET_KEY`

### Test Cards

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## Email Configuration

### Using Gmail

1. Enable 2-factor authentication on Gmail
2. Generate app password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

### Using SendGrid

1. Sign up at https://sendgrid.com
2. Create API key
3. Add to `.env`:
   ```
   SENDGRID_API_KEY=SG.your_key
   ```

## Deployment

### Vercel

```bash
npm install -g vercel
vercel deploy
```

### Railway

1. Connect GitHub repo
2. Add SQLite plugin
3. Set environment variables
4. Deploy

### Self-Hosted

```bash
npm install -g pm2
pm2 start server.js --name "techvault"
pm2 save
pm2 startup
```

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or use different port
PORT=3001 npm start
```

### Database Locked
- Restart server
- Check for other connections

### Stripe Errors
- Verify API key in .env
- Check Stripe dashboard for errors

### Email Not Sending
- Verify email credentials
- Check email provider settings
- Review error logs

## Development

### Run with Auto-Reload

```bash
npm run dev
```

Requires `nodemon` (included in devDependencies)

### View Database

```bash
sqlite3 data/store.db
.tables
SELECT * FROM products;
```

## Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Configure Stripe keys
- [ ] Configure email service
- [ ] Set FRONTEND_URL
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test payment flow
- [ ] Test email notifications
- [ ] Monitor error logs

## Support

- Express.js: https://expressjs.com
- Stripe: https://stripe.com/docs
- SQLite: https://www.sqlite.org
- Node.js: https://nodejs.org

## License

MIT
