const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all products
router.get('/', (req, res) => {
  const category = req.query.category;
  let query = 'SELECT * FROM products WHERE stock > 0';
  
  if (category && category !== 'all') {
    query += ` AND category = '${category}'`;
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: rows || [] });
  });
});

// GET single product
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: row });
  });
});

module.exports = router;
