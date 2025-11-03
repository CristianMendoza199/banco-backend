const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { toInt, toStr, toBool } = require('../utils/casters');
const model = require("../models/usuarioModel");
const logService = require('../services/logService');
const LogActions = require("../constants/logAction");

const JWT_SECRET = process.env.JWT_SECRET;
const regexPasswordFuerte =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
const emailRegex = /^\S+@\S+\.\S+$/;

exports.obtenerUsuarios = async (req, res, next) => {
  try {
    const isAdmin  = req.user?.rol === 'admin';
    const rol      = (req.query?.rol || '').trim() || null;
    const estado   = (req.query?.estado || '').trim() || null;
    const limit    = Number.parseInt(req.query?.limit, 10)  || 50;
    const offset   = Number.parseInt(req.query?.offset, 10) || 0;

    // admin puede ver cualquier cliente; cliente solo su propio cliente_id
    const cliente_id = isAdmin
      ? (req.query?.cliente_id ? Number(req.query.cliente_id) : null)
      : (req.user?.cliente_id ?? null);

    const { rows } = await model.obtenerUsuarios({ rol, cliente_id, estado, limit, offset });
    const data = rows?.[0]?.data ?? [];
    return res.success(data);
  } catch (error) {
    console.error('obtenerUsuarios err:', error);
    error.status = error.status || 500;
    return next(error);
  }
};


exports.obtenerUsuarioPorId = async (req, res, next) => {
  try {
    const isAdmin  = req.user?.rol === 'admin';
    const idParam  = Number.parseInt(req.params?.id, 10);
    const targetId = isAdmin ? idParam : Number.parseInt(req.user?.id, 10);

    if (!Number.isInteger(targetId) || targetId <= 0) {
      return res.fail(400, 'usuario id inválido');
    }

    const { rows } = await model.obtenerUsuarioPorId({ id: targetId });
    const usuario = rows?.[0]?.data || null;

    if (!usuario) return res.fail(404, 'usuario no encontrado');
    return res.success(usuario);
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};


exports.createUsuario = async (req, res, next) => {
  try {
    const email = toStr(req.body?.email);
    const password = toStr(req.body?.password);
    const rolBody = (toStr(req.body?.rol) || 'cliente').trim();
    const clienteIdBody = toInt(req.body?.cliente_id);

    if (!email || !password) return res.fail(400, 'Email y contraseña son obligatorios');
    if (!emailRegex.test(email)) return res.fail(400, 'Email inválido');
    if (!regexPasswordFuerte.test(password)) return res.fail(400, 'Contraseña insegura');

    const passwordHash = await bcrypt.hash(password, 12);

    let rows;

     const actorId = req.user?.id ?? null;
    const actor_rol = req.user?.rol ?? null;
    const actor_cliente_id = req.user?.cliente_id ?? null;

    if (!req.user) {
      // BOOTSTRAP: solo permite crear ADMIN inicial (la SP también lo valida)
      if (rolBody !== 'admin') {
        return res.fail(403, 'Bootstrap solo permite crear el primer admin');
      }
      rows = (await usuarioModel.crearAdminBootstrap({ email, passwordHash })).rows;
    } else {
      // Reglas mínimas de rol/cliente
      if (rolBody === 'cliente' && !Number.isInteger(clienteIdBody)) {
        return res.fail(400, 'cliente_id es obligatorio para rol cliente');
      }
      if (rolBody === 'admin' && clienteIdBody != null) {
        return res.fail(400, 'Un admin no debe tener cliente_id');
      }

      rows = (await model.createUsuario({
        email,
        passwordHash,
        rol: rolBody,
        cliente_id: clienteIdBody ?? null,
        actor_rol,
        actor_cliente_id
      })).rows;
    }

    logService.registrarLog({
      usuario_id: actorId,
      accion: LogActions.CREATE_USER,
      descripcion: `usuario con el correo ${email} fue creado exitosamente)`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    }).catch(()=>{});

    const data = rows?.[0]?.data;
    if (!data) return res.fail(500, 'No se pudo crear el usuario');
    return res.status(201).success(data);

  } catch (error) {
    console.error('createUsuario err:', { code: error.code, message: error.message, detail: error.detail });
    if (error.code === '23505') return res.fail(409, 'El email ya está registrado');
    if (error.code === 'P0001')  return res.fail(422, error.message);
    return next(error);
  }
};

const ROLES_PERMITIDOS = new Set(['admin', 'cliente']);

// PUT /usuarios/:id (admin) → actualizar email/rol/cliente_id
exports.updateUsuario = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.fail(400, 'id inválido');

    const email      = (req.body?.email || '').trim() || null;
    const rol        = (req.body?.rol || '').trim() || null;
    const cliente_id = req.body?.cliente_id ?? null;

    const { rows } = await model.updateUsuario(id, { email, rol, cliente_id });
    const usuario = rows?.[0]?.data || null;
    if (!usuario) return res.fail(404, 'usuario no encontrado');

    return res.success(usuario);
  } catch (error) {
    console.error('updateUsuario err:', error); // deja esto encendido mientras pruebas
    if (error.code === '23505') return res.fail(409, 'El email ya está registrado');
    if (error.code === '23503') return res.fail(422, 'cliente_id inválido');
    if (error.code === 'P0001') return res.fail(422, error.message);
    return next(error);
  }
};

exports.eliminarUsuario = async (req, res, next) => {
  try {
    const id = toInt(req.params?.id);
    if (!Number.isInteger(id) || id <= 0) return res.fail(400, 'id inválido');

    // Sólo admin
    if (req.user?.rol !== 'admin') return res.fail(403, 'No autorizado');

    // No permitir borrarse a sí mismo
    if (id === req.user?.id) return res.fail(409, 'No puedes eliminar tu propio usuario');

    // Opcional: permitir borrado duro ?force=true (por defecto soft delete)
    const force = toBool(req.query?.force) === true;

    const { rows } = await model.eliminarUsuario({ id, actor_id: req.user.id, force });
    const data = rows?.[0]?.data ?? null;
    if (!data) return res.fail(404, 'Usuario no encontrado');

     logService.registrarLog?.({
      usuario_id: req.user?.id ?? null,
      accion: LogActions.DELETE_USER,
      descripcion: `Eliminó usuario ${id} (force=${force ? 'sí' : 'no'})`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });

    return res.success({ deleted: true, usuario: data });
  } catch (error) {
    // Mapear errores de regla de negocio desde la SP
    if (error.code === 'P0001') return res.fail(422, error.message); // p.ej. "No se puede eliminar el último admin"
    if (error.code === '23503') return res.fail(409, 'Conflicto de referencias (FK)');
    console.log(next);
    error.status = error.status || 500;
    return next(error);
  }
};