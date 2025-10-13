const express = require('express');
const router = express.Router();
const {
    crear, 
    listar,
    aprobar,
    rechazar
} = require('../controllers/solicitudTarjetaController');
const { verify } = require('jsonwebtoken');
const { verifyToken, verifyRole } = require('../middlewares/verifyToken')
const { allowRoles } = require('../middlewares/roles');

router.post('/crear', verifyToken, allowRoles('admin'), crear);
router.get('/listar', verifyToken, allowRoles('admin'), listar);
router.post('/aprobar', verifyToken, allowRoles('admin'), aprobar);
router.post('/rechazar', verifyToken, allowRoles('admin'), rechazar);

module.exports = router;

