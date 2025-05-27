const express = require('express');
const router = express.Router();
const {
  getClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} = require('../controllers/clienteController');

router.get('/', getClientes);
router.post('/crear', crearCliente);
router.put('/actualizar/:id', actualizarCliente);
router.delete('/borrar/:id', eliminarCliente);

module.exports = router;