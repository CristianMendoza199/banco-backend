const express = require('express');
const router = express.Router();
const {
    crearSolicitud,
    getSolicitudes,
    aprobarSolicitud,
    rechazarSolicitud
} = require('../controllers/solicitudcreditocontroller');

const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } = require('../middlewares/roles');

router.post('/solicitar', verifyToken, allowRoles('cliente'),crearSolicitud);
router.get('/', verifyToken, allowRoles('admin'), getSolicitudes);
router.post('/:id/aprobar', verifyToken, allowRoles('admin'), aprobarSolicitud);
router.post('/:id/rechazar', verifyToken, allowRoles('admin'), rechazarSolicitud);


module.exports = router;

