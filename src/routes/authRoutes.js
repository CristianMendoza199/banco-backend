const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);
router.post('/recuperar', authController.solicitarRecuperacion);
router.post('/reset-password', authController.restablecerContraseña);

module.exports = router;