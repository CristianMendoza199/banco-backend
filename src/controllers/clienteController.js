
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



