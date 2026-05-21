const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();

// Database connection
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/store.db');
const db = new sqlite3.Database(dbPath);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Create users table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Sign Up Route
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert user into database
        db.run(
            `INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)`,
            [username, email, passwordHash, fullName || ''],
            function(err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT') {
                        return res.status(409).json({ error: 'Username or email already exists' });
                    }
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: this.lastID, username, email },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.status(201).json({
                    message: 'User created successfully',
                    token,
                    user: {
                        id: this.lastID,
                        username,
                        email,
                        fullName: fullName || ''
                    }
                });
            }
        );
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login Route
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user in database
        db.get(
            `SELECT * FROM users WHERE username = ? OR email = ?`,
            [username, username],
            async (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (!user) {
                    return res.status(401).json({ error: 'Invalid username or password' });
                }

                // Verify password
                const isValidPassword = await bcrypt.compare(password, user.password_hash);
                if (!isValidPassword) {
                    return res.status(401).json({ error: 'Invalid username or password' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: user.id, username: user.username, email: user.email },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.json({
                    message: 'Login successful',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        fullName: user.full_name
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get User Profile Route (Protected)
router.get('/profile', authenticateToken, (req, res) => {
    db.get(
        `SELECT id, username, email, full_name, created_at FROM users WHERE id = ?`,
        [req.user.userId],
        (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.full_name,
                    createdAt: user.created_at
                }
            });
        }
    );
});

// Update User Profile Route (Protected)
router.put('/profile', authenticateToken, (req, res) => {
    const { fullName, email } = req.body;

    db.run(
        `UPDATE users SET full_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [fullName || '', email, req.user.userId],
        function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ error: 'Email already exists' });
                }
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({ message: 'Profile updated successfully' });
        }
    );
});

// Logout Route (Client-side token removal)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});

// Export the router and middleware
module.exports = { router, authenticateToken };