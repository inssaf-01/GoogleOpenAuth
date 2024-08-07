import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import passport from 'passport';
import session from 'express-session';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import cors from 'cors';
import userRoutes from './routes/users.js';
import './PassportConfig.js';

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, sameSite: 'None' }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        console.log('Google callback - user authenticated');
        res.redirect('http://localhost:3000/welcome');
    });

app.get('/auth/microsoft',
    passport.authenticate('azuread-openidconnect'));

app.get('/auth/microsoft/callback',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    (req, res) => {
        console.log('Microsoft callback - user authenticated');
        res.redirect('http://localhost:3000/welcome');
    });

app.get('/check-auth', (req, res) => {
    console.log('Checking authentication:', req.isAuthenticated());
    if (req.isAuthenticated()) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

app.get('/logout', (req, res, next) => {
    console.log('Logging out user:', req.user);
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) return next(err);
            res.clearCookie('connect.sid');
            res.sendStatus(200);
        });
    });
});

app.use('/users', userRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}

app.use((err, req, res, next) => {
    console.error('An error occurred:', err);
    res.status(500).send('Internal Server Error');
});

const options = {
    key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'localhost.pem'))
};

const server = https.createServer(options, app);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`Server started on https://localhost:${PORT}`);
});
