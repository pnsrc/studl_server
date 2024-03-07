const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

// User model - Replace this with your actual user model
const User = require('../models/User');

// Login
router.get('/login', (req, res) => {
    
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

// Register
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Create a new user and save it to the database
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword
        });
        await newUser.save();
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
});
// Маршрут для профиля
router.get('/profile', (req, res) => {
    const successMessage = req.flash('successMessage');
    res.render('profile', { successMessage }); // Передача successMessage в представление
});
// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
