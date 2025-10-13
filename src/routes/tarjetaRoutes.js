const express = require('express');
const router = express.Router();
const {
    crearTarjeta,
    obtenerTodas,
    reportarTarjeta,
    cambiarEstado,
    listarPorCuenta,
    detalleTarjeta,
    actualizarLimite
    
} = require('../controllers/tarjetaController');

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

//cliente puede ver sus tarjetas
router.get('/detalle_tarjeta', verifyToken, allowRoles('cliente'),detalleTarjeta);
router.post('/actualizar_limite', verifyToken, allowRoles('cliente'), actualizarLimite);

// Solo admin puede crear tarjetas (por ahora)
router.post('/crear', verifyToken, allowRoles('admin'),crearTarjeta);
router.post('/cambiar_estado', verifyToken, allowRoles('admin'), cambiarEstado);
router.get('/', verifyToken, allowRoles( 'admin'),obtenerTodas);

router.get('/listar/:cuenta_id', verifyToken, allowRoles('admin'),listarPorCuenta);

//reportar
router.post('/reportar', verifyToken, allowRoles('cliente'), reportarTarjeta);


module.exports = router;

