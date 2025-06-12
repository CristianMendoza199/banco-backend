// Importamos Express y creamos un router
const express = require('express');
const router = express.Router();
 
// importamos el controlador que maneja la logica del crédito
const { registrarTransaccion } = require('../controllers/transaccionController');

const verifyToken = require('../middlewares/verifyToken');
// Definimos una ruta POST para asignar un nuevo crédito
// Esta ruta se accede desde el frontend con: POST /api/transaccion/crear
router.post('/transaccion', verifyToken, registrarTransaccion);

// Exportamos el router para conectarlo en app.js
module.exports = router;


