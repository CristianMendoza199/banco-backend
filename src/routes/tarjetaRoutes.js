const express = require('express');
const router = express.Router();
const { crearTarjeta, obtenerTarjetasPorCliente } = require('../controllers/tarjetaController');
const { verifyToken, verifyRole } = require('../middlewares/verifyToken');

// Solo admin puede crear tarjetas (por ahora)
router.get('/test', (req, res) => res.send('Ruta de prueba OK'));
router.post('/crear', verifyToken, verifyRole('admin', 'cliente'), crearTarjeta);
router.get('/por-cliente', verifyToken, verifyRole('cliente', 'admin'),
obtenerTarjetasPorCliente);

module.exports = router;

