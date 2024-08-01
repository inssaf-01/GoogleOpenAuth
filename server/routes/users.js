import { Router } from 'express';

const router = Router();

// Define a simple route
router.get('/', (req, res) => {
    res.json({ message: 'Users route' });
});

// Define the logout route
router.get('/logout', (req, res, next) => {
    console.log('Logging out user:', req.user);
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) return next(err);
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.sendStatus(200); // Send a success response
        });
    });
});

export default router;
