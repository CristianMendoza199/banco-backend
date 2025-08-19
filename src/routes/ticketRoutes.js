const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

const {
   crearTicket,
   obtenerTodos,
   responderTicket,
   obtenerTicketsPorUsuario

} = require('../controllers/ticketController');

// Crear ticket
router.post('/crear', verifyToken, allowRoles('cliente'), crearTicket);

//responder ticket (admin)
router.put("/:id/responder", verifyToken, allowRoles('admin'), responderTicket);

// Obtener tickets por cliente
router.get('/user/:user_id', verifyToken, allowRoles( 'admin'), obtenerTicketsPorUsuario);

// Obtener todos los tickets (admin)
router.get('/', verifyToken, allowRoles('admin'), obtenerTodos);

module.exports = router;