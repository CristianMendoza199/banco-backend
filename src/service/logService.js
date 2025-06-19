const pool = require('../config/db');

async function registrarLog({usuario_id, action, description, ip, user_agent}) {
    await pool.query(
        `INSERT INTO logs (usuario_id, accion, descripcion, ip, user_agent)
        VALUES ($1, $2, $3, $4, $5)`,
        [usuario_id, action, description, ip, user_agent]
    );
}

module.exports = {
    registrarLog
};