require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const supabase = require('./config/supabase');
const { sendOrderConfirmationEmail } = require('./config/email');
const { router: authRouter } = require('./routes/auth');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000',
    'https://tech-vault-zjch.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mount auth routes
app.use('/api/auth', authRouter);

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// ============ API ROUTES ============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = supabase.from('products').select('*').gt('stock', 0);
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create order (Exodus Crypto Logic)
app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, customer_email, shipping_address, items, payment_currency } = req.body;

    if (!customer_name || !customer_email || !shipping_address || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const selectedCurrency = payment_currency || 'BTC';
    const walletAddress = process.env[`EXODUS_${selectedCurrency}_ADDRESS`];

    if (!walletAddress) {
      return res.status(400).json({ success: false, error: 'Unsupported or unconfigured payment currency' });
    }

    // Calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product } = await supabase.from('products').select('*').eq('id', item.product_id).single();
      if (!product) return res.status(404).json({ success: false, error: `Product ${item.product_id} not found` });
      
      total += product.price * item.quantity;
      orderItems.push({ product_id: product.id, name: product.name, quantity: item.quantity, price: product.price });
    }

    // Generate payment info (In real app, fetch conversion rates from an API here)
    const mockConversionRate = 0.000015; // Example BTC/USD
    const cryptoAmount = (total * mockConversionRate).toFixed(6);
    const orderNumber = `ORD-${Date.now()}`;

    // Create order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name,
        customer_email,
        shipping_address,
        total,
        status: 'pending',
        crypto_currency: selectedCurrency,
        crypto_amount: cryptoAmount,
        crypto_address: walletAddress
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert items
    const itemsToInsert = orderItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));
    await supabase.from('order_items').insert(itemsToInsert);

    // Send confirmation email
    await sendOrderConfirmationEmail(order, orderItems);

    res.json({
      success: true,
      data: {
        order_id: order.id,
        order_number: order.order_number,
        total: total,
        crypto_amount: cryptoAmount,
        wallet_address: walletAddress,
        message: `Please send ${cryptoAmount} ${selectedCurrency} to your TechVault Exodus address.`
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET order details
app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('order_number', req.params.orderNumber)
      .single();
  
    if (orderError || !order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 TechVault server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: Supabase Cloud`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8000'}`);
  console.log('\n✅ Server ready for requests\n');
});
module.exports = app;
