
const model = require('../models/clienteModel');

// GET
exports.getClientes = async (req, res) => {
  try {
    const result = await model.obtenerClientes();
    res.json(result.rows);
  } catch (error) {
    console.error('Error en controlador al obtener clientes:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST
exports.crearCliente = async (req, res) => {
  try {
    const result = await model.crearCliente(req.body);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT
exports.actualizarCliente = async (req, res) => {
  const id = req.params.id;
  const { nombre, email, telefono, direccion } = req.body;
  try {
    const result = await model.editarCliente({ id, nombre, email, telefono, direccion });
    res.status(result.rows[0].status_code).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// DELETE
exports.eliminarCliente = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await model.eliminarCliente(id);
    res.status(result.rows[0].status_code).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



/*
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


// POST
const crearCliente = async (req, res) => {
  try {
    const { nombre, email, telefono, direccion } = req.body;
    const result = await pool.query('SELECT * FROM insertar_cliente($1, $2, $3, $4)', [nombre, email, telefono, direccion]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear cliente:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// PUT
exports.actualizarCliente = async (req, res) => {
  try {
    const result = await model.editarCliente(req.body);
    res.status(result.rows[0].status_code).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE - Eliminar cliente
exports.eliminarCliente = async (req, res) => {
  try {
    const result = await model.eliminarCliente(req.params.id);
    res.status(result.rows[0].status_code).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
*/