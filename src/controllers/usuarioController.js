const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const model = require('../models/usuarioModel');
const logService = require('../service/logService');

const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
    try {
    const { email, password } = req.body;
    const usuario = await model.obtenerUsuarioPorEmail(email);

    if (!usuario) {
      return res.status(401).json({ status_desc: 'Credenciales inválidas' });
    }

    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(401).json({ status_desc: 'Credenciales inválidas' });
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

    res.status(200).json({
      status_code: 200,
      status_desc: 'Login exitoso',
      token
    });

     } catch (error) {
    res.status(500).json({ status_desc: 'Error interno', error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, rol, cliente_id } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    await model.registrarUsuario({ email, password: hashedPassword, rol, cliente_id });

    res.status(201).json({ status_code: 201, status_desc: 'Usuario registrado correctamente' });

  } catch (error) {
    res.status(500).json({ status_desc: 'Error al registrar usuario', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const usuarios = await model.obtenerTodosLosUsuarios();
    res.status(200).json({ status_code: 200, usuarios });
  } catch (error) {
    res.status(500).json({ status_desc: 'Error al obtener usuarios', error: error.message });
  }
};

const regexPasswordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;


exports.changePassword = async (req, res) => {
  const { id ,email, cliente_id} = req.user; //token
  const { passwordActual, newPassword } = req.body;
  console.log("ID desde token:", id);

  try {
    if(!passwordActual || !newPassword){
      return res.status(400).json({mensaje: 'todos los campos son obligatorios'});
    }   

    if(!regexPasswordFuerte.test(newPassword)){
      return res.status(400).json({
        mensaje:
        'La nueva contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y símbolo.'
      });
    }

    const usuario = await model.getUsuarioPorId(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    console.log("Usuario encontrado:", usuario);


    const passwordCorrect = await bcrypt.compare(passwordActual, usuario.password);
    if(!passwordCorrect){
      return res.status(401).json({ mensaje: 'contraseña actual incorrecta'});
    }

    const nuevaPasswordHasheada =  await bcrypt.hash(newPassword, 10);
    await model.actualizarpassword(id, nuevaPasswordHasheada);

    await logService.registrarLog({
      usuario_id: id,
      action: 'CAMBIO_PASSWORD',
      description: `El usuario ${email} cambió su contraseña`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.status(200).json({
      mensaje: 'contraseña actualizada con éxito, vuelve a iniciar sesión',
      forzarLogout: true,
    })


  } catch (error) {
    console.error("Error en changePassword:", error);
    res.status(500).json({ mensaje: 'Error al cambiar la contraseña'});
  }
}




