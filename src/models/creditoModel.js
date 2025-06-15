
// src/models/creditoModel.js
const pool = require('../config/db'); // ✅ Reutilizas el pool, NO lo redeclares

async function asignarCredito({ cliente_id, monto, tasa_interes, estado }) {
  return await pool.query(
    'SELECT asignar_credito($1, $2, $3, $4)',
    [cliente_id, monto, tasa_interes, estado]
  );
}

module.exports = {
  asignarCredito
};

