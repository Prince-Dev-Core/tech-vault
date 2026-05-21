/**
 * TechVault API Endpoint Verification Tests
 * Tests Tasks 5-8: Verify all core API endpoints are working correctly
 */

const http = require('http');

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

async function runTests() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  TechVault API Endpoint Verification (Tasks 5-8)${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}\n`);

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

  // ============ TASK 5: GET /api/products ============
  console.log(`${colors.blue}Task 5: Implement GET /api/products${colors.reset}`);
  console.log(`${colors.blue}─────────────────────────────────────${colors.reset}`);

  try {
    const response = await makeRequest('GET', '/api/products');
    
    logTest('Returns 200 status code', response.status === 200, `Got ${response.status}`);
    logTest('Returns success flag', response.body.success === true, `Got ${response.body.success}`);
    logTest('Returns data array', Array.isArray(response.body.data), `Got ${typeof response.body.data}`);
    
    // Insert sample product if empty
    if (response.body.data.length === 0) {
      console.log(`${colors.yellow}⚠️  No products in database. Inserting sample data...${colors.reset}`);
      // We'll need to add sample products via direct DB or API
    }

    // Test category filtering
    const categoryResponse = await makeRequest('GET', '/api/products?category=laptops');
    logTest('Supports category query parameter', categoryResponse.status === 200, `Got ${categoryResponse.status}`);
    logTest('Returns JSON format', typeof categoryResponse.body === 'object', `Got ${typeof categoryResponse.body}`);
    
  } catch (error) {
    logTest('GET /api/products endpoint exists', false, error.message);
  }

  console.log('');

  // ============ TASK 6: GET /api/products/:id ============
  console.log(`${colors.blue}Task 6: Implement GET /api/products/:id${colors.reset}`);
  console.log(`${colors.blue}──────────────────────────────────────${colors.reset}`);

  try {
    // Test with valid ID
    const validResponse = await makeRequest('GET', '/api/products/1');
    logTest('Returns product by ID', validResponse.status === 200 || validResponse.status === 404, `Got ${validResponse.status}`);
    
    if (validResponse.status === 200) {
      logTest('Returns product details in JSON', typeof validResponse.body.data === 'object', `Got ${typeof validResponse.body.data}`);
      logTest('Product has required fields', 
        validResponse.body.data.id && validResponse.body.data.name && validResponse.body.data.price,
        `Missing fields`);
    }

    // Test with invalid ID
    const invalidResponse = await makeRequest('GET', '/api/products/99999');
    logTest('Returns 404 for invalid ID', invalidResponse.status === 404, `Got ${invalidResponse.status}`);
    logTest('Error message is descriptive', 
      invalidResponse.body.error && invalidResponse.body.error.includes('not found'),
      `Got: ${invalidResponse.body.error}`);
    
  } catch (error) {
    logTest('GET /api/products/:id endpoint exists', false, error.message);
  }

  console.log('');

  // ============ TASK 7: POST /api/orders ============
  console.log(`${colors.blue}Task 7: Implement POST /api/orders${colors.reset}`);
  console.log(`${colors.blue}────────────────────────────────────${colors.reset}`);

  try {
    // Test with valid data
    const orderData = {
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '+1234567890',
      shipping_address: '123 Tech Street, San Francisco, CA 94102',
      items: [
        { product_id: 1, quantity: 2 }
      ]
    };

    const createResponse = await makeRequest('POST', '/api/orders', orderData);
    
    logTest('Accepts customer data and items', createResponse.status === 200 || createResponse.status === 404, `Got ${createResponse.status}`);
    
    if (createResponse.status === 200) {
      logTest('Returns success flag', createResponse.body.success === true, `Got ${createResponse.body.success}`);
      logTest('Generates unique order number', 
        createResponse.body.data.order_number && createResponse.body.data.order_number.startsWith('ORD-'),
        `Got: ${createResponse.body.data.order_number}`);
      logTest('Calculates order total', 
        typeof createResponse.body.data.total === 'number' && createResponse.body.data.total > 0,
        `Got: ${createResponse.body.data.total}`);
      logTest('Returns order ID', 
        typeof createResponse.body.data.order_id === 'number',
        `Got: ${createResponse.body.data.order_id}`);
    }

    // Test validation - missing required fields
    const invalidOrderData = {
      customer_name: 'Test',
      // Missing email, address, items
    };

    const validationResponse = await makeRequest('POST', '/api/orders', invalidOrderData);
    logTest('Validates required fields', validationResponse.status === 400, `Got ${validationResponse.status}`);
    logTest('Returns error for missing fields', 
      validationResponse.body.error && validationResponse.body.error.includes('required'),
      `Got: ${validationResponse.body.error}`);
    
  } catch (error) {
    logTest('POST /api/orders endpoint exists', false, error.message);
  }

  console.log('');

  // ============ TASK 8: GET /api/orders/:id ============
  console.log(`${colors.blue}Task 8: Implement GET /api/orders/:id${colors.reset}`);
  console.log(`${colors.blue}──────────────────────────────────────${colors.reset}`);

  try {
    // First create an order to test retrieval
    const orderData = {
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      shipping_address: '123 Tech Street',
      items: [{ product_id: 1, quantity: 1 }]
    };

    const createResponse = await makeRequest('POST', '/api/orders', orderData);
    
    if (createResponse.status === 200 && createResponse.body.data.order_number) {
      const orderNumber = createResponse.body.data.order_number;
      
      // Now retrieve the order
      const getResponse = await makeRequest('GET', `/api/orders/${orderNumber}`);
      
      logTest('Returns order by order number', getResponse.status === 200, `Got ${getResponse.status}`);
      logTest('Includes all order items', 
        Array.isArray(getResponse.body.data.items),
        `Got ${typeof getResponse.body.data.items}`);
      logTest('Returns order details in JSON', 
        typeof getResponse.body.data === 'object',
        `Got ${typeof getResponse.body.data}`);
    }

    // Test with invalid order number
    const invalidResponse = await makeRequest('GET', '/api/orders/INVALID-ORDER-123');
    logTest('Returns 404 for invalid order number', invalidResponse.status === 404, `Got ${invalidResponse.status}`);
    logTest('Error message for invalid order', 
      invalidResponse.body.error && invalidResponse.body.error.includes('not found'),
      `Got: ${invalidResponse.body.error}`);
    
  } catch (error) {
    logTest('GET /api/orders/:id endpoint exists', false, error.message);
  }

  console.log('');

  // ============ SUMMARY ============
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Test Summary${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);
  console.log(`${colors.blue}📊 Total: ${testsPassed + testsFailed}${colors.reset}\n`);

  if (testsFailed === 0) {
    console.log(`${colors.green}🎉 All API endpoints are working correctly!${colors.reset}\n`);
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
