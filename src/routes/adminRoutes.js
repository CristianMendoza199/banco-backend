const express = require('express');
const router = express.Router();

const { verifyToken} = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

const { crearTarjeta } = require('../controllers/tarjetaController');
//const { eliminarCuenta } = require('../controllers/cuentaController');


router.use(verifyToken, allowRoles('admin'));

router.post('/crear-tarjeta',verifyToken, allowRoles('admin'), crearTarjeta);


module.exports = router;