//const pool = require('../config/db');
const db = require('../config/db');

async function crearCuentaSP({ cliente_id, tipo_cuenta_id, saldo }) {
  const sql = `SELECT sp_cuenta_crear($1, $2, $3) AS data`;
  return db.query(sql, [cliente_id, tipo_cuenta_id, saldo]);
}


async function obtenerCuentasPorCliente(cliente_id) {
      const sql = `SELECT sp_cuentas_por_cliente($1) AS data`;
      return db.query(sql,[cliente_id]);
}


async function obtenerTodasLasCuentas() {
  const sql = `SELECT sp_obtener_cuentas() AS data`;
    return await db.query(sql);
}

async function eliminarCuenta(id) {
  const sql = `SELECT sp_cuenta_eliminar($1) AS data`;
  return await db.query( sql, [id]);
}


module.exports = {
    crearCuentaSP,
    obtenerCuentasPorCliente,
    obtenerTodasLasCuentas,
      eliminarCuenta
}
