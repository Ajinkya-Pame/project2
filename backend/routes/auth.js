const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const router = express.Router();

const passwordValidation = (password) => {
    const minLength = 8;
    const maxLength = 20;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigits = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*]/.test(password);

    return (
        password.length >= minLength &&
        password.length <= maxLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasDigits &&
        hasSpecialChars
    );
};


// Register User Route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.render('register', { error: 'User already exists' });
        }

        if (!passwordValidation(password)) {
            return res.render('register', {
                error: 'Password must be between 8 and 20 characters and include at least one uppercase letter, one lowercase letter, one digit, and one special character.',
            });
        }

        // Create a new user without hashing the password
        user = new User({
            username,
            email,
            password, // Store the password in plain text (not recommended)
            role,
        });

        // Save user to the database
        await user.save();

        // Store user data in session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        res.redirect('/login'); // Redirect to login after successful registration
    } catch (err) {
        console.error("Registration Error:", err);
        res.render('register', { error: 'Something went wrong. Please try again.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        // Compare the plain text password
        if (user.password === password) {
            // Passwords match, store user data in session
            req.session.user = {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            };
            res.redirect('/dashboard'); // Redirect to the dashboard on success
        } else {
            // Passwords do not match
            return res.render('login', { error: 'Invalid email or password.' });
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.render('login', { error: 'Something went wrong. Please try again.' });
    }
});

  


module.exports = router;