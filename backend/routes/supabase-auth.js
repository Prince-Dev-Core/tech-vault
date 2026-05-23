const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

// Middleware to verify JWT token from Supabase
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Sign Up Route
router.post('/signup', async (req, res) => {
    try {
        const { email, password, fullName, username } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Sign up with Supabase Auth
        const { data: { user }, error: signUpError } = await supabase.auth.signUpWithPassword({
            email,
            password
        });

        if (signUpError) {
            return res.status(400).json({ error: signUpError.message });
        }

        // Create user profile in public.users table
        const { error: profileError } = await supabase
            .from('users')
            .insert([
                {
                    id: user.id,
                    email: user.email,
                    full_name: fullName || username || '',
                    created_at: new Date().toISOString()
                }
            ]);

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // User was created in auth, but profile failed - this is not critical
        }

        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (sessionError) {
            return res.status(400).json({ error: sessionError.message });
        }

        res.status(201).json({
            message: 'User created successfully',
            token: session.access_token,
            user: {
                id: user.id,
                email: user.email,
                fullName: fullName || username || ''
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        
        // Use email if provided, otherwise try username (though Supabase auth uses email)
        const loginEmail = email || username;

        if (!loginEmail || !password) {
            return res.status(400).json({ error: 'Email/username and password are required' });
        }

        // Sign in with Supabase Auth
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        // Get user profile
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        res.json({
            message: 'Login successful',
            token: session.access_token,
            user: {
                id: session.user.id,
                email: session.user.email,
                fullName: userProfile?.full_name || ''
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get User Profile Route (Protected)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const { data: userProfile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        res.json({
            user: {
                id: userProfile.id,
                email: userProfile.email,
                fullName: userProfile.full_name,
                createdAt: userProfile.created_at
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update User Profile Route (Protected)
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { fullName, email } = req.body;

        const { error } = await supabase
            .from('users')
            .update({
                full_name: fullName || '',
                email: email || req.user.email,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.user.id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout Route (Client-side token removal)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});

module.exports = { router, authenticateToken };
