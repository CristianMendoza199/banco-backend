const LogActions = require("../constants/logAction");
const logService = require("../services/logService");
const model = require("../models/clienteModel");

// GET
exports.obtenerClientes = async (req, res, next) => {
  try {
    const { rows } = await model.obtenerClientes();
    return res.success(rows);
  } catch (error) {
    console.status = 500;
    return next(error);
  }
};

// POST /clientes
exports.crearCliente = async (req, res, next) => {
  try {
    // valida lo básico; ajusta campos a tu esquema real
    const { nombre, email, telefono, direccion } = req.body || {};
    if (!nombre || !email) return res.fail(400, "faltan campos: nombre, email");

    const result = await model.crearCliente({
      nombre,
      email,
      telefono,
      direccion,
    });
    const cliente = result.rows?.[0];

    await logService.registrarLog({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.CLIENTE_CREADO,
      descripcion: `Cliente creado correctamente (id: ${cliente?.id ?? "N/A"})`,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    return res.status(201).success(cliente);
  } catch (error) {
    error.status = 500;
    return next(error);
  }
};

// PUT
exports.actualizarCliente = async (req, res, next) => {
  try {
    const { id } = req.params || {};
    if (!id) return res.fail(400, "faltan campos: id");

    const { nombre, email, telefono, direccion } = req.body || {};
    if (!nombre && !email && !telefono && !direccion) {
      return res.fail(400, "debes enviar al menos un campo para actualizar");
    }

    const result = await model.editarCliente({
      id,
      nombre,
      email,
      telefono,
      direccion,
    });
    const cliente_actualizado = result.rows?.[0];

    if (!cliente_actualizado) return res.fail(404, "Cliente no encontrado");

    await logService.registrarLog({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.CLIENTE_ACTUALIZADO,
      descripcion: `Cliente ID ${id} actualizado por usuario ${
        req.user?.id ?? req.user?.sub ?? "N/A"
      }`,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    return res.success(cliente_actualizado);
  } catch (error) {
    error.status = 500;
    return next(error);
  }
};
// DELETE
exports.eliminarCliente = async (req, res, next) => {
  try {
    const { id } = req.params || {};
    if (!id) return res.fail(400, "faltan campos: id");

    const result = await model.eliminarCliente(id);
    // muchos modelos devuelven rowCount en deletes; ajusta si tu modelo retorna rows[0]
    if (!result.rowCount) return res.fail(404, "Cliente no encontrado");

    await logService.registrarLog({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.CLIENTE_ELIMINADO,
      descripcion: `Cliente ID ${id} eliminado`,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    // Puedes retornar 204 sin body, o confirmación explícita
    return res.success({ deleted: true, id });
  } catch (error) {
    error.status = 500;
    return next(error);
  }
};
