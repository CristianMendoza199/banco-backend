
// src/models/creditoModel.js
const pool = require('../config/db'); // ✅ Reutilizas el pool, NO lo redeclares

async function asignarCredito({ cliente_id, monto, tasa_interes, estado }) {
  return await pool.query(
    'SELECT asignar_credito($1, $2, $3, $4)',
    [cliente_id, monto, tasa_interes, estado]
  );
}

async function obtenerCreditosPorCliente(cliente_id) {
  const result = await pool.query(
    `SELECT id, monto_total, tasa_interes, fecha_inicio, estado, saldo_pendiente
    FROM creditos
    WHERE cliente_id = $1
    ORDER BY fecha_inicio DESC`, [cliente_id]
  );
  return result.rows;
}

module.exports = {
  asignarCredito,
  obtenerCreditosPorCliente
};

