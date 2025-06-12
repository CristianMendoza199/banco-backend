const db = require('../config/db');
const bcrypt = require('bcrypt');

//Registrar nuevo usuario
async function registrarUsuario({ email, password, rol = 'cliente', cliente_id = null }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return db.query(
    'SELECT registrar_usuario($1, $2, $3, $4)',
    [email, hashedPassword, rol, cliente_id]
  );
}

async function obtenerUsuarioPorEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

module.exports = {
    registrarUsuario,
    obtenerUsuarioPorEmail
}