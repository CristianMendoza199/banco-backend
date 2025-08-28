const express = require('express');
const router = express.Router();

const { verifyToken} = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

const { crearTarjeta } = require('../controllers/tarjetaController');
//const { eliminarCuenta } = require('../controllers/cuentaController');
const { getAllUsers } = require('../controllers/usuarioController');

router.use(verifyToken, allowRoles('admin'));

router.post('/crear-tarjeta',verifyToken, allowRoles('admin'), crearTarjeta);
router.get('/usuarios', verifyToken, allowRoles('admin'), getAllUsers);


module.exports = router;