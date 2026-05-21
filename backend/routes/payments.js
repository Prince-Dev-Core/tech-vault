const express = require('express');
const router = express.Router();
const db = require('../config/database');
const stripe = require('../config/stripe');

// POST Stripe webhook
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.json({ received: true });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { orderId, orderNumber } = session.metadata;

      // Update order status
      db.run(
        'UPDATE orders SET status = ?, stripe_payment_id = ? WHERE id = ?',
        ['completed', session.payment_intent, orderId],
        (err) => {
          if (err) console.error('Update error:', err);
          else console.log('✅ Order updated:', orderNumber);
        }
      );
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
