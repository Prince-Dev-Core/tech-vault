// Generate unique order number
function generateOrderNumber() {
  return `ORD-${Date.now()}`;
}

// Format price to 2 decimal places
function formatPrice(price) {
  return parseFloat(price).toFixed(2);
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate required fields
function validateRequiredFields(obj, fields) {
  for (const field of fields) {
    if (!obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')) {
      return false;
    }
  }
  return true;
}

module.exports = {
  generateOrderNumber,
  formatPrice,
  isValidEmail,
  validateRequiredFields
};
