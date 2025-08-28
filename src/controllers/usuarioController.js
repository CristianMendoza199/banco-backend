const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const model = require('../models/usuarioModel');
const logService = require('../services/logService');
const LogActions = require('../constants/logAction');

const JWT_SECRET = process.env.JWT_SECRET;


exports.getAllUsers = async (req, res) => {
  try {
    const usuarios = await model.obtenerTodosLosUsuarios();
    res.status(200).json({ status_code: 200, usuarios });
  } catch (error) {
    res.status(500).json({ status_desc: 'Error al obtener usuarios', error: error.message });
  }
};

exports.getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;

    // si querés restringir que solo el dueño o admin vean:
    // if (req.user.rol !== 'admin' && req.user.id !== Number(id)) { ... }

    const usuario = await model.getUsuarioPorId(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.status(200).json({ usuario });
  } catch (error) {
    res.status(500).json({ status_desc: 'Error al obtener usuario', error: error.message });
  }
};

// POST /usuarios (admin) → crear usuario (CRUD)
// NOTA: si preferís que la creación sea solo por /auth/register, podés omitir este endpoint.
exports.createUsuario = async (req, res) => {
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

    const existe = await model.obtenerUsuarioPorEmail(email);
    if (existe) return res.status(409).json({ status_desc: 'El email ya está registrado' });

    const hashed = await bcrypt.hash(password, 10);
    await model.registrarUsuario({ email, password: hashed, rol, cliente_id });

    await logService?.registrarLog?.({
      usuario_id: req.user?.id,
      action: LogActions.CREATE_USER,
      description: `Creó usuario ${email}`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.status(201).json({ status_code: 201, status_desc: 'Usuario creado' });
  } catch (error) {
    res.status(500).json({ status_desc: 'Error al crear usuario', error: error.message });
  }
};


// PUT /usuarios/:id (admin) → actualizar email/rol/cliente_id
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, rol, cliente_id } = req.body;

    const actualizado = await model.updateUsuario(id, { email, rol, cliente_id });
    if (!actualizado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    await logService?.registrarLog?.({
      usuario_id: req.user?.id,
      accion: 'UPDATE_USER',
      descripcion: `Actualizó usuario ${id}`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.status(200).json({ status_code: 200, usuario: actualizado });
  } catch (error) {
    res.status(500).json({ status_desc: 'Error al actualizar usuario', error: error.message });
  }
};


exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const borrado = await model.deleteUsuario(id);
    if (!borrado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    await logService?.registrarLog?.({
      usuario_id: req.user?.id,
      accion: 'DELETE_USER',
      descripcion: `Eliminó usuario ${id}`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.status(200).json({ status_code: 200, status_desc: 'Usuario eliminado', usuario: borrado });
  } catch (error) {
    res.status(500).json({ status_desc: 'Error al eliminar usuario', error: error.message });
  }
};



const regexPasswordFuerte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

exports.changePassword = async (req, res) => {
  const { id ,email} = req.user; //token
  const { passwordActual, newPassword } = req.body;

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




