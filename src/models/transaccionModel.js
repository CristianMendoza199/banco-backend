const pool = require('../config/db');

function depositarSP({cuenta_id, monto, actorRol, actorClienteId}){
  const sql = 'SELECT sp_deposito($1,$2,$3,$4) AS data';
  db.query(sql, [cuenta_id, monto, actorRol, actorClienteId]);
}

function retirarSP({cuenta_id, monto, actorRol, actorClienteId}){
  const sql = 'SELECT sp_retiro($1,$2,$3,$4) AS data';
  db.query(sql,[cuenta_id, monto, actorRol, actorClienteId]);
}


function registrarTransaccionSP({ cuenta_id, tipo, monto, actorRol, actorClienteId }) {
  const sql = 'SELECT sp_transaccion_registrar($1,$2,$3,$4,$5,$6) AS data';
  return db.query(sql, [cuenta_id, tipo, monto, actorRol, actorClienteId, null]);
}

// Listar transacciones por cliente/cuenta y rango de fechas
function obtenerTransaccionesFiltradasSP({ cliente_id, cuenta_id, fecha_inicio, fecha_fin, limit = 50, offset = 0 }) {
  const sql = 'SELECT sp_transacciones_filtrar_por_cliente($1,$2,$3,$4,$5,$6) AS data';
  return db.query(sql, [cliente_id, cuenta_id, fecha_inicio, fecha_fin, limit, offset]);
}

// (Opcional) Estado de cuenta con resumen (para PDF)
function obtenerEstadoCuentaPeriodoSP({ cliente_id, cuenta_id, fecha_inicio, fecha_fin, limit = 1000, offset = 0 }) {
  const sql = 'SELECT sp_estado_cuenta_periodo($1,$2,$3,$4,$5,$6) AS data';
  return db.query(sql, [cliente_id, cuenta_id, fecha_inicio, fecha_fin, limit, offset]);
}
module.exports = {
    registrarTransaccionSP,
    obtenerTransaccionesFiltradasSP,
    obtenerEstadoCuentaPeriodoSP,
    depositarSP,
    retirarSP
};