const { Pool } = require('pg');
require('dotenv').config();

const db   = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
}); 

  // GET
  function obtenerClientes({ busqueda = null } = {}) {
  const sql = 'SELECT sp_clientes_listar($1) AS data';
  return db.query(sql, [busqueda]);
}

// POST
function crearCliente({ nombre, email, telefono = null, direccion = null }) {
  const sql = 'SELECT sp_cliente_crear($1,$2,$3,$4) AS data';
  return db.query(sql, [nombre, email, telefono, direccion]);
}
// PUT
function actualizarCliente({ id, nombre = null, email = null, telefono = null, direccion = null }) {
  const sql = 'SELECT sp_cliente_actualizar($1,$2,$3,$4,$5) AS data';
  return db.query(sql, [id, nombre, email, telefono, direccion]);
}

// DELETE
function eliminarCliente(id) {
  const sql = 'SELECT sp_cliente_eliminar($1) AS data';
  return db.query(sql, [id]);
}


module.exports = {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};


