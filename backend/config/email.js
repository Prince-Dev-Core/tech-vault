const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Helper function to send email
async function sendOrderConfirmationEmail(order, items) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@techvault.com',
    to: order.customer_email,
    subject: `Order Confirmation - ${order.order_number}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00d4ff;">Thank you for your order!</h2>
        <p>Order Number: <strong>${order.order_number}</strong></p>
        <p>Shipping to: ${order.shipping_address}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
          </tr>
          ${itemsHtml}
        </table>
        
        <h3 style="color: #00d4ff;">Order Total: $${order.total.toFixed(2)}</h3>
        <p>We'll send you a tracking number as soon as your order ships.</p>
        <p style="color: #666; font-size: 12px;">Thank you for shopping at TechVault!</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Confirmation email sent to:', order.customer_email);
  } catch (error) {
    console.error('❌ Email error:', error);
  }
}

module.exports = {
  transporter,
  sendOrderConfirmationEmail
};
