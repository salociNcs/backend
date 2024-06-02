const express = require('express');
const router = express.Router();
const { register, login, getUser, verifyEmail, resendVerification } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/user', auth, getUser);
router.post('/verify-email', verifyEmail); // Route zur Verifizierung der E-Mail
router.post('/resend-verification', resendVerification); // Route zur erneuten Verifizierung

module.exports = router;
