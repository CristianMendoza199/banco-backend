const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

const {
     crearCuenta,
     obtenerMisCuentas,
     obtenerTodas,
     eliminarCuenta

 } = require('../controllers/cuentaController');

 // Cliente puede ver sus propias cuentas
router.get('/mis-cuentas', verifyToken, allowRoles('cliente','admin'), obtenerMisCuentas);


// admin, puede crear y ver todas!!
router.post('/crear',verifyToken, allowRoles('admin'),crearCuenta);
router.get('/', verifyToken, allowRoles('admin'),obtenerTodas);
router.delete('/eliminar/:id', verifyToken, allowRoles('admin'),eliminarCuenta)



module.exports = router;