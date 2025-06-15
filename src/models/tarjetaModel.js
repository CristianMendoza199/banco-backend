const pool = require('../config/db');

async function crearTarjeta({ cuenta_id, tipo, limite_credito = 0 }) {
  return await pool.query(
    'SELECT crear_tarjeta($1, $2, $3)',
    [cuenta_id, tipo, limite_credito]
  );
}

async function obtenerTarjetasPorCliente(cliente_id) {
  const query = `
    SELECT t.*, tc.limite_credito
    FROM tarjetas t
    LEFT JOIN tarjeta_credito tc ON t.id = tc.tarjeta_id
    INNER JOIN cuentas c ON t.cuenta_id = c.id
    WHERE c.cliente_id = $1
  `;
  return await pool.query(query, [cliente_id]);
}

module.exports = {
  crearTarjeta,
  obtenerTarjetasPorCliente
};