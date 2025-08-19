const pool = require('../config/db');

// Crear ticket
 async function crearTicket({ motivo, mensaje, user_id })  {
  const result = await pool.query(
    `INSERT INTO tickets (user_id, motivo, mensaje, estado)
     VALUES ($1, $2, $3, 'pendiente')
     RETURNING *`,
    [user_id, motivo, mensaje]
  );
  return result.rows[0];
};

  async function responderTicket({ ticketId, respuesta_admin, estado }) {
  const result = await pool.query(
    `UPDATE tickets
     SET respuesta_admin = $1,
         estado = COALESCE($2, estado),
         fecha_respuesta = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [respuesta_admin, estado, ticketId]
  );
  return result.rows[0];
};



// Obtener tickets por cliente 
 async function obtenerTicketsPorUsuario ({ user_id }) {
  const result = await pool.query(
    `SELECT * FROM tickets
     WHERE user_id = $1
     ORDER BY fecha_creacion DESC`,
    [user_id]
  );
  return result.rows[0];
};

// Obtener todos los tickets (admin)
async function obtenerTodosLosTickets () {
  const result = await pool.query(
    `SELECT t.*, u.email
     FROM tickets t
     JOIN users u ON u.id = t.user_id
     ORDER BY t.fecha_creacion DESC`
  );
  return result.rows[0];
};

module.exports ={
  crearTicket,
  responderTicket,
  obtenerTicketsPorUsuario,
  obtenerTodosLosTickets
};