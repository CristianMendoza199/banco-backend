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
    FROM tarjeta t
    LEFT JOIN tarjeta_credito tc ON t.id = tc.tarjeta_id
    INNER JOIN cuentas c ON t.cuenta_id = c.id
    WHERE c.cliente_id = $1
  `;
  return await pool.query(query, [cliente_id]);
}

async function bloquearTarjeta(id) {
    return await pool.query('UPDATE tarjeta  SET estado = $1 WHERE id = $2', ['bloqueada', id]);
}

async function activarTarjeta(id) {
    return await pool.query('UPDATE tarjeta SET estado  = $1 WHERE id = $2',['activa',id]);
}

async function eliminarTarjeta(id) {
    return await pool.query('DELETE FROM tarjeta WHERE id = $1'[id]);
}

async function obtenerTodasTarjetas() {
    return await pool.query('SELECT FROM tarjeta');
}

async function reportarTarjeta(tarjeta_id, motivo) {
  return await pool.query('SELECT reportar_tarjeta($1, $2)', [tarjeta_id, motivo]);
}
module.exports = {
  crearTarjeta,
  obtenerTarjetasPorCliente,
  bloquearTarjeta,
  activarTarjeta,
  eliminarTarjeta, 
  obtenerTodasTarjetas, 
  reportarTarjeta
};