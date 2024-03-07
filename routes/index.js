// routes/index.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose(); // Подключаем пакет sqlite3
const path = require('path');

const dbPath = path.resolve(__dirname, '../data.db'); // Путь к файлу базы данных SQLite

module.exports = function(passport) {
    // GET запрос для страницы входа
    router.get('/login', (req, res) => {
        res.render('login'); // Здесь 'login' - это имя вашего шаблона страницы входа
    });

    // POST запрос для входа пользователя
    router.post('/login', passport.authenticate('local', {
        successRedirect: '/', // Куда перенаправлять в случае успешного входа
        failureRedirect: '/login', // Куда перенаправлять в случае неудачи
        failureFlash: true
    }));

    // GET запрос для страницы регистрации
    router.get('/register', (req, res) => {
        res.render('register'); // Здесь 'register' - это имя вашего шаблона страницы регистрации
    });

    // POST запрос для регистрации пользователя
    router.post('/register', async (req, res) => {
        try {
            const username = req.body.username;
            const password = req.body.password;

            // Хешируем пароль
            const hashedPassword = await bcrypt.hash(password, 10);

            // Открываем соединение с базой данных SQLite
            const db = new sqlite3.Database(dbPath);

            // Проверяем, существует ли пользователь с таким же именем
            db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
                if (err) {
                    console.error('Error registering user:', err.message);
                    req.flash('error', 'An error occurred during registration');
                    res.redirect('/register');
                    return;
                }

                if (row) {
                    // Пользователь с таким именем уже существует
                    req.flash('error', 'Username already exists');
                    res.redirect('/register');
                } else {
                    // Вставляем нового пользователя в базу данных SQLite
                    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
                        if (err) {
                            console.error('Error registering user:', err.message);
                            req.flash('error', 'An error occurred during registration');
                            res.redirect('/register');
                        } else {
                            console.log('User registered successfully');
                            req.flash('success', 'User registered successfully');
                            res.redirect('/login');
                        }
                    });
                }
            });

            // Закрываем соединение с базой данных SQLite
            db.close();
        } catch (error) {
            console.error('Error registering user:', error);
            req.flash('error', 'An error occurred during registration');
            res.redirect('/register');
        }
    });

    return router;
};
