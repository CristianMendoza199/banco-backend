const pool = require('../config/db');

async function crearCuenta({cliente_id, tipo_cuenta_id, saldo}){
    return await pool.query('SELECT * FROM crear_cuenta($1, $2, $3)',
      [cliente_id, tipo_cuenta_id, saldo]);
}

async function obtenerCuentasPorCliente(cliente_id) {
    return await pool.query(
      'SELECT * FROM cuentas WHERE cliente_id = $1',
      [cliente_id]
    );
}


async function obtenerTodasLasCuentas() {
    return await pool.query(
        'SELECT * FROM cuentas'
    );
}

async function eliminarCuenta(id) {
  return await pool.query('DELETE FROM cuentas WHERE id = $1', [id]);
}


module.exports = {
    crearCuenta,
    obtenerCuentasPorCliente,
    obtenerTodasLasCuentas,
      eliminarCuenta
}
