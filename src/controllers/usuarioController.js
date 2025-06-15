const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const model = require('../models/usuarioModel');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto123';

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


