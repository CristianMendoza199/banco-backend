const pool = require('../config/db');


async function realizarTransferencia({ cuenta_origen, cuenta_destino, monto }) {
 
return await pool.query(
    "SELECT realizar_transferencia($1, $2, $3)",
    [cuenta_origen, cuenta_destino, monto]
  );
}

module.exports = { realizarTransferencia };