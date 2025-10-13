const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { toInt, toStr } = require('../utils/casters');
const model = require("../models/usuarioModel");
const LogActions = require("../constants/logAction");

const JWT_SECRET = process.env.JWT_SECRET;
const regexPasswordFuerte =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
const emailRegex = /^\S+@\S+\.\S+$/;

const toInt = (v) => (Number.isInteger(+v) ? +v : NaN);
const toNum = (v) =>
  v === "" || v === null || v === undefined ? NaN : Number(v);

exports.obtenerUsuarios = async (req, res, next) => {
  try {
    if (req.user?.rol !== "admin") return res.fail(403, "solo admin");

    const { estado = "ACTIVO", limit = 100, offset = 0 } = req.query;
    const { rows } = await model.obtenerUsuarios({
      estado: estado || null,
      limit: Number(limit),
      offset: Number(offset),
    });

    return res.success(rows[0]?.data ?? []);
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

exports.obtenerUsuarioPorId = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id || req.user?.id, 10);
    if (isNaN(id)) return res.fail(400, "usuario id invalido");

    const { rows } = await model.obtenerUsuarioPorId(id);
    const usuario = rows.map((r) => r.data);

    if (!usuario.length) return res.fail(404, "usuario no encontrado");

    return res.status(201).success(usuario);
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};


exports.createUsuario = async (req, res, next) => {
  try {
      const isAdmin = req.user?.rol === 'admin';

      const emailRaw = toStr(req.body.email);
      const passwordRaw = toStr(req.body?.password);
      const rolBody = toStr(req.body?.rol) || 'cliente';
      const cliente_idBody = toInt(req.body.cliente_id);

      const rol_final = isAdmin ? rolBody.trim() || 'cliente': 'cliente';
      const cliente_id = isAdmin ? cliente_idBody : (req.user?.cliente_id ?? NaN);

    // 1. Validaciones básicas
    if (!emailRaw || !passwordRaw) return res.fail(400, 'Email y contraseña son obligatorios');
    if (!emailRegex.test(emailRegex)) return res.fail(400, 'Email inválido'); 
    if(!regexPasswordFuerte.test(passwordRaw)){
      return res.fail(400, 'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo');
    }
    if (!Number.isInteger(cliente_id) || cliente_id <= 0) return res.fail(400, 'cliente_id inválido');
    if (!isAdmin && rolBody && rolBody !== 'cliente') return res.fail(403, 'No autorizado para crear usuarios con ese rol');
    if (rol_final !== 'admin' && rol_final !== 'cliente') return res.fail(400, 'Rol no permitido');

    const passwordHash = await bcrypt.hash(passwordRaw, 12);

    const { rows } = await model.createUsuario({
      email: emailRaw,
      passwordHash,
      rol: rol_final, 
      cliente_id,
    });

    const usuario = rows?.[0]?.data;
    if(!usuario) return  res.fail(500, 'No se pudo crear el usuario');

    // 6. Log de auditoría (no sensitivo)
     logService.registrarLog({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.CREATE_USER,
      descripcion: `Creó usuario ${usuario.email} (cliente ${usuario.cliente_id}, rol ${usuario.rol})`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      request_id: req.context?.requestId ?? null,
    }).catch(() => {});

    return res.status(201).success(usuario);
  } catch(error) {
  error.status = error.status || 500;
  return next(error);
  }
};

// PUT /usuarios/:id (admin) → actualizar email/rol/cliente_id
exports.updateUsuario = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { email, rol, cliente_id } = req.body || {};

    if (!Number.isInteger(id) || id <= 0) return res.fail(400, "id inválido");
    if (!email || !rol) return res.fail(400, "email y rol son obligatorios");

    const { rows } = await model.updateUsuario(id, { email, rol, cliente_id });
    const usuario = rows?.[0]?.data || null;
    if (!usuario) return res.fail(404, "usuario no encontrado");

    await logService?.registrarLog?.({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: "UPDATE_USER",
      descripcion: `Actualizó usuario ${id}`,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    return res.success(usuario);
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

exports.eliminarUsuario = async (req, res, next) => {
  try {
    const id = toInt(req.params?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.fail(400, "id invalido");
    }

    if (req.user?.rol !== "admin") {
      return res.fail(403, "No autorizado para eliminar cuentas");
    }

    const { rows } = await model.eliminarUsuario(id);
    const eliminado = rows?.[0]?.data || null;

    await logService?.registrarLog?.({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.DELETE_USER,
      descripcion: `Eliminó usuario ${id}`,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    return res.success({ deleted: true, usuario: eliminado });
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

