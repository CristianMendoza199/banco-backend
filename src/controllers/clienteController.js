const LogActions = require("../constants/logAction");
const logService = require("../services/logService");
const model = require("../models/clienteModel");
const { toInt, toStr } = require('../utils/casters');

// GET
exports.obtenerClientes = async (req, res, next) => {
  try {
    // (opcional) sólo admin lista clientes; si quieres permitir cliente, valida rol aquí
    if (req.user?.rol !== 'admin') return res.fail(403, 'No autorizado');

    const busqueda = toStr(req.query?.busqueda || '', { trim: true }) || null;
    const { rows } = await model.obtenerClientes({ busqueda });
    const data = rows?.[0]?.data ?? [];

    return res.success(data);
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

// POST /clientes
exports.crearCliente = async (req, res, next) => {
  try {
    if (req.user?.rol !== 'admin') return res.fail(403, 'No autorizado');

    const nombre    = toStr(req.body?.nombre);
    const email     = toStr(req.body?.email, { lower: true });
    const telefono  = toStr(req.body?.telefono);
    const direccion = toStr(req.body?.direccion);

    if (!nombre || !email) return res.fail(400, 'faltan campos: nombre, email');

    const { rows } = await model.crearCliente({ nombre, email, telefono: telefono || null, direccion: direccion || null });
    const cliente = rows?.[0]?.data;
    if (!cliente) return res.fail(500, 'No se pudo crear el cliente');

    await logService?.registrarLog?.({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.CLIENTE_CREADO,
      descripcion: `Cliente creado (id: ${cliente.id}, email: ${cliente.email})`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });

    return res.status(201).success(cliente);
  } catch (error) {
    // PG unique_violation -> 23505
     console.error('crearCliente error:', { code: error.code, message: error.message, detail: error.detail });
    if (error.code === '23505') return res.fail(409, 'El email ya está registrado');
    if (error.code === '23505') return res.fail(409, 'El email de cliente ya existe');
    error.status = error.status || 500;

    return next(error);
  }
};

exports.crearCliente = async (req, res, next) => {
  try {
    if (req.user?.rol !== 'admin') return res.fail(403, 'No autorizado');

    const nombre    = toStr(req.body?.nombre);
    const email     = toStr(req.body?.email, { lower: true });
    const telefono  = toStr(req.body?.telefono);
    const direccion = toStr(req.body?.direccion);

    if (!nombre || !email) return res.fail(400, 'faltan campos: nombre, email');

    const { rows } = await model.crearCliente({ nombre, email, telefono: telefono || null, direccion: direccion || null });
    const cliente = rows?.[0]?.data;
    if (!cliente) return res.fail(500, 'No se pudo crear el cliente');

    await logService?.registrarLog?.({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.CLIENTE_CREADO,
      descripcion: `Cliente creado (id: ${cliente.id}, email: ${cliente.email})`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });

    return res.status(201).success(cliente);
  } catch (error) {
    // PG unique_violation -> 23505
    if (error.code === '23505') return res.fail(409, 'El email de cliente ya existe');
    error.status = error.status || 500;
    return next(error);
  }
};



exports.actualizarCliente = async (req, res, next) => {
  try {
    if (req.user?.rol !== 'admin') return res.fail(403, 'No autorizado');

    console.log('params:', req.params, 'body.id:', req.body?.id);
    const id = toInt(req.params?.id);
    if (!Number.isInteger(id) || id <= 0) return res.fail(400, 'id inválido');

    const nombre    = req.body?.nombre    !== undefined ? toStr(req.body.nombre) : null;
    const email     = req.body?.email     !== undefined ? toStr(req.body.email, { lower: true }) : null;
    const telefono  = req.body?.telefono  !== undefined ? toStr(req.body.telefono) : null;
    const direccion = req.body?.direccion !== undefined ? toStr(req.body.direccion) : null;

    if (nombre === null && email === null && telefono === null && direccion === null) {
      return res.fail(400, 'debes enviar al menos un campo para actualizar');
    }

    const { rows } = await model.actualizarCliente({ id, nombre, email, telefono, direccion });
    const cliente = rows?.[0]?.data;  
    if (!cliente) return res.fail(404, 'Cliente no encontrado');

    await logService?.registrarLog?.({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.CLIENTE_ACTUALIZADO,
      descripcion: `Cliente ID ${id} actualizado`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });

    return res.success(cliente);
  } catch (error) {
    if (error.code === '23505') return res.fail(409, 'El email de cliente ya existe');
    error.status = error.status || 500;
    return next(error);
  }
};


// DELETE
exports.eliminarCliente = async (req, res, next) => {
  try {
    if (req.user?.rol !== 'admin') return res.fail(403, 'No autorizado');

    const id = toInt(req.params?.id);
    if (!Number.isInteger(id) || id <= 0) return res.fail(400, 'id inválido');

    const { rows } = await model.eliminarCliente(id);
    const resp = rows?.[0]?.data; // {'deleted':true,'id':...} o NULL
    if (!resp) return res.fail(404, 'Cliente no encontrado');

    await logService?.registrarLog?.({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.CLIENTE_ELIMINADO,
      descripcion: `Cliente ID ${id} eliminado`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });

    return res.success(resp);
  } catch (error) {
    // Si hay FKs (users/cuentas), PG tirará 23503 → mapear a 409
    if (error.code === '23503') return res.fail(409, 'No se puede eliminar: cliente con relaciones');
    error.status = error.status || 500;
    return next(error);
  }
};
