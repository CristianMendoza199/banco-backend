const pool = require('../config/db');

async function registrarUsuario({ email, password, rol, cliente_id }) {
  return await pool.query(
    'INSERT INTO users (email, password, rol, cliente_id, creado_en) VALUES ($1, $2, $3, $4, NOW())',
    [email, password, rol, cliente_id]
  );
}

async function obtenerUsuarioPorEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function createUsuario({ email, password, rol, cliente_id }) {
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

async function updateUsuario(id, { email, rol, cliente_id }) {
  const result = await pool.query(
    `UPDATE users
     SET email = $1, rol = $2, cliente_id = $3
     WHERE id = $4
     RETURNING id, email, rol, cliente_id, creado_en`,
    [email, rol, cliente_id, id]
  );
  return result.rows[0];
}

async function deleteUsuario(id) {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id, email',
    [id]
  );
  return result.rows[0];
}

async function changePassword(id, nuevaPasswordHasheada) {
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [nuevaPasswordHasheada, id])
}

async function actualizarPassword(id, nuevaPasswordHasheada) {
  await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2',
    [nuevaPasswordHasheada, id]
  );
}

module.exports = {
  obtenerUsuarioPorEmail,
  createUsuario,
  obtenerTodosLosUsuarios,
  getUsuarioPorId,
  updateUsuario,
  deleteUsuario,
  changePassword, 
  registrarUsuario,
  actualizarPassword
};