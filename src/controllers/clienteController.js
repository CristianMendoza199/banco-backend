
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

const getClientes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM obtener_clientes()');
    res.json(result.rows);
  } catch (error) {
    console.error('Error en controlador al obtener clientes:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getClientes };

