const express = require('express');
const router = express.Router();
const {
    crearTarjeta,
    obtenerTarjetasPorCliente, 
    obtenerTodas,
    eliminarTarjeta,
    activarTarjeta,
    bloquearTarjeta, 
    reportarTarjeta
    
} = require('../controllers/tarjetaController');

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

//cliente puede ver sus tarjetas
router.get('/mis-tarjetas', verifyToken, allowRoles('cliente'),obtenerTarjetasPorCliente);


// Solo admin puede crear tarjetas (por ahora)
router.post('/crear', verifyToken, allowRoles('admin'),crearTarjeta);
router.get('/todas', verifyToken, allowRoles( 'admin'),obtenerTodas);
router.delete('/eliminar/:id', verifyToken, allowRoles('admin'),eliminarTarjeta);


//activar o bloquear tarjetas
router.put('/bloquear/:id', verifyToken, allowRoles('admin','cliente'), bloquearTarjeta);
router.put('/activar/:id', verifyToken, allowRoles('admin','cliente'), activarTarjeta);

//reportar
router.post('/reportar', verifyToken, allowRoles('cliente'), reportarTarjeta);


module.exports = router;

