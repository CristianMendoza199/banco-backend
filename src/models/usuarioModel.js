const pool = require('../config/db');

async function obtenerUsuarioPorEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function registrarUsuario({ email, password, rol, cliente_id }) {
  return await pool.query(
    'INSERT INTO users (email, password, rol, cliente_id, creado_en) VALUES ($1, $2, $3, $4, NOW())',
    [email, password, rol, cliente_id]
  );
}

async function obtenerTodosLosUsuarios() {
  const result = await pool.query('SELECT id, email, rol, cliente_id, creado_en FROM users');
  return result.rows;
}


async function getUsuarioPorId(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}



module.exports = {
  obtenerUsuarioPorEmail,
  registrarUsuario,
  obtenerTodosLosUsuarios,
  getUsuarioPorId,
};