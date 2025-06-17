// Importamos Express y creamos un router
const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } =  require('../middlewares/roles');
// Definimos una ruta POST para asignar un nuevo crédito
// Esta ruta se accede desde el frontend con: POST /api/transaccion/crear
 
// importamos el controlador que maneja la logica del crédito
const {
     registrarTransaccion, 
     getHistorialConFiltros

 } = require('../controllers/transaccionController');


router.post('/transaccion', verifyToken, allowRoles('cliente'), registrarTransaccion);
router.get('/transacciones', verifyToken, allowRoles('cliente'), getHistorialConFiltros);

// Exportamos el router para conectarlo en app.js
module.exports = router;


