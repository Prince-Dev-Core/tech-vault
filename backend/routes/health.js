const express = require('express');
const router = express.Router();

// Health check
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

module.exports = router;
