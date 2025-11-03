const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuarioModel');
const logService = require('../services/logService');
const { mailer } = require('../utils/emailService');
const { toStr } = require('../utils/casters');
const LogActions = require('../constants/logAction');
const JWT_SECRET = process.env.JWT_SECRET; // 🔒 Usá env en producción
  

// POST /auth/register

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

exports.register = async (req, res, next) => {
  try {
    const emailRaw = toStr(req.body?.email);
    const pwdRaw   = toStr(req.body?.password);

    if (!emailRaw || !pwdRaw)        return res.fail(400, 'Email y contraseña son obligatorios');
    if (!emailRegex.test(emailRaw))  return res.fail(400, 'Email inválido');
    if (!strongPwd.test(pwdRaw))     return res.fail(400, 'Contraseña insegura');

    const passwordHash = await bcrypt.hash(pwdRaw, 12);

    // crea usuario con rol por defecto 'cliente' y sin cliente_id
    const { rows } = await usuarioModel.createUsuario({
      email: emailRaw,
      passwordHash,
      rol: 'cliente',
      cliente_id: null,
      actor_rol: null,
      actor_cliente_id: null
    });

    const data = rows?.[0]?.data;
    if (!data) return res.fail(500, 'No se pudo registrar el usuario');

    // Log sin romper si no hay usuario autenticado todavía
    await logService?.registrarLog?.({
      usuario_id: data.id ?? null,
      accion: LogActions.REGISTER_USER,
      descripcion: `Usuario registrado con el correo ${data.email}`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    }).catch(() => {});

    return res.status(201).success({
      id: data.id,
      email: data.email,
      rol: data.rol,
      cliente_id: data.cliente_id,
      creado_en: data.creado_en
    });

  } catch (err) {
    if (err?.code === '23505') return res.fail(409, 'El email ya está registrado');
    if (err?.code === 'P0001') return res.fail(422, err.message);
    return next(err);
  }
};

// POST /auth/login

