# TechVault Credentials Setup Guide

## Overview
This guide explains how to configure real credentials for Supabase, Stripe payments, and email functionality.

## Supabase Configuration
1. Create a project at supabase.com.
2. Go to Project Settings -> API.
3. Copy your `Project URL` and `anon public` key for the frontend.
4. Copy the `service_role` secret for the backend.
5. Add these to your `.env` file (see below).

## Stripe Configuration

### Step 1: Get Stripe API Keys
1. Go to [https://stripe.com](https://stripe.com) and sign up/log in
2. Navigate to Developers → API keys
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
4. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
5. For webhook testing, you'll need to:
   - Install Stripe CLI: `npm install -g stripe`
   - Run: `stripe listen --forward-to localhost:3000/api/payments/webhook`
   - Copy the webhook secret that starts with `whsec_`

### Step 2: Update .env File
Edit `backend/.env` and replace the placeholder values:

```env
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret

# Cryptocurrency Wallets (Exodus)
EXODUS_BTC_ADDRESS=bc1qcx5vruks2d5mn86cpwuw96xt9k4q56q6s0xpax
EXODUS_ETH_ADDRESS=0x7BAd4Ea684C70240f2d78491F013cFf40E650d81
EXODUS_SOL_ADDRESS=4Kxsezt1rZMfwN4wVDuknz7nsJEAzhnjjyZ2onVNPWcT
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

## Email Configuration (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account → Security
2. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to Google Account → Security → App passwords
2. Select "Mail" as the app and "Windows Computer" as the device (or Other)
3. Click "Generate" and copy the 16-character password

### Step 3: Update .env File
Edit `backend/.env` and replace the placeholder values:

```env
# Email (Gmail App Password)
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

## Alternative Email Services
If you prefer not to use Gmail, you can configure other SMTP services by modifying the nodemailer configuration in `backend/utils/email.js`.

## Testing Your Configuration

### Test Stripe Integration
```bash
cd backend
npm run test-payment
```

### Test Full System
1. Start the server: `npm start`
2. Visit `http://localhost:8000` (or serve public/ directory)
3. Browse products, add to cart, and checkout
4. Check that orders are created in the database
5. Verify emails are sent (check your inbox)

## Security Notes
- Never commit your `.env` file to version control
- Use environment variables in production
- Consider using a secrets manager for production deployments
- For live payments, use live keys from your Stripe dashboard

## Troubleshooting

### Common Stripe Issues
- "Invalid API Key": Check your secret key is correct
- "Webhook signature verification failed": Ensure webhook secret matches
- "Currency not supported": Verify your Stripe account supports USD

### Common Email Issues
- "Authentication failed": Verify app password is correct
- "Connection refused": Check if your network allows SMTP connections
- "Rate limited": Google may block sign-in attempts; check security alerts

## Production Recommendations
1. Use live Stripe keys (not test keys) for production
2. Use a dedicated email service (SendGrid, Mailgun, etc.) for better deliverability
3. Set up proper domain authentication for email (SPF, DKIM, DMARC)
4. Monitor Stripe dashboard for payments and disputes
5. Set up error logging and notifications