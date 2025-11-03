const express = require('express');
const router = express.Router();

const { verifyToken } =  require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

//const { obtenerTarjetasPorCliente } = require('../controllers/tarjetaController');
//const { registrarTransaccion } = require('../controllers/transaccionController');
const clienteController = require('../controllers/clienteController');


router.get('/', verifyToken, allowRoles('admin'),
clienteController.obtenerClientes);
router.post('/crear', verifyToken, allowRoles('admin'),
clienteController.crearCliente);
router.put('/actualizar/:id', verifyToken, allowRoles('admin'), 
clienteController.actualizarCliente);
router.delete('/eliminar/:id', verifyToken, allowRoles('admin'),
clienteController.eliminarCliente);

module.exports = router;