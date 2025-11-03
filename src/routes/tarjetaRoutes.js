const express = require('express');
const router = express.Router();
const tarjetaController = require('../controllers/tarjetaController');

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

//cliente puede ver sus tarjetas
router.get('/detalle_tarjeta', verifyToken, allowRoles('cliente'),
tarjetaController.detalleTarjeta);
router.post('/actualizar_limite', verifyToken, allowRoles('cliente'),
tarjetaController.actualizarLimite);

// Solo admin puede crear tarjetas (por ahora)
router.post('/crear', verifyToken, allowRoles('admin'),
tarjetaController.crearTarjeta);
router.post('/cambiar_estado', verifyToken, allowRoles('admin'),
tarjetaController.cambiarEstado);

router.get('/listar/:cuenta_id', verifyToken, allowRoles('admin'),
tarjetaController.listarPorCuenta);

//reportar
router.post('/reportar', verifyToken, allowRoles('cliente'), 
tarjetaController.reportarTarjeta);


module.exports = router;

