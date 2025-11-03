const db = require('../config/db');

function crearTarjetaSP({ cuenta_id, tipo, limite_credito = null, actorRol, actorClienteId }) {
  const sql = 'SELECT sp_tarjeta_crear($1,$2,$3,$4,$5) AS data';
  return db.query(sql, [cuenta_id, tipo, limite_credito, actorRol, actorClienteId]);
}


function cambiarEstadoTarjetaSP({ tarjeta_id, nuevo_estado, motivo = null, actorId, actorRol, actorClienteId }) {
  const sql = 'SELECT sp_tarjeta_cambiar_estado($1,$2,$3,$4,$5,$6) AS data';
  return db.query(sql, [tarjeta_id, nuevo_estado, motivo, actorId, actorRol, actorClienteId]);
}


function reportarTarjetaSP({ tarjeta_id, motivo, actorId, actorRol, actorClienteId }) {
  const sql = 'SELECT sp_tarjeta_reportar($1,$2,$3,$4,$5) AS data';
  return db.query(sql, [tarjeta_id, motivo, actorId, actorRol, actorClienteId]);
}


function detalleTarjetaSP({ tarjeta_id, actorRol, actorClienteId }) {
  const sql = 'SELECT sp_tarjeta_detalle($1,$2,$3) AS data';
  return db.query(sql, [tarjeta_id, actorRol, actorClienteId]);
}

function listarTarjetasPorCuentaSP({ cuenta_id, limit = 50, offset = 0 }) {
  const sql = 'SELECT sp_tarjetas_listar_por_cuenta($1,$2,$3) AS data';
  return db.query(sql, [cuenta_id, limit, offset]);
}

function actualizarLimiteTarjetaSP({ tarjeta_id, nuevo_limite, actorId, actorRol, actorClienteId }) {
  const sql = 'SELECT sp_tarjeta_actualizar_limite($1,$2,$3,$4,$5) AS data';
  return db.query(sql, [tarjeta_id, nuevo_limite, actorId, actorRol, actorClienteId]);
}

const db = require('../config/db');

function emitirDebitoPorCuenta({ cuenta_id, actorRol, actorClienteId }) {
  const sql = 'SELECT sp_tarjeta_debito_emitir_por_cuenta($1,$2,$3) AS data';
  return db.query(sql, [cuenta_id, actorRol, actorClienteId]);
}


module.exports = {
  crearTarjetaSP,
  listarTarjetasPorCuentaSP,
  cambiarEstadoTarjetaSP,
  reportarTarjetaSP,
  detalleTarjetaSP,
  actualizarLimiteTarjetaSP,
  emitirDebitoPorCuenta
};
