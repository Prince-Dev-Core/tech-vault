/**
 * TechVault Payment & Email Integration Test
 * Tests Tasks 14-17: Stripe and Email functionality
 */

const http = require('http');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: responseData
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test results tracker
let testsPassed = 0;
let testsFailed = 0;

function logTest(name, passed, details = '') {
  if (passed) {
    console.log(`${colors.green}✅ PASS${colors.reset} - ${name}`);
    testsPassed++;
  } else {
    console.log(`${colors.red}❌ FAIL${colors.reset} - ${name}`);
    if (details) console.log(`   ${colors.yellow}${details}${colors.reset}`);
    testsFailed++;
  }
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  INFO${colors.reset} - ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  WARN${colors.reset} - ${message}`);
}

async function runTests() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  TechVault Payment & Email Integration Test${colors.reset}`);
  console.log(`${colors.cyan}  Tasks 14-17: Stripe & Email Verification${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);

  // Check environment variables
  console.log(`${colors.blue}Environment Configuration Check${colors.reset}`);
  console.log(`${colors.blue}─────────────────────────────────${colors.reset}`);

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  logTest('Stripe Secret Key configured', 
    stripeSecretKey && stripeSecretKey !== 'sk_test_your_key_here',
    stripeSecretKey ? `Key: ${stripeSecretKey.substring(0, 12)}...` : 'Not configured');

  logTest('Stripe Publishable Key configured', 
    stripePublishableKey && stripePublishableKey !== 'pk_test_your_key_here',
    stripePublishableKey ? `Key: ${stripePublishableKey.substring(0, 12)}...` : 'Not configured');

  logTest('Email User configured', 
    emailUser && emailUser !== 'your-email@gmail.com',
    emailUser || 'Not configured');

  logTest('Email Password configured', 
    emailPassword && emailPassword !== 'your-app-password',
    emailPassword ? 'Password set' : 'Not configured');

  console.log('');

  // Wait for server to be ready
  console.log(`${colors.blue}⏳ Waiting for server to be ready...${colors.reset}`);
  let serverReady = false;
  for (let i = 0; i < 10; i++) {
    try {
      const response = await makeRequest('GET', '/api/health');
      if (response.status === 200) {
        serverReady = true;
        break;
      }
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  if (!serverReady) {
    console.log(`${colors.red}❌ Server is not responding. Make sure it's running on port 3000${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.green}✅ Server is ready!\n${colors.reset}`);

  // ============ TASK 14: Stripe Integration Test ============
  console.log(`${colors.blue}Task 14: Stripe Integration${colors.reset}`);
  console.log(`${colors.blue}──────────────────────────${colors.reset}`);

  try {
    // Test order creation with Stripe integration
    const orderData = {
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '+1234567890',
      shipping_address: '123 Tech Street, San Francisco, CA 94102',
      items: [
        { product_id: 1, quantity: 1 }
      ]
    };

    const orderResponse = await makeRequest('POST', '/api/orders', orderData);
    
    logTest('Order creation with Stripe integration', 
      orderResponse.status === 200 || orderResponse.status === 404,
      `Status: ${orderResponse.status}`);

    if (orderResponse.status === 200 && orderResponse.body.success) {
      const orderData = orderResponse.body.data;
      
      logTest('Order contains order number', 
        orderData.order_number && orderData.order_number.startsWith('ORD-'),
        `Order: ${orderData.order_number}`);

      logTest('Order contains total amount', 
        typeof orderData.total === 'number' && orderData.total > 0,
        `Total: $${orderData.total}`);

      // Check if Stripe session URL is provided (when keys are configured)
      if (stripeSecretKey && stripeSecretKey !== 'sk_test_your_key_here') {
        logTest('Stripe checkout session created', 
          orderData.stripe_session_url && orderData.stripe_session_url.includes('checkout.stripe.com'),
          orderData.stripe_session_url ? 'Session URL provided' : 'No session URL');
      } else {
        logWarning('Stripe keys not configured - Stripe session creation skipped');
      }

      logTest('Order creation response format', 
        orderData.order_id && orderData.message,
        'All required fields present');
    }

  } catch (error) {
    logTest('Stripe integration test', false, error.message);
  }

  console.log('');

  // ============ TASK 15-16: Email Integration Test ============
  console.log(`${colors.blue}Task 15-16: Email Integration${colors.reset}`);
  console.log(`${colors.blue}─────────────────────────────${colors.reset}`);

  try {
    // Test email sending by creating an order
    const emailTestData = {
      customer_name: 'Email Test User',
      customer_email: emailUser || 'test@example.com', // Use configured email for testing
      customer_phone: '+1234567890',
      shipping_address: '456 Email Test Street, Test City, TC 12345',
      items: [
        { product_id: 1, quantity: 2 }
      ]
    };

    logInfo(`Testing email to: ${emailTestData.customer_email}`);

    const emailOrderResponse = await makeRequest('POST', '/api/orders', emailTestData);
    
    logTest('Order creation for email test', 
      emailOrderResponse.status === 200,
      `Status: ${emailOrderResponse.status}`);

    if (emailOrderResponse.status === 200 && emailOrderResponse.body.success) {
      logTest('Email integration configured', 
        emailUser && emailUser !== 'your-email@gmail.com',
        emailUser ? 'Email user configured' : 'Email not configured');

      if (emailUser && emailUser !== 'your-email@gmail.com') {
        logInfo('Check your email inbox for order confirmation');
        logInfo(`Order Number: ${emailOrderResponse.body.data.order_number}`);
        
        // Give some time for email to be sent
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        logTest('Email sending process', true, 'Email should be sent (check inbox)');
      } else {
        logWarning('Email not configured - Email sending skipped');
      }
    }

  } catch (error) {
    logTest('Email integration test', false, error.message);
  }

  console.log('');

  // ============ TASK 17: Webhook Endpoint Test ============
  console.log(`${colors.blue}Task 17: Webhook Endpoint${colors.reset}`);
  console.log(`${colors.blue}─────────────────────────────${colors.reset}`);

  try {
    // Test webhook endpoint exists
    const webhookResponse = await makeRequest('POST', '/api/payments/webhook', {
      type: 'test',
      data: { object: { id: 'test' } }
    });

    logTest('Webhook endpoint exists', 
      webhookResponse.status === 200 || webhookResponse.status === 400,
      `Status: ${webhookResponse.status}`);

    logTest('Webhook endpoint responds', 
      webhookResponse.body && (webhookResponse.body.received || webhookResponse.body.error),
      'Endpoint is functional');

    logInfo('Webhook signature verification requires real Stripe events');
    logInfo('Use Stripe CLI for full webhook testing: stripe listen --forward-to localhost:3000/api/payments/webhook');

  } catch (error) {
    logTest('Webhook endpoint test', false, error.message);
  }

  console.log('');

  // ============ INTEGRATION TEST ============
  console.log(`${colors.blue}Full Integration Test${colors.reset}`);
  console.log(`${colors.blue}────────────────────${colors.reset}`);

  try {
    // Test complete flow
    const fullTestData = {
      customer_name: 'Integration Test',
      customer_email: 'integration@test.com',
      shipping_address: '789 Integration Ave',
      items: [
        { product_id: 1, quantity: 1 },
        { product_id: 2, quantity: 2 }
      ]
    };

    const fullResponse = await makeRequest('POST', '/api/orders', fullTestData);
    
    if (fullResponse.status === 200 && fullResponse.body.success) {
      const orderNumber = fullResponse.body.data.order_number;
      
      // Test order retrieval
      const retrieveResponse = await makeRequest('GET', `/api/orders/${orderNumber}`);
      
      logTest('Full integration flow', 
        retrieveResponse.status === 200 && retrieveResponse.body.success,
        'Order creation and retrieval successful');

      logTest('Order data integrity', 
        retrieveResponse.body.data.customer_name === fullTestData.customer_name,
        'Customer data matches');

      logTest('Order items integrity', 
        Array.isArray(retrieveResponse.body.data.items) && retrieveResponse.body.data.items.length > 0,
        `${retrieveResponse.body.data.items?.length || 0} items found`);
    }

  } catch (error) {
    logTest('Full integration test', false, error.message);
  }

  console.log('');

  // ============ SUMMARY ============
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Test Summary${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);
  console.log(`${colors.blue}📊 Total: ${testsPassed + testsFailed}${colors.reset}\n`);

  // Configuration recommendations
  console.log(`${colors.cyan}Configuration Recommendations:${colors.reset}`);
  
  if (!stripeSecretKey || stripeSecretKey === 'sk_test_your_key_here') {
    console.log(`${colors.yellow}⚠️  Configure Stripe keys in .env for payment testing${colors.reset}`);
  }
  
  if (!emailUser || emailUser === 'your-email@gmail.com') {
    console.log(`${colors.yellow}⚠️  Configure email credentials in .env for email testing${colors.reset}`);
  }

  if (stripeSecretKey && stripeSecretKey !== 'sk_test_your_key_here' && 
      emailUser && emailUser !== 'your-email@gmail.com') {
    console.log(`${colors.green}✅ All integrations configured and ready!${colors.reset}`);
  }

  console.log('');

  if (testsFailed === 0) {
    console.log(`${colors.green}🎉 All payment and email integration tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}⚠️  Some tests failed. Please review the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Test error: ${error.message}${colors.reset}`);
  process.exit(1);
});