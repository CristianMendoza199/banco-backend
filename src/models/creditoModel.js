
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

/*
const { pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

async function asignar_credito({cliente_id, monto, tasa_interes, estado}) {
  return await pool.query('SELECT asignar_credito($1, $2, $3, $4)',[cliente_id, monto, tasa_interes, estado]);
}

module.exports = {
  asignar_credito
}
*/




/*
// creditoModel.js
const pool = require('../db');

// Recibe un objeto, es escalable y profesional
async function asignarCredito({ cliente_id, monto, tasa_interes }) {
  const query = 'SELECT asignar_credito($1, $2, $3)';
  const values = [cliente_id, monto, tasa_interes];
  return await pool.query(query, values);
}

// Exportación clara y escalable
module.exports = {
  asignarCredito
};
*/

