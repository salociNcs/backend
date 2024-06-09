const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.status(400).json({ msg: 'Benutzername oder E-Mail bereits vergeben' });
        }
        const verificationCode = crypto.randomBytes(20).toString('hex');
        user = new User({ username, email, password, verificationCode });
        await user.save();
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 });

        const confirmLink = `http://localhost:3000/verify-email?code=${verificationCode}`;

        await sendEmail(
            email,
            'E-Mail-Bestätigung',
            `Klicken Sie auf den folgenden Link, um Ihre E-Mail-Adresse zu bestätigen: ${confirmLink}`
        );

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler' });
    }
};

exports.verifyEmail = async (req, res) => {
    const { verificationCode } = req.body;
    try {
        const user = await User.findOne({ verificationCode });
        if (!user) {
            return res.status(400).json({ msg: 'Ungültiger Bestätigungscode' });
        }
        user.isVerified = true;
        user.verificationCode = null;
        await user.save();
        res.status(200);
    } catch (err) {
        console.error('Error in verifyEmail:', err.message);
        res.status(500).json({ msg: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Ungültige Anmeldedaten' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Ungültige Anmeldedaten' });
        }
        if (!user.isVerified) {
            return res.status(400).json({ msg: 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse', resend: true });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler' });
    }
};


exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            throw "User not found";
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler' });
    }
};


exports.resendVerification = async (req, res) => {
    const { email } = req.body;  // E-Mail aus dem Body der Anfrage holen
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Benutzer nicht gefunden' });
        }
        if (user.isVerified) {
            return res.status(400).json({ msg: 'E-Mail-Adresse bereits bestätigt' });
        }
        const verificationCode = crypto.randomBytes(20).toString('hex');
        user.verificationCode = verificationCode;
        await user.save();

        // const confirmLink = `http://localhost:3000/api/auth/verify-email?code=${verificationCode}`;
        const confirmLink = `http://localhost:3000/verify-email?code=${verificationCode}`;

        await sendEmail(
            user.email,
            'E-Mail-Bestätigung',
            `Klicken Sie auf den folgenden Link, um Ihre E-Mail-Adresse zu bestätigen: ${confirmLink}`
        );

        res.json({ msg: 'Bestätigungs-E-Mail erneut gesendet' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Serverfehler' });
    }
};
