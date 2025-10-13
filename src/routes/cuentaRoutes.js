const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');
const cuentaController =  require('../controllers/cuentaController');
const {
     crearCuenta,
     eliminarCuenta,
     obtenerCuentasPorCliente,
     obtenerTodasLasCuentas

 } = require('../controllers/cuentaController');

 // Cliente puede ver sus propias cuentas
router.get('/mis-cuentas', verifyToken, allowRoles('cliente','admin'), 
cuentaController.obtenerCuentasPorCliente);


// admin, puede crear y ver todas!!
router.post('/crear',verifyToken, allowRoles('admin'),
cuentaController.crearCuenta);
router.get('/', verifyToken, allowRoles('admin'),
cuentaController.obtenerTodasLasCuentas);
router.delete('/eliminar/:id', verifyToken, allowRoles('admin'),
cuentaController.eliminarCuenta)



module.exports = router;