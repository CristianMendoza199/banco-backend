// Importamos Express y creamos un router
const express = require('express');
const router = express.Router();

// importamos el controlador que maneja la logica del crédito
const {
     crearCredito,
     getMisCreditos
     } = require('../controllers/creditoController');
const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

// Definimos una ruta POST para asignar un nuevo crédito
// Esta ruta se accede desde el frontend con: POST /api/creditos/crear
router.post('/crear', crearCredito);
router.get('/mis-creditos', verifyToken, allowRoles('cliente'),getMisCreditos);

// Exportamos el router para conectarlo en app.js
module.exports = router;