const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

router.post('/crear', verifyToken, allowRoles('admin'), usuarioController.createUsuario);
router.get('/', verifyToken, allowRoles('admin'),
 usuarioController.obtenerUsuarios);
 
router.get('/:id', verifyToken, allowRoles('cliente', 'admin'),
usuarioController.obtenerUsuarioPorId);

router.put('/:id', verifyToken, allowRoles('cliente', 'admin'),
usuarioController.updateUsuario)

router.delete('/:id', verifyToken, allowRoles('admin'), 
usuarioController.eliminarUsuario)


module.exports = router;