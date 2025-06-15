const express = require('express');
const router = express.Router();
const { login, register, getAllUsers } = require('../controllers/usuarioController');
const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

router.post('/login', login);
router.post('/register', register);

// Solo admin puede ver todos los usuarios
router.get('/', verifyToken, allowRoles('admin'), getAllUsers);

module.exports = router;