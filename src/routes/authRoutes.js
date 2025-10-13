const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verify } = require('jsonwebtoken');
const { verifyToken, verifyRole } = require('../middlewares/verifyToken')
const { allowRoles } = require('../middlewares/roles');


// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);
router.post('/recuperar', verifyToken, allowRoles('cliente'), authController.changePassword);
router.post('/solicitar-new-password',verifyToken, verifyRole('cliente'), authController.forgotPassword);
router.post('/reset-password',verifyToken, allowRoles('cliente'), authController.resetPassword);

module.exports = router;