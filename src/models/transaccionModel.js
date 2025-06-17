const pool = require('../config/db');

async function registrarTransaccion({cuenta_id, tipo, monto}) {
    return await pool.query(
          'SELECT * FROM registrar_transaccion($1, $2, $3)',
          [cuenta_id, tipo, monto]
    );
}

async function obtenerTransaccionesFiltradas(cliente_id, filtros) {
  const {
    cuenta_id,
    fecha_inicio,
    fecha_fin,
    tipo,
    page = 1,
    limit = 10
  } = filtros;

  const offset = (page - 1) * limit;

  const values = [cliente_id];
  let i = 2;
  let where = `cuenta_id IN (
    SELECT id FROM cuentas WHERE cliente_id = $1
  )`;

  if (cuenta_id) {
    where += ` AND cuenta_id = $${i++}`;
    values.push(cuenta_id);
  }
  if (fecha_inicio) {
    where += ` AND fecha >= $${i++}`;
    values.push(fecha_inicio);
  }
  if (fecha_fin) {
    where += ` AND fecha <= $${i++}`;
    values.push(fecha_fin);
  }
  if (tipo) {
    where += ` AND tipo = $${i++}`;
    values.push(tipo);
  }

  const query = `
    SELECT * FROM transacciones
    WHERE ${where}
    ORDER BY fecha DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const result = await pool.query(query, values);
  return result.rows;
}
module.exports = {
    registrarTransaccion,
    obtenerTransaccionesFiltradas
};