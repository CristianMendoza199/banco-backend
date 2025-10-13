const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

const {
   crearTicket,
   obtenerTodos,
   obtenerTicketsPorUsuario,
   detalleTicket

} = require('../controllers/ticketController');

// Crear ticket
router.post('/crear', verifyToken, allowRoles('cliente'), crearTicket);

//responder ticket (admin)
router.put("/:id/detalle", verifyToken, allowRoles('admin'), detalleTicket);

// Obtener tickets por cliente
router.get('/user/:user_id', verifyToken, allowRoles( 'admin'), obtenerTicketsPorUsuario);

// Obtener todos los tickets (admin)
router.get('/', verifyToken, allowRoles('admin'), obtenerTodos);

module.exports = router;