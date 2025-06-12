const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const model = require('../models/authModel');

const JWT_SECRET = 'secreto_bancario_123'; // 🔒 Usá env en producción

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
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

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