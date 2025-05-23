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

//Editar cliente
exports.editarCliente = ({ id, nombre, email, telefono, direccion }) => {
  return pool.query('SELECT * FROM editar_cliente($1, $2, $3, $4, $5)', [id, nombre, email, telefono, direccion]);
};

// Eliminar cliente
exports.eliminarCliente = (id) => {
  return pool.query('SELECT * FROM eliminar_cliente($1)', [id]);
};