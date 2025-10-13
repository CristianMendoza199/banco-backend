const express = require('express');
const router = express.Router();
const {
      changePassword,
      updateUsuario,
      deleteUsuario,
      obtenerUsuarios,
      obtenerUsuarioPorId,
      createUsuario,
      eliminarUsuario
      
} = require('../controllers/usuarioController');

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

router.post('/crear', verifyToken, allowRoles('admin'), createUsuario);
router.get('/', verifyToken, allowRoles('admin'), obtenerUsuarios);
router.get('/:id', verifyToken, allowRoles('cliente', 'admin'), obtenerUsuarioPorId)
router.put('/:id', verifyToken, allowRoles('cliente', 'admin'), updateUsuario)
router.put('/cambiar-password', verifyToken, allowRoles('cliente'), changePassword);
router.delete('/:id', verifyToken, allowRoles('admin'), eliminarUsuario)
module.exports = router;