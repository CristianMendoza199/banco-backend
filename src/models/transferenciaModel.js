const pool = require('../config/db');


async function TranferirMonto({cuenta_origen, cuenta_destino, monto}) {
    return await pool.query(
        'SELECT transferir_monto($1, $2, $3)',
        [cuenta_origen, cuenta_destino, monto]
    )
}

module.exports = {
    TranferirMonto
}