const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { solicitarRecuperacion } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', controller.registrar);

// POST /api/auth/login
router.post('/login', controller.login);
router.post('/recuperar', solicitarRecuperacion);
router.post('/reset-password', controller.restablecerContraseña);

module.exports = router;