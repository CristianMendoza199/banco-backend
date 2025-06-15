const pool = require('../config/db');

async function registrarTransaccion({cuenta_id, tipo, monto}) {
    return await pool.query(
          'SELECT * FROM registrar_transaccion($1, $2, $3)',
          [cuenta_id, tipo, monto]
    );
}

module.exports = {
    registrarTransaccion
};