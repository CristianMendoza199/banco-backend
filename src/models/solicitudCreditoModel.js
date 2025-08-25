const pool = require('../config/db');

async function crearSolicitud({ cliente_id, monto_solicitado, tasa_interes, numero_cuotas }) {
  const result = await pool.query(
    `INSERT INTO solicitudes_credito (cliente_id, monto_solicitado, tasa_interes, numero_cuotas)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [cliente_id, monto_solicitado, tasa_interes, numero_cuotas]
  );
  return result.rows[0];
}


async function obtenerSolicitudes(estado) {
  let query = 'SELECT * FROM solicitudes_credito';
  const params = [];
  if (estado) {
    query += ' WHERE estado = $1';
    params.push(estado);
  }
  const result = await pool.query(query, params);
  return result.rows[0];
}

async function actualizarEstadoSolicitud(id, estado) {
  const result = await pool.query(
    `UPDATE solicitudes_credito SET estado = $1 WHERE id = $2 RETURNING *`,
    [estado, id]
  );
  return result.rows[0];
}



module.exports = {
    crearSolicitud,
    obtenerSolicitudes, 
    actualizarEstadoSolicitud
}