const express = require('express');
const router = express.Router();

const { verifyToken } =  require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

//const { obtenerTarjetasPorCliente } = require('../controllers/tarjetaController');
//const { registrarTransaccion } = require('../controllers/transaccionController');
const {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} = require('../controllers/clienteController');


router.get('/', verifyToken, allowRoles('admin'), obtenerClientes);
router.post('/crear', verifyToken, allowRoles('admin'), crearCliente);
router.put('/actualizar/:id', verifyToken, allowRoles('admin'), actualizarCliente);
router.delete('/borrar/:id', verifyToken, allowRoles('admin'), eliminarCliente);

module.exports = router;