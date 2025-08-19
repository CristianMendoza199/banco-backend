const express = require('express');
const router = express.Router();

const { verifyToken } =  require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

//const { obtenerTarjetasPorCliente } = require('../controllers/tarjetaController');
//const { registrarTransaccion } = require('../controllers/transaccionController');
const {
  getClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} = require('../controllers/clienteController');

//router.use(verifyToken, allowRoles('cliente'));

//router.get('/mis-tarjetas', obtenerTarjetasPorCliente);
//router.post('/transaccion',registrarTransaccion);



router.get('/', getClientes);
router.post('/crear', crearCliente);
router.put('/actualizar/:id', actualizarCliente);
router.delete('/borrar/:id', eliminarCliente);

module.exports = router;