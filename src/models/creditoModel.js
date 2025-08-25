
// src/models/creditoModel.js
const pool = require('../config/db'); // ✅ Reutilizas el pool, NO lo redeclares

async function asignarCredito({ cliente_id, monto_total, tasa_interes, numero_cuotas }) {
  const result = await pool.query(
    `INSERT INTO creditos (cliente_id, monto_total, tasa_interes, saldo_pendiente, estado, numero_cuotas)
     VALUES ($1, $2, $3, $2, 'Activo', $4)
     RETURNING *`,
    [cliente_id, monto_total, tasa_interes, numero_cuotas]
  );

  const credito =  result.rows[0];

  const monto_cuota = (monto_total / numero_cuotas ).toFixed(2);

  for (let i = 1; i <= numero_cuotas; i++) {
    const fecha_vencimiento = new Date();
    fecha_vencimiento.setMonth(fecha_vencimiento.getMonth() + i); 

        await pool.query(
      `INSERT INTO cuotas_credito (credito_id, numero_cuotas, monto_cuota, fecha_vencimiento)
       VALUES ($1, $2, $3, $4)`,
      [credito.id, i, monto_cuota, fecha_vencimiento]
    );
  }
  return credito;
}

async function obtenerCreditosPorCliente(cliente_id) {
  const result = await pool.query(
    `SELECT id, monto_total, tasa_interes, fecha_inicio, estado, saldo_pendiente
    FROM creditos
    WHERE cliente_id = $1
    ORDER BY fecha_inicio DESC`, [cliente_id]
  );
  return result.rows[0];
}

async function obtenerCuotasPorCredito(credito_id) {
  const result = await pool.query(
    `SELECT * FROM cuotas_credito 
     WHERE credito_id = $1 
     ORDER BY numero_cuotas ASC`,
    [credito_id]
  );
  return result.rows[0];
}

async function pagarCuota( cuota_id, cuenta_id ) {
  return await pool.query(
    'SELECT pagar_cuota_credito($1, $2)',
    [cuota_id, cuenta_id]
  );
}

module.exports = {
  asignarCredito,
  obtenerCreditosPorCliente,
  obtenerCuotasPorCredito,
  pagarCuota
};

