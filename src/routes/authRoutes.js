const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyRole } = require('../middlewares/verifyToken')
const { allowRoles } = require('../middlewares/roles');


// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

router.put('/change-password', verifyToken, allowRoles('cliente', 'admin'), 
authController.changePassword);

router.post('/solicitar-new-password',verifyToken, verifyRole('cliente'), 
authController.forgotPassword);

router.post('/reset-password',verifyToken, allowRoles('cliente'),
 authController.resetPasswordConfirm);


module.exports = router;    