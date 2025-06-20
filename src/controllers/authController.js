const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const model = require('../models/authModel');
const logService = require('../service/logService');
const { enviarCorreoRecuperacion } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET; // 🔒 Usá env en producción
const regexPasswordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// POST /auth/register
exports.registrar = async (req, res) => {
  try {
    const { email, password, rol, cliente_id } = req.body;
    await model.registrarUsuario({ email, password, rol, cliente_id });
    res.status(201).json({
      status_code: 201,
      status_desc: 'Usuario registrado correctamente'
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    res.status(500).json({
      status_code: 500,
      status_desc: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await model.obtenerUsuarioPorEmail(email);

    if (!usuario) {
      return res.status(401).json({
        status_code: 401,
        status_desc: 'Credenciales inválidas'
      });
    }

    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(401).json({
        status_code: 401,
        status_desc: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      { 
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        cliente_id: usuario.cliente_id
           },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

      await registrarLog({
        usuario_id: usuario.id,
        accion: 'LOGIN_EXITOSO',
        descripcion: `Inicio de sesión correcto para usuario: ${usuario.email}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
    });

    res.status(200).json({
      status_code: 200,
      status_desc: 'Login exitoso',
      token
    });
  } catch (error) {
    console.error('Error al hacer login:', error.message);
    res.status(500).json({
      status_code: 500,
      status_desc: 'Error interno',
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

    console.log({
      usuario_id,
      acction: 'RESET_PASSWORD',
      descripcion: `Restableció la contraseña desde enlace de recuperación`,
    });
      await logService.registrarLog({
        usuario_id,
        action: 'RESET_PASSWORD',
        description: `Restableció la contraseña desde enlace de recuperación`,
        ip: req.ip,
        user_agent: req.headers['user-agent'],
      });
      

     res.status(200).json({mensaje: 'Contraseña reestablecida éxitosamente'});
  } catch (error) {
    console.error(error);
    res.status(403).json({mensaje: 'token inválido o expirado'});
  }
};