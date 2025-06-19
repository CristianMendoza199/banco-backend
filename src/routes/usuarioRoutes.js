const express = require('express');
const router = express.Router();
const {
     login,
     register,
      getAllUsers,
      changePassword
      
} = require('../controllers/usuarioController');

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

router.post('/login', login);
router.post('/register', register);

// Solo admin puede ver todos los usuarios
router.get('/', verifyToken, allowRoles('admin'), getAllUsers);

router.put('/cambiar-password', verifyToken, allowRoles('cliente'), changePassword);

module.exports = router;