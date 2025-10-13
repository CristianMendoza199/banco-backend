const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const model = require('../models/usuarioModel');
const logService = require('../services/logService');
const { mailer } = require('../utils/emailService');
const { toStr } = require('../utils/casters');
const LogActions = require('../constants/logAction');
const JWT_SECRET = process.env.JWT_SECRET; // 🔒 Usá env en producción
const regexPasswordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const emailRegex = /^\S+@\S+\.\S+$/;

// POST /auth/register

exports.register = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    // 1) Validaciones básicas
    if (!email || !password) return res.fail(400, 'Email y contraseña son obligatorios');
    if (!emailRegex.test(email)) return res.fail(400, 'Email inválido');
    if (!regexPasswordFuerte.test(password)) {
      return res.fail(400, 'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo');
    }

    // 2) Hash en backend
    const passwordHash = await bcrypt.hash(password, 10); // mantengo 10 como venías usando

    // 3) SP: SELECT sp_usuario_registrar($1,$2) AS data
    const { rows } = await model.registrarUsuarioSP({ email, passwordHash });
    const usuario = rows?.[0]?.data || null;
    if (!usuario) return res.fail(500, 'No se pudo registrar el usuario');

    // 4) Auditoría (no bloqueante)
    logService.registrarLog({
      usuario_id: usuario.id,                                  // recién creado
      accion: LogActions.REGISTER_USER,
      descripcion: `Usuario registrado correctamente con el correo ${usuario.email}`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      request_id: req.context?.requestId ?? null,
    }).catch(() => {});

    // 5) Respuesta (sin password ni hash)
    return res.status(201).success(usuario);
  } catch (error) {
    error.status = error.status || 500; // 23505/otros los mapea tu errorHandler global
    return next(error);
  }
};


// POST /auth/login

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validación mínima (uniforme)
    if (!email || !password) {
      return res.fail(400, 'faltan campos: email, password');
    }

    const usuario = await model.obtenerUsuarioPorEmail(email);
    if (!usuario) {
      return res.fail(401, 'Usuario no encontrado');
    }

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      // Log igual que antes
      await logService.registrarLog({
        usuario_id: usuario.id,
        accion: LogActions.LOGIN_FALLIDO,
        descripcion: `Intento fallido de login para usuario ID ${usuario.id}: contraseña incorrecta`,
        ip: req.ip,
        user_agent: req.headers['user-agent'],
      });
      return res.fail(401, 'Contraseña incorrecta');
    }

    // 🔑 Payload: sin cambios
    const payload = {
      id: usuario.id,
      rol: usuario.rol,
      cliente_id: usuario.cliente_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' });

    // Log igual que antes
    await logService.registrarLog({
      usuario_id: usuario.id,
      accion: LogActions.LOGIN_EXITOSO,
      descripcion: `Usuario ${usuario.email}: inició sesión correctamente`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });

    // ✅ respuesta uniforme
    return res.success({
      token,
      usuario: { 
        id: usuario.id,  rol: usuario.rol, cliente_id: usuario.cliente_id
       },
    });

  } catch (error) {
    // Log igual que antes
    await logService.registrarLog({
      usuario_id: null,
      accion: LogActions.LOGIN_ERROR,
      descripcion: `Error inesperado en login: ${error.message}`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });
    error.status = error.status || 500;
    return next(error); // lo formatea errorHandler -> { data:null, meta, error:{...} }
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { id, email } = req.user; // del token
    const { passwordActual, newPassword } = req.body || {};

    if (!passwordActual || !newPassword) return res.fail(400, 'todos los campos son obligatorios');
    if (!regexPasswordFuerte.test(newPassword)) {
      return res.fail(400, 'La nueva contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo.');
    }

    // 1) Traer hash actual via SP
    const { rows: rHash } = await model.obtenerPasswordHashSP({ id });
    const currentHash = rHash?.[0]?.data?.password_hash || null;
    if (!currentHash) return res.fail(404, 'Usuario no encontrado');

    // 2) Validar contraseña actual
    const ok = await bcrypt.compare(passwordActual, currentHash);
    if (!ok) return res.fail(401, 'contraseña actual incorrecta');

    // 3) Hashear nueva y actualizar via SP
    const newHash = await bcrypt.hash(newPassword, 12);
    const { rows: rUpd } = await model.actualizarPasswordSP({ id, newHash, actorId: id });
    const okUpd = rUpd?.[0]?.data?.ok === true;
    if (!okUpd) return res.fail(500, 'No se pudo actualizar la contraseña');

    // 4) Auditoría (no bloqueante)
    logService.registrarLog({
      usuario_id: id,
      accion: LogActions.CHANGE_PASSWORD,
      descripcion: `El usuario ${email} cambió su contraseña`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      request_id: req.context?.requestId ?? null,
    }).catch(() => {});

    return res.status(200).success({ mensaje: 'contraseña actualizada con éxito, vuelve a iniciar sesión', forzarLogout: true });
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};


exports.forgotPassword = async (req, res, next) => {
  try {
    const email = toStr ? toStr(req.body?.email, { lower: true }) : String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.fail(400, 'Email obligatorio');

    const { rows } = await model.solicitarResetPasswordSP({ email, ip: req.ip, ua: req.headers['user-agent'] });
    const data = rows?.[0]?.data;

    // No revelar existencia; responde siempre OK
    if (!data?.ok) return res.status(200).success({ mensaje: 'Si el email existe, recibirás un enlace' });

    // Si hay token, lo enviamos
    if (data.reset_token) {
      const url = `${process.env.FRONT_URL}/reset-password?token=${encodeURIComponent(data.reset_token)}`;
      await mailer.send({
        to: email,
        subject: 'Restablecer contraseña',
        html: `
          <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
          <p><a href="${url}">Restablecer contraseña</a></p>
          <p>Este enlace expira el ${data.expires_at}.</p>
        `,
      });
    }

    return res.status(200).success({ mensaje: 'Si el email existe, recibirás un enlace' });
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const token = String(req.body?.token || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!token || !newPassword) return res.fail(400, 'Datos incompletos');
    if (!regexPasswordFuerte.test(newPassword)) {
      return res.fail(400, 'La nueva contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo.');
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    const { rows } = await model.confirmarResetPasswordSP({
      token,
      newHash,
      ip: req.ip,
      ua: req.headers['user-agent'],
    });
    const ok = rows?.[0]?.data?.ok === true;
    if (!ok) return res.fail(400, 'Token inválido o expirado');

    return res.status(200).success({ mensaje: 'contraseña restablecida con éxito, inicia sesión' });
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

