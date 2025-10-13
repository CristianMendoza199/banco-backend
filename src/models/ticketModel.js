const pool = require("../config/db");

// Crear ticket
function crearTicket({ user_id, asunto, mensaje, prioridad = 'MEDIA', categoria = null }) {
  const sql = 'SELECT sp_ticket_crear($1,$2,$3,$4,$5) AS data';
  return db.query(sql, [user_id, asunto, mensaje, prioridad, categoria]);
}

function responderTicket({ id, autor_id, autor_rol, mensaje, nuevo_estado = null }) {
  const sql = 'SELECT sp_ticket_responder($1,$2,$3,$4,$5) AS data';
  return db.query(sql, [id, autor_id, autor_rol, mensaje, nuevo_estado]);
}
// Obtener tickets por cliente
function obtenerTicketsPorUsuario(user_id) {
  const sql = 'SELECT sp_tickets_por_usuario($1) AS data';
  return db.query(sql, [user_id]);
}

function obtenerTodosLosTickets({ estado = null, prioridad = null, categoria = null, limit = 50, offset = 0 } = {}) {
  const sql = 'SELECT sp_tickets_listar($1,$2,$3,$4,$5) AS data';
  return db.query(sql, [estado, prioridad, categoria, limit, offset]);
}

function detalleTicket(id) {
  const sql = 'SELECT sp_ticket_detalle($1) AS data';
  return db.query(sql, [id]);
}



module.exports = {
  crearTicket,
  responderTicket,
  obtenerTicketsPorUsuario,
  obtenerTodosLosTickets,
  detalleTicket
};
