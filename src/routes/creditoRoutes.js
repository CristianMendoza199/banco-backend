// Importamos Express y creamos un router
const express = require('express');
const router = express.Router();

// importamos el controlador que maneja la logica del crédito
const {
     getMisCreditos, 
     getCuotas,
     pagarCuota
     } = require('../controllers/creditoController');
const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

router.get('/mis-creditos', verifyToken, allowRoles('cliente'), getMisCreditos);

router.get('/:id/cuotas', verifyToken, allowRoles('cliente', 'admin'), getCuotas);

// Pagar una cuota
router.post('/cuotas/pagar', verifyToken, allowRoles('cliente'), pagarCuota);


// Exportamos el router para conectarlo en app.js
module.exports = router;