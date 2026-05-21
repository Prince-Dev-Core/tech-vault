const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { calculateCryptoAmount, generatePaymentInstructions } = require('../config/cryptoPayments');
const { sendOrderConfirmationEmail } = require('../config/email');
const { generateOrderNumber, validateRequiredFields } = require('../utils/helpers');

// POST create order
router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, shipping_address, items } = req.body;

    // Validate input
    if (!validateRequiredFields(req.body, ['customer_name', 'customer_email', 'shipping_address', 'payment_currency']) || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Calculate total and prepare line items
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM products WHERE id = ?', [item.product_id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!product) {
        return res.status(404).json({ success: false, error: `Product ${item.product_id} not found` });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order in database
    const orderId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, total, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderNumber, customer_name, customer_email, customer_phone || '', shipping_address, total, 'pending'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Insert order items
    for (const item of orderItems) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Create cryptocurrency payment instructions
    let cryptoPaymentInfo = null;
    const selectedCurrency = req.body.payment_currency || 'BTC'; 
    
    try {
      // Calculate cryptocurrency amount based on USD total
      const cryptoAmount = await calculateCryptoAmount(total, selectedCurrency);
      const walletAddress = process.env[`EXODUS_${selectedCurrency}_ADDRESS`];
      
      if (walletAddress) {
        cryptoPaymentInfo = generatePaymentInstructions(selectedCurrency, cryptoAmount, walletAddress);

        // Update the order with cryptocurrency payment info
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE orders SET crypto_currency = ?, crypto_amount = ?, crypto_address = ? WHERE id = ?`,
            [selectedCurrency, cryptoAmount, walletAddress, orderId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    } catch (cryptoError) {
      console.error('Cryptocurrency payment error:', cryptoError);
      // Continue without crypto payment info for testing
    }

    // Send confirmation email
    await sendOrderConfirmationEmail(
      { order_number: orderNumber, customer_email, shipping_address, total },
      orderItems
    );

res.json({
       success: true,
       data: {
         order_id: orderId,
         order_number: orderNumber,
         total: total,
         crypto_amount: cryptoPaymentInfo.amount,
         wallet_address: cryptoPaymentInfo.address,
         message: `Please send ${cryptoPaymentInfo.amount} ${selectedCurrency} to your TechVault Exodus address.`
       }
     });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET order details
router.get('/:orderNumber', (req, res) => {
  db.get('SELECT * FROM orders WHERE order_number = ?', [req.params.orderNumber], (err, order) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id], (err, items) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, data: { ...order, items } });
    });
  });
});

module.exports = router;
