const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

// GET
async function obtenerClientes() {
  return await pool.query('SELECT * FROM obtener_clientes()');
}

// POST
async function crearCliente({ nombre, email, telefono, direccion }) {
  return await pool.query('SELECT * FROM insertar_cliente($1, $2, $3, $4)', [nombre, email, telefono, direccion]);
}

// PUT
async function editarCliente({ id, nombre, email, telefono, direccion }) {
  return await pool.query('SELECT * FROM actualizar_cliente($1, $2, $3, $4, $5)', [id, nombre, email, telefono, direccion]);
}

// DELETE
async function eliminarCliente(id) {
  return await pool.query('SELECT * FROM eliminar_cliente($1)', [id]);
}

module.exports = {
  obtenerClientes,
  crearCliente,
  editarCliente,
  eliminarCliente
};


