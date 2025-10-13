
// src/models/creditoModel.js
const pool = require('../config/db'); // ✅ Reutilizas el pool, NO lo redeclares

async function asignarCreditoSP({ cliente_id, monto_total, tasa_interes, numero_cuotas }) {
  const sql = 'SELECT sp_credito_crear($1,$2,$3,$4) AS data';
  return db.query(sql, [cliente_id, monto_total, tasa_interes, numero_cuotas]);
}


function obtenerCreditosPorClienteSP({ cliente_id, estado = null, limit = 50, offset = 0 }) {
  const sql = 'SELECT sp_credito_listar_por_cliente($1,$2,$3,$4) AS data';
  return db.query(sql, [cliente_id, estado, limit, offset]); // controller leerá rows[0].data
}


function obtenerCuotasPorCreditoSP({ credito_id, rol, actorClienteId, limit = 50, offset = 0 }) {
  const sql = 'SELECT sp_cuotas_listar_por_credito($1,$2,$3,$4,$5) AS data';
  db.query(sql, [credito_id, rol, actorClienteId, limit, offset]);
}

function pagarCuotaSP({ cuota_id, cuenta_id, actorRol, actorClienteId }) {
  const sql = 'SELECT sp_cuota_pagar($1,$2,$3,$4) AS data';
  return db.query(sql, [cuota_id, cuenta_id, actorRol, actorClienteId]);
}

module.exports = {
  asignarCreditoSP,
  obtenerCreditosPorClienteSP,
  obtenerCuotasPorCreditoSP,
  pagarCuotaSP
};