exports.login = async (req, res, next) => {
  try {
    const email = toStr(req.body?.email);
    const password = toStr(req.body?.password);

    if (!email || !password) return res.fail(400, 'Email y contraseña son obligatorios');

    const { rows } = await usuarioModel.loginLookupByEmail(email);
    const u = rows?.[0]?.data || null;

    // No revelamos si existe o no: mensaje genérico
    if (!u) return res.fail(401, 'Credenciales inválidas');

    if (u.estado !== 'ACTIVO') {
      return res.fail(403, 'Usuario inactivo');
    }

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.fail(401, 'Credenciales inválidas');

    // emitir JWT
    const token = jwt.sign(
      { sub: u.id, email: u.email, rol: u.rol, cliente_id: u.cliente_id },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // auditoría (no sensitiva)
    logService?.registrarLog?.({
      usuario_id: u.id,
      accion: LogActions.LOGIN_SUCCESS,
      descripcion: `Login OK (${u.email})`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      request_id: req.context?.requestId ?? null
    }).catch(() => {});

    // respuesta sin hash
    return res.success({
      token,
      usuario: {
        id: u.id,
        email: u.email,
        rol: u.rol,
        cliente_id: u.cliente_id
      }
    });

  } catch (error) {
   console.error('login err:', { code: error.code, message: error.message, detail: error.detail });
    return next(error);
  }
};

const regexPasswordFuerte =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;


exports.changePassword = async (req, res, next) => {
  const rid = req.context?.requestId || 'no-rid';
  try {
    console.log(`[changePassword][${rid}] hit`, {
      hasUser: !!req.user,
      userId: req.user?.id,
      email: req.user?.email,
    });

    if (!req.user?.id) return res.fail(401, 'Token requerido');

    const { id, email } = req.user;
    const { passwordActual, newPassword } = req.body || {};

    if (!passwordActual || !newPassword) return res.fail(400, 'todos los campos son obligatorios');

    if (!regexPasswordFuerte.test(newPassword)) {
      return res.fail(400, 'La nueva contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo.');
    }

    // Paso 1: obtener hash actual
    const rHash = await usuarioModel.obtenerPasswordHashSP?.({ id });
    console.log(`[changePassword][${rid}] rHash.type`, typeof rHash);
    console.log(`[changePassword][${rid}] rHash.rows?`, Array.isArray(rHash?.rows), 'len=', rHash?.rows?.length);

    const currentHash = rHash?.rows?.[0]?.data?.password_hash || null;
    console.log(`[changePassword][${rid}] currentHash?`, !!currentHash);

    if (!currentHash) return res.fail(404, 'Usuario no encontrado');

    // Paso 2: comparar
    const ok = await bcrypt.compare(passwordActual, currentHash);
    console.log(`[changePassword][${rid}] compare=`, ok);
    if (!ok) return res.fail(401, 'contraseña actual incorrecta');

    // Paso 3: actualizar
    const newHash = await bcrypt.hash(newPassword, 12);
    const rUpd = await usuarioModel.actualizarPasswordSP?.({ id, newHash, actorId: id });

    console.log(`[changePassword][${rid}] rUpd.rows?`, Array.isArray(rUpd?.rows), 'len=', rUpd?.rows?.length, 'row0=', rUpd?.rows?.[0]);

    const okUpd = rUpd?.rows?.[0]?.data?.ok === true;
    if (!okUpd) return res.fail(500, 'No se pudo actualizar la contraseña');

    // Paso 4: auditoría (no bloqueante)
    logService?.registrarLog?.({
      usuario_id: id,
      accion: LogActions.CHANGE_PASSWORD,
      descripcion: `El usuario ${email} cambió su contraseña`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      request_id: rid,
    }).catch((e) => console.warn(`[changePassword][${rid}] log warn:`, e?.message));

    return res.status(200).success({ mensaje: 'contraseña actualizada con éxito, vuelve a iniciar sesión', forzarLogout: true });
  } catch (error) {
    // mapeos útiles
    const code = error?.code;
    console.error(`[changePassword][${rid}] ERROR`, {
      name: error?.name,
      message: error?.message,
      code,
      detail: error?.detail,
      where: error?.where,
      stack: error?.stack,
    });

    if (code === 'P0001') return res.fail(422, error.message);   // EXCEPTION de la SP
    if (code === '23505') return res.fail(409, 'conflicto (duplicado)');
    if (code === '23503') return res.fail(409, 'violación de FK');
    if (code === '22P02') return res.fail(400, 'input inválido');

    // deja que tu errorHandler formatee en JSON estándar
    error.status = error.status || 500;
    return next(error);
  }
};

// POST /api/auth/forgot-password  (público)
exports.forgotPassword = async (req, res, next) => {
  try {
    const email = toStr
      ? toStr(req.body?.email, { lower: true })
      : String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.fail(400, 'Email obligatorio');

    // 1. normalizar IP y UA
    // en express, `req.ip` a veces viene "::1" o "127.0.0.1" (local)
    const rawIp = req.ip || req.headers['x-forwarded-for'] || null;
    // si viene "127.0.0.1, 10.0.0.1" nos quedamos con el primero
    const ip = rawIp ? String(rawIp).split(',')[0].trim() : null;
    const ua = req.headers['user-agent'] ? String(req.headers['user-agent']).slice(0, 255) : null;

    const { rows } = await usuarioModel.solicitarResetPasswordSP({
      email,
      ip,
      ua,
    });

    const data = rows?.[0]?.data;

    // si la SP decidió no revelar usuario
    if (!data?.reset_token) {
      return res.status(200).success({
        mensaje: 'Si el email existe, recibirás un enlace',
      });
    }

    // si SÍ hay token → aquí armarías el correo
    const url = `${process.env.FRONT_URL || 'http://localhost:4200'}/reset-password?token=${encodeURIComponent(
      data.reset_token
    )}`;

    // si tienes mailer:
    // await mailer.send({ ... })

    return res.status(200).success({
      mensaje: 'Si el email existe, recibirás un enlace',
      // ojo: esto sólo para pruebas, en prod NO devuelvas el token
      // token: data.reset_token,
      // expires_at: data.expires_at,
      url, // para que lo pruebas rápido
    });
  } catch (error) {
    if (error.code === 'P0001') return res.fail(422, error.message);
    error.status = error.status || 500;
    return next(error);
  }
};

// POST /api/auth/reset-password/confirm  (público, con token)
exports.resetPasswordConfirm = async (req, res, next) => {
  const rid = req.context?.requestId || 'no-rid';
  try {
    const token = String(req.body?.token || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!token || !newPassword) {
      return res.fail(400, 'token y newPassword son obligatorios');
    }
    if (!regexPasswordFuerte.test(newPassword)) {
      return res.fail(
        400,
        'La nueva contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y símbolo.'
      );
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    const { rows } = await usuarioModel.confirmarResetPasswordSP({
      token,
      newHash,
      ip: req.ip,
      ua: req.headers['user-agent'],
    });

    const ok = rows?.[0]?.data?.ok === true;
    if (!ok) return res.fail(422, 'Token inválido o expirado');

    return res.success({ mensaje: 'Contraseña actualizada, inicia sesión' });
  } catch (error) {
    // Mapear errores de la SP (USING ERRCODE 'P0001')
    if (error?.code === 'P0001') return res.fail(422, error.message);
    // IDs/inputs inválidos
    if (error?.code === '22P02') return res.fail(400, 'input inválido');

    error.status = error.status || 500;
    return next(error);
  }
};
