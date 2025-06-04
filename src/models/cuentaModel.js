const pool = require('../config/db');

async function crearCuenta({cliente_id, tipo_cuenta_id, saldo}){
    return await pool.query('SELECT * FROM crear_cuenta($1, $2, $3)',[cliente_id, tipo_cuenta_id, saldo]);
}

module.exports = {
    crearCuenta
}
