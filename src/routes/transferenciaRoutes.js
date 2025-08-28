const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/verifyToken');
const { allowRoles } =  require('../middlewares/roles');

const {
    transferir
} = require('../controllers/transferenciaController');

router.post('/transferir',verifyToken, allowRoles('cliente'), transferir);



module.exports =  router;