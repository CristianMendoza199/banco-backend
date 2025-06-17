const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } =  require('../middlewares/roles');

const {
    realizarTransferencia
} = require('../controllers/transferenciaController');

router.post('/transferir',verifyToken, allowRoles('cliente'), realizarTransferencia);

module.exports =  router;