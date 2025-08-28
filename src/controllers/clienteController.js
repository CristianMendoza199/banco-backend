
const LogActions = require('../constants/logAction');
const model = require('../models/clienteModel');

// GET
exports.obtenerClientes = async (req, res) => {
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
    const cliente = result.rows[0];

        await logService.registrarLog({
        usuario_id: req.user?.id ?? null,
        accion: LogActions.CLIENTE_CREADO,
        descripcion: `Cliente creado correctamente`,
        ip: req.ip,
        user_agent: req.headers['user-agent'],
      });

    res.status(201).json(cliente);
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
    const cliente_actualizado = result.rows[0];

    await logService.registrarLog({
      usuario_id: req.user.id,
      accion: LogActions.CLIENTE_ACTUALIZADO,
      descripcion: `Cliente ID ${id} actualizado por usuaio ${req.user.id}`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.status(cliente_actualizado.status_code).json(cliente_actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// DELETE
exports.eliminarCliente = async (req, res) => {
  const id = req.params.id;
  const cliente_eliminado = result.rows[0];

  try {
    const result = await model.eliminarCliente(id);
      await logService.registrarLog({
    usuario_id: req.user.id,
    accion: LogActions.CLIENTE_ELIMINADO,
    descripcion: `Cliente ID ${id} elimminado`,
    ip: req.ip,
    user_agent: req.headers['user-agent'],
  });

    res.status(cliente_eliminado.status_code).json(cliente_eliminado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



