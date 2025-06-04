const express = require('express');
const router = express.Router();

const { crearCuenta } = require('../controllers/cuentaController');

router.post('/crear', crearCuenta);

module.exports = router;