const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verify } = require('jsonwebtoken');
const { verifyToken } = require('../middlewares/verifyToken')
const { allowRoles } = require('../middlewares/roles');


// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);
router.post('/recuperar', verifyToken, allowRoles('cliente'), authController.solicitarRecuperacion);
router.post('/reset-password',verifyToken, allowRoles('cliente'), authController.restablecerContraseña);

module.exports = router;