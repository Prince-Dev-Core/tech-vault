# TechVault API Testing Guide
## Tasks 5-8: Verify API Endpoints

This guide walks you through testing all 4 core API endpoints to ensure they're working correctly.

---

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Seed Sample Products
```bash
npm run seed
```

Expected output:
```
✅ Connected to SQLite database
✅ Cleared existing products
✅ Inserted: Quantum X1 Pro Laptop ($2499) - 15 in stock
✅ Inserted: Nebula Phone 15 Ultra ($1199) - 25 in stock
... (more products)
✅ Successfully seeded 12 products!
```

### 3. Start the Server
```bash
npm start
```

Expected output:
```
🚀 TechVault server running on port 3000
📝 Environment: development
💾 Database: ./data/store.db
🌐 Frontend URL: http://localhost:8000

✅ Server ready for requests
```

### 4. Run API Tests (in another terminal)
```bash
npm test
```

---

## Test Coverage

### Task 5: GET /api/products
**Endpoint:** `GET http://localhost:3000/api/products`

**Tests:**
- ✅ Returns 200 status code
- ✅ Returns success flag
- ✅ Returns data array
- ✅ Supports category query parameter
- ✅ Returns JSON format

**Example Requests:**
```bash
# Get all products
curl http://localhost:3000/api/products

# Get products by category
curl http://localhost:3000/api/products?category=laptops
curl http://localhost:3000/api/products?category=phones
curl http://localhost:3000/api/products?category=audio
curl http://localhost:3000/api/products?category=gaming
curl http://localhost:3000/api/products?category=accessories
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Quantum X1 Pro Laptop",
      "category": "laptops",
      "price": 2499,
      "description": "The ultimate powerhouse...",
      "image_url": "https://...",
      "stock": 15,
      "created_at": "2024-01-15 10:30:00"
    },
    ...
  ]
}
```

---

### Task 6: GET /api/products/:id
**Endpoint:** `GET http://localhost:3000/api/products/:id`

**Tests:**
- ✅ Returns product by ID
- ✅ Returns 404 if product not found
- ✅ Returns product details in JSON format
- ✅ Error handling for invalid IDs
- ✅ Response time < 100ms

**Example Requests:**
```bash
# Get product with ID 1
curl http://localhost:3000/api/products/1

# Get product with ID 5
curl http://localhost:3000/api/products/5

# Get non-existent product (should return 404)
curl http://localhost:3000/api/products/99999
```

**Expected Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Quantum X1 Pro Laptop",
    "category": "laptops",
    "price": 2499,
    "description": "The ultimate powerhouse...",
    "image_url": "https://...",
    "stock": 15,
    "created_at": "2024-01-15 10:30:00"
  }
}
```

**Expected Response (Not Found):**
```json
{
  "success": false,
  "error": "Product not found"
}
```

---

### Task 7: POST /api/orders
**Endpoint:** `POST http://localhost:3000/api/orders`

**Tests:**
- ✅ Accepts customer data and items
- ✅ Validates all required fields
- ✅ Calculates order total correctly
- ✅ Generates unique order number
- ✅ Stores order in database
- ✅ Stores order items in database
- ✅ Returns order details with ID
- ✅ Error handling for invalid data

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890",
    "shipping_address": "123 Tech Street, San Francisco, CA 94102",
    "items": [
      { "product_id": 1, "quantity": 2 },
      { "product_id": 3, "quantity": 1 }
    ]
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "data": {
    "order_id": 1,
    "order_number": "ORD-1705329000000",
    "total": 5297,
    "stripe_session_url": null,
    "message": "Order created successfully"
  }
}
```

**Expected Response (Validation Error):**
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

---

### Task 8: GET /api/orders/:id
**Endpoint:** `GET http://localhost:3000/api/orders/:orderNumber`

**Tests:**
- ✅ Returns order by order number
- ✅ Includes all order items
- ✅ Returns 404 if order not found
- ✅ Returns order details in JSON format
- ✅ Error handling for invalid order numbers

**Example Requests:**
```bash
# Get order details (use order number from POST response)
curl http://localhost:3000/api/orders/ORD-1705329000000

# Get non-existent order (should return 404)
curl http://localhost:3000/api/orders/INVALID-ORDER-123
```

**Expected Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "ORD-1705329000000",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890",
    "shipping_address": "123 Tech Street, San Francisco, CA 94102",
    "total": 5297,
    "status": "pending",
    "stripe_payment_id": null,
    "created_at": "2024-01-15 10:30:00",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 2,
        "price": 2499
      },
      {
        "id": 2,
        "order_id": 1,
        "product_id": 3,
        "quantity": 1,
        "price": 399
      }
    ]
  }
}
```

**Expected Response (Not Found):**
```json
{
  "success": false,
  "error": "Order not found"
}
```

---

## Manual Testing with cURL

### Test All Endpoints Manually

```bash
# 1. Get all products
echo "=== Task 5: GET /api/products ==="
curl -s http://localhost:3000/api/products | jq .

# 2. Get products by category
echo "=== Task 5: GET /api/products?category=laptops ==="
curl -s http://localhost:3000/api/products?category=laptops | jq .

# 3. Get single product
echo "=== Task 6: GET /api/products/1 ==="
curl -s http://localhost:3000/api/products/1 | jq .

# 4. Create an order
echo "=== Task 7: POST /api/orders ==="
ORDER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "shipping_address": "123 Test St",
    "items": [{"product_id": 1, "quantity": 1}]
  }')
echo $ORDER_RESPONSE | jq .

# 5. Get order details
echo "=== Task 8: GET /api/orders/:id ==="
ORDER_NUMBER=$(echo $ORDER_RESPONSE | jq -r '.data.order_number')
curl -s http://localhost:3000/api/orders/$ORDER_NUMBER | jq .
```

---

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use: `lsof -i :3000`
- Ensure Node.js is installed: `node --version`
- Check .env file exists with correct DATABASE_PATH

### No products showing
- Run `npm run seed` to populate sample data
- Check database file exists: `ls -la data/store.db`

### Tests failing
- Ensure server is running on port 3000
- Check server logs for errors
- Verify database connection is working

### Email not sending
- Email is optional for basic testing
- Configure .env with EMAIL_USER and EMAIL_PASSWORD to enable
- Check Nodemailer configuration in server.js

---

## Performance Metrics

Expected response times:
- **GET /api/products**: < 500ms
- **GET /api/products/:id**: < 100ms
- **POST /api/orders**: < 1000ms
- **GET /api/orders/:id**: < 200ms

---

## Next Steps

After verifying all endpoints:
1. ✅ Tasks 5-8: API Endpoints verified
2. ⏳ Tasks 9-13: Frontend integration
3. ⏳ Tasks 14-17: Payment & email integration
4. ⏳ Tasks 18-21: Testing & optimization
5. ⏳ Tasks 22-25: Deployment

---

## Files Created

- `backend/test-api.js` - Automated API test suite
- `backend/seed-products.js` - Sample data seeding script
- `API_TESTING_GUIDE.md` - This guide

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify all dependencies are installed: `npm install`
4. Ensure database is initialized: `npm run seed`
