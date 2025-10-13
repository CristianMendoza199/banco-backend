const pool = require('../config/db');

async function registrarUsuarioSP({ email, passwordHash }) {
  const sql = 'SELECT sp_usuario_registrar($1,$2) AS data';
  return db.query(sql, [email, passwordHash]); // el controller lee rows?.[0]?.data
}


async function obtenerUsuarioPorEmail(email) {
  const sql = 'SELECT id, email, rol, cliente_id, estado, creado_en FROM users WHERE lower(email)=lower($1) LIMIT 1';
  return db.query(sql, [email]);
}

async function createUsuario({ email, passwordHash, rol = 'cliente', cliente_id = null }) {
    const  sql = 'SELECT sp_usuario_crear($1,$2,$3,$4) AS data';
    return db.query(sql,[email, passwordHash, rol, cliente_id]);
}


async function obtenerUsuarios({ estado = 'ACTIVO', limit = 100, offset = 0 } = {} ) {
  const sql = `SELECT sp_obtener_usuarios($1, $2, $3) AS data`;
    return await db.query(sql, [estado, limit, offset]);
}


async function obtenerUsuarioPorId(id) {
  const sql = `SELECT  sp_obtener_usuarios($1) AS data`;
  return await db.query(sql,[id]);
}


async function updateUsuario(id, { email, rol, cliente_id }) {
    const sql  = 'SELECT sp_usuario_actualizar($1, $2, $3, $4) AS data';
    return db.query(sql,[id, email, rol, cliente_id]);
}

async function eliminarUsuario(id) {
  const sql = 'SELECT sp_usuario_eliminar($1)  AS data';
  return await db.query(sql,[id]);
}

async function obtenerPasswordHashSP({ id }) {
  const sql = 'SELECT sp_usuario_obtener_hash($1) AS data';
  return db.query(sql, [id]);            // controller leerá rows?.[0]?.data?.password_hash
}

async function actualizarPasswordSP({ id, newHash, actorId }) {
  const sql = 'SELECT sp_usuario_actualizar_password($1,$2,$3) AS data';
  return db.query(sql, [id, newHash, actorId]); // { ok: true }
}

async function solicitarResetPasswordSP({ email, ip, ua }) {
  const sql = 'SELECT sp_password_solicitar_reset($1,$2,$3) AS data';
  return db.query(sql, [email, ip, ua]); // { ok, reset_token, expires_at }
}

async function confirmarResetPasswordSP({ token, newHash, ip, ua }) {
  const sql = 'SELECT sp_password_confirmar_reset($1,$2,$3,$4) AS data';
  return db.query(sql, [token, newHash, ip, ua]); // { ok: true }
}

module.exports = {
  obtenerUsuarioPorEmail,
  createUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  updateUsuario,
  eliminarUsuario,
  registrarUsuarioSP,
  obtenerPasswordHashSP,
  actualizarPasswordSP,
  solicitarResetPasswordSP,
  confirmarResetPasswordSP
};