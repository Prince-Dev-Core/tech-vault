# Frontend-Backend Integration Guide

Complete guide to connect your HTML frontend with the Node.js backend.

## 📋 Overview

Your frontend (HTML/CSS/JS) needs to communicate with the backend API to:
1. Load products from database
2. Create orders
3. Process payments
4. Track orders

## 🔧 Integration Steps

### Step 1: Update API URL

In your HTML file, add this at the top of the `<script>` section:

```javascript
// API Configuration
const API_URL = 'http://localhost:3000/api';  // For local development
// const API_URL = 'https://your-backend.vercel.app/api';  // For production
```

### Step 2: Load Products from Backend

Replace the hardcoded products array with API call:

**Before (hardcoded):**
```javascript
const products = [
  { id: 1, name: "Quantum X1 Pro Laptop", ... },
  { id: 2, name: "Nebula Phone 15 Ultra", ... },
  // ... more products
];
```

**After (from API):**
```javascript
let products = [];

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    const result = await response.json();
    
    if (result.success) {
      products = result.data;
      renderProducts();
    } else {
      console.error('Failed to load products:', result.error);
      showToast('Failed to load products');
    }
  } catch (error) {
    console.error('Error loading products:', error);
    showToast('Error loading products');
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCartFromStorage();
});
```

### Step 3: Update Category Filtering

Update the category button click handler:

```javascript
categoryBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    categoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    
    // Load filtered products
    try {
      const url = currentCategory === 'all' 
        ? `${API_URL}/products`
        : `${API_URL}/products?category=${currentCategory}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        products = result.data;
        renderProducts();
      }
    } catch (error) {
      console.error('Error filtering products:', error);
    }
  });
});
```

### Step 4: Update Checkout Function

Replace the checkout function to create orders via API:

**Before:**
```javascript
function placeOrder() {
  closeCheckout();
  successModal.classList.add('active');
  cart = [];
  updateCart();
}
```

**After:**
```javascript
async function placeOrder() {
  try {
    // Get form data
    const customerName = document.getElementById('checkoutName').value;
    const customerEmail = document.getElementById('checkoutEmail').value;
    const shippingAddress = document.getElementById('checkoutAddress').value;
    const city = document.getElementById('checkoutCity').value;
    const zip = document.getElementById('checkoutZip').value;

    // Validate
    if (!customerName || !customerEmail || !shippingAddress || !city || !zip) {
      showToast('Please fill in all fields');
      return;
    }

    // Prepare order data
    const orderData = {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: document.getElementById('checkoutPhone')?.value || '',
      shipping_address: `${shippingAddress}, ${city}, ${zip}`,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    };

    // Show loading state
    const btn = document.getElementById('placeOrderBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    // Create order
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (result.success) {
      // Store order number
      localStorage.setItem('lastOrderNumber', result.data.order_number);

      // Close checkout modal
      closeCheckout();

      // Show success modal
      successModal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Clear cart
      cart = [];
      updateCart();

      // If Stripe session URL exists, redirect after 2 seconds
      if (result.data.stripe_session_url) {
        setTimeout(() => {
          window.location.href = result.data.stripe_session_url;
        }, 2000);
      }

      showToast('Order created successfully!');
    } else {
      showToast('Error creating order: ' + result.error);
    }

    // Restore button
    btn.innerHTML = originalText;
    btn.disabled = false;

  } catch (error) {
    console.error('Order error:', error);
    showToast('Error creating order');
    
    // Restore button
    const btn = document.getElementById('placeOrderBtn');
    btn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
    btn.disabled = false;
  }
}
```

### Step 5: Add Order Tracking (Optional)

Add a function to track orders:

```javascript
async function trackOrder(orderNumber) {
  try {
    const response = await fetch(`${API_URL}/orders/${orderNumber}`);
    const result = await response.json();

    if (result.success) {
      const order = result.data;
      console.log('Order Status:', order.status);
      console.log('Order Total:', order.total);
      console.log('Items:', order.items);
      
      // Display order details
      alert(`Order ${order.order_number}\nStatus: ${order.status}\nTotal: $${order.total}`);
    } else {
      alert('Order not found');
    }
  } catch (error) {
    console.error('Error tracking order:', error);
    alert('Error tracking order');
  }
}

// Usage: trackOrder('ORD-1234567890');
```

### Step 6: Add Phone Field to Checkout Form

Add this to your checkout form HTML:

```html
<div class="form-group">
  <label>Phone Number</label>
  <input type="tel" placeholder="+1 (555) 123-4567" id="checkoutPhone">
</div>
```

### Step 7: Update Success Modal

Add order number display to success modal:

```html
<div class="success-animation">
  <div class="success-circle"><i class="fas fa-check"></i></div>
  <h2>Order Placed!</h2>
  <p>Thank you for your purchase. Your order has been confirmed and will be shipped soon.</p>
  <p id="orderNumber" style="color: #00d4ff; font-weight: bold; margin: 1rem 0;"></p>
  <p style="font-size: 0.9rem; color: #94a3b8;">A confirmation email has been sent to your email address.</p>
  <button class="btn btn-primary" onclick="closeSuccessModal()" style="margin-top: 1rem;">Continue Shopping</button>
</div>
```

Update the success modal display:

```javascript
function closeSuccessModal() {
  successModal.classList.remove('active');
  document.body.style.overflow = '';
  
  // Display order number
  const orderNumber = localStorage.getItem('lastOrderNumber');
  if (orderNumber) {
    document.getElementById('orderNumber').textContent = `Order #${orderNumber}`;
  }
}
```

## 🧪 Testing Integration

### Test 1: Load Products
1. Open browser console (F12)
2. Check if products load from API
3. Verify product count matches database

### Test 2: Filter by Category
1. Click category buttons
2. Verify products filter correctly
3. Check API calls in Network tab

### Test 3: Create Order
1. Add items to cart
2. Click checkout
3. Fill in form
4. Click "Place Order"
5. Verify order created in database
6. Check email for confirmation

### Test 4: Track Order
```javascript
// In browser console
trackOrder('ORD-1234567890');
```

## 🔄 CORS Configuration

If you get CORS errors, the backend already has CORS enabled. Make sure:

1. Backend is running on `http://localhost:3000`
2. Frontend is running on `http://localhost:8000`
3. API_URL is set correctly

## 🚀 Production Deployment

### Update API URL for Production

```javascript
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend.vercel.app/api'
  : 'http://localhost:3000/api';
```

Or use environment variables:

```javascript
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://your-backend.vercel.app/api';
```

### Update FRONTEND_URL in Backend

When deploying, update `.env` in backend:

```
FRONTEND_URL=https://your-frontend-domain.com
```

## 📊 Complete Integration Example

Here's a complete example of the updated checkout function:

```javascript
async function placeOrder() {
  try {
    // Validate form
    const name = document.getElementById('checkoutName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const city = document.getElementById('checkoutCity').value.trim();
    const zip = document.getElementById('checkoutZip').value.trim();

    if (!name || !email || !address || !city || !zip) {
      showToast('Please fill in all required fields');
      return;
    }

    if (!email.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }

    // Prepare order
    const orderData = {
      customer_name: name,
      customer_email: email,
      customer_phone: document.getElementById('checkoutPhone')?.value || '',
      shipping_address: `${address}, ${city}, ${zip}`,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    };

    // Show loading
    const btn = document.getElementById('placeOrderBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    // Create order
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create order');
    }

    // Save order number
    localStorage.setItem('lastOrderNumber', result.data.order_number);

    // Close checkout
    closeCheckout();

    // Show success
    document.getElementById('orderNumber').textContent = `Order #${result.data.order_number}`;
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Clear cart
    cart = [];
    updateCart();

    // Redirect to Stripe if available
    if (result.data.stripe_session_url) {
      setTimeout(() => {
        window.location.href = result.data.stripe_session_url;
      }, 2000);
    }

    showToast('Order created successfully!');

  } catch (error) {
    console.error('Order error:', error);
    showToast('Error: ' + error.message);
  } finally {
    // Restore button
    const btn = document.getElementById('placeOrderBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
  }
}
```

## 🐛 Troubleshooting

### Products Not Loading
- Check if backend is running: `curl http://localhost:3000/api/products`
- Check browser console for errors
- Verify API_URL is correct
- Check CORS headers

### Order Creation Fails
- Verify all form fields are filled
- Check backend logs for errors
- Verify email configuration
- Check Stripe keys if using payments

### Email Not Sending
- Verify email credentials in .env
- Check email provider settings
- Review backend logs
- Test with different email provider

### CORS Errors
- Backend already has CORS enabled
- Verify frontend and backend URLs
- Check browser console for details

## ✅ Integration Checklist

- [ ] API_URL configured
- [ ] Products load from API
- [ ] Category filtering works
- [ ] Add to cart works
- [ ] Checkout form displays
- [ ] Order creation works
- [ ] Confirmation email received
- [ ] Success modal shows
- [ ] Cart clears after order
- [ ] Local testing complete
- [ ] Production URLs configured
- [ ] Deployed and tested

---

**Need help?** Check the backend README or specification files.

**Ready to deploy?** Update API_URL and deploy both frontend and backend.
