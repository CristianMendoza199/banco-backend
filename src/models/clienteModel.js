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


/*
const pool = require('../config/db');

exports.obtenerTodos = () => {
  return pool.query('SELECT * FROM clientes');
};

exports.insertarCliente = (nombre, email, telefono, direccion) => {
  return pool.query(
    'INSERT INTO clientes (nombre, email, telefono, direccion) VALUES ($1, $2, $3, $4) RETURNING *',
    [nombre, email, telefono, direccion]
  );
}; 

// SP para editar cliente
exports.editarCliente = async ({ id, nombre, email, telefono, direccion }) => {
  const query = `
    SELECT * FROM editar_cliente($1, $2, $3, $4, $5);
  `;
  const values = [id, nombre, email, telefono, direccion];
  return await pool.query(query, values);
};

// SP para eliminar cliente
exports.eliminarCliente = async (id) => {
  const query = `SELECT * FROM eliminar_cliente($1);`;
  return await pool.query(query, [id]);
};
*/