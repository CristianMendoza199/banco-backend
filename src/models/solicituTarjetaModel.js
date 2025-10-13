const db = require('../config/db');

function crearSolicitudTarjeta({ cliente_id, cuenta_id, tipo, limite_solicitado = null }) {
  const sql = 'SELECT sp_solicitud_tarjeta_crear($1,$2,$3,$4) AS data';
  return db.query(sql, [cliente_id, cuenta_id, tipo, limite_solicitado]);
}

function listarSolicitudesTarjeta({ estado = null, cliente_id = null }) {
  const sql = 'SELECT sp_solicitudes_tarjeta_listar($1,$2) AS data';
  return db.query(sql, [estado, cliente_id]);
}

function decidirSolicitudTarjeta({ id, nuevoEstado, decididoPor, observacion = null, limiteAprobado = null }) {
  const sql = 'SELECT sp_solicitud_tarjeta_decidir($1,$2,$3,$4,$5) AS data';
  return db.query(sql, [id, nuevoEstado, decididoPor, observacion, limiteAprobado]);
}

module.exports = {
  crearSolicitudTarjeta,
  listarSolicitudesTarjeta,
  decidirSolicitudTarjeta,
};