const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const model = require('../models/usuarioModel');
const logService = require('../services/logService');
const { enviarCorreoRecuperacion } = require('../utils/emailService');
const LogActions = require('../constants/logAction');
const JWT_SECRET = process.env.JWT_SECRET; // 🔒 Usá env en producción
const regexPasswordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// POST /auth/register

exports.register = async (req, res) => {
  try {
    const { email, password, rol = 'cliente', cliente_id = null } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status_desc: 'Email y contraseña son obligatorios' });
    }
    if (!regexPasswordFuerte.test(password)) {
      return res.status(400).json({
        status_desc: 'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo'
      });
    }

    // evitar duplicados
    const yaExiste = await model.obtenerUsuarioPorEmail(email);
    if (yaExiste) {
      return res.status(409).json({ status_desc: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await model.registrarUsuario({ email, password: hashedPassword, rol, cliente_id });

    await logService.registrarLog({
      usuario_id: usuario.id,
      accion: LogActions.REGISTER_USER,
      descripcion: `Usuario registrado correctamente con el correo ${usuario.email}`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.status(201).json({ status_code: 201, status_desc: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);

    await logService.registrarLog({
      usuario_id: null,
      accion: LogActions.REGISTER_FAILED,
      descripcion: `Error al registrar usuario: ${error.message}`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.status(500).json({ status_desc: 'Error al registrar usuario', error: error.message });
  }
};



// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

 
    const usuario = await model.obtenerUsuarioPorEmail(email);
    if (!usuario) {
      return res.status(401).json({
        success: false,
        status_code: 401,
        message: "Usuario no encontrado"
      });
    }

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      await logService.registrarLog({
        usuario_id: usuario.id,
        accion: LogActions.LOGIN_FALLIDO,
        descripcion: `Intento fallido de login para usuario ID ${usuario.id}: contraseña incorrecta `,
        ip: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return res.status(401).json({
        success: false,
        status_code: 401,
        message: "Contraseña incorrecta"
      });
    }

    // 🔑 Payload: lo que se enviará dentro del token
    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      cliente_id: usuario.cliente_id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" });

    await logService.registrarLog({
      usuario_id: usuario.id,
      accion: LogActions.LOGIN_EXITOSO,
      descripcion: `Usuario Id ${usuario.email}: inició sesión correctamente`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });

    // ✅ respuesta con 200 OK explícito
    return res.status(200).json({
      success: true,
      status_code: 200,
      message: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error(error);

    await logService.registrarLog({
      usuario_id: null,
      accion: LogActions.LOGIN_ERROR,
      descripcion: `Error inesperado en login: ${error.message}`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });

    return res.status(500).json({
      success: false,
      status_code: 500,
      message: "Error al iniciar sesión",
      error: error.message
    });
  }
};



exports.solicitarRecuperacion = async(req, res) => {
  const { email} = req.body;

  try {
     const usuario = await model.obtenerUsuarioPorEmail(email);
     if(!usuario) {
      return res.status(404).json({
        mensaje: 'usuario no encontrado'
      });
     }

     const token = jwt.sign({ id: usuario.id}, JWT_SECRET, {expiresIn: '15m'});

     await enviarCorreoRecuperacion(email, token);

     res.status(200).json({mensaje: 'correo de recuperación enviado'});
  }catch ( error ) {
    console.error(error);
    res.status(500).json({mensaje: 'Error al enviar la recuperación'});
  }
}

exports.restablecerContraseña = async(req, res) => {
  const { token, newPassword } = req.body;

  try {

    if (!token || !newPassword) {
      return res.status(400).json({ mensaje: 'Token y nueva contraseña son obligatorios' });
    }

    if (!regexPasswordFuerte.test(newPassword)) {
      return res.status(400).json({
        mensaje: 'La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo.',
      });
    }


     const decoded = jwt.verify(token, JWT_SECRET);
     const usuario_id = decoded.id;

     const nuevaPasswordHasheada  = await bcrypt.hash(newPassword, 10);
     await model.actualizarPassword(usuario_id, nuevaPasswordHasheada);

    await logService.registrarLog({
        usuario_id: usuario.id,
        accion: LogActions.PASSWORD_RESET,
        descripcion: `Restableció la contraseña desde enlace de recuperación`,
        ip: req.ip,
        user_agent: req.headers['user-agent'],
      });
      
     res.status(200).json({mensaje: 'Contraseña reestablecida éxitosamente'});
  } catch (error) {
    console.error(error);
    res.status(403).json({mensaje: 'token inválido o expirado'});
  }
};