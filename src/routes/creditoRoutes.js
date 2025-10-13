// Importamos Express y creamos un router
const express = require('express');
const router = express.Router();
const creditoController = require('../controllers/creditoController');
// importamos el controlador que maneja la logica del crédito
const {
     getMisCreditos, 
     getCuotas,
     pagarCuota
     } = require('../controllers/creditoController');
const { verifyToken, verifyRole } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

router.post('/crear' , verifyToken, verifyRole, allowRoles('admin'), creditoController.crearCredito);

router.get('/mis-creditos', verifyToken, allowRoles('cliente'), creditoController.getMisCreditos);

router.get('/:id/cuotas', verifyToken, allowRoles('cliente', 'admin'), creditoController.getCuotas);

// Pagar una cuota
router.post('/cuotas/pagar', verifyToken, allowRoles('cliente'), creditoController.pagarCuota);


// Exportamos el router para conectarlo en app.js
module.exports = router;