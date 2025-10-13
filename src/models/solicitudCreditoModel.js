const pool = require("../config/db");

function crearSolicitudSP({ cliente_id, monto_solicitado, numero_cuotas }) {
  const sql = 'SELECT sp_credito_solicitud_crear($1,$2,$3) AS data';
  return db.query(sql, [cliente_id, monto_solicitado, numero_cuotas]);
}

function obtenerSolicitudesSP({ actorRol, actorClienteId = null, estado = null, limit = 50, offset = 0 }) {
  const sql = 'SELECT sp_credito_solicitud_listar($1,$2,$3,$4,$5) AS data';
  return db.query(sql, [actorRol, actorClienteId, estado, limit, offset]);
}

function aprobarSolicitudSP({ solicitud_id, actor_rol, tasa_interes }) {
  const sql = 'SELECT sp_credito_solicitud_aprobar($1,$2,$3) AS data';
  return db.query(sql, [solicitud_id, actor_rol, tasa_interes]);
}

function rechazarSolicitudSP({ solicitud_id, actor_rol }) {
  const sql = 'SELECT sp_credito_solicitud_rechazar($1,$2) AS data';
  return db.query(sql, [solicitud_id, actor_rol]);
}

module.exports = {
  crearSolicitudSP,
  obtenerSolicitudesSP,
  aprobarSolicitudSP,
  rechazarSolicitudSP
};
