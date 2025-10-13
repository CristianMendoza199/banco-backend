const express = require('express');
const router = express.Router();
const {
    crearSolicitud,
    aprobarSolicitud,
    rechazarSolicitud,
    obtenerSolicitudes
} = require('../controllers/solicitudcreditocontroller');

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

router.post('/solicitar', verifyToken, allowRoles('cliente'),crearSolicitud);
router.get('/', verifyToken, allowRoles('admin'), obtenerSolicitudes);
router.post('/:id/aprobar', verifyToken, allowRoles('admin'), aprobarSolicitud);
router.post('/:id/rechazar', verifyToken, allowRoles('admin'), rechazarSolicitud);


module.exports = router;

