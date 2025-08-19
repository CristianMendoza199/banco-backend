const express = require('express');
const router = express.Router();
const {
      getAllUsers,
      changePassword,
      getUsuarioById,
      updateUsuario,
      deleteUsuario
      
} = require('../controllers/usuarioController');

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');


router.get('/', verifyToken, allowRoles('admin'), getAllUsers);
router.get('/:id', verifyToken, allowRoles('cliente', 'admin'), getUsuarioById)
router.put('/:id', verifyToken, allowRoles('cliente', 'admin'), updateUsuario)
router.put('/cambiar-password', verifyToken, allowRoles('cliente'), changePassword);
router.delete('/:id', verifyToken, allowRoles('admin'), deleteUsuario)
module.exports = router;