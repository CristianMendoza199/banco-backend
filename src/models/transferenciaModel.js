const pool = require('../config/db');

function realizarTransferenciaSP({
  cuenta_origen,
  cuenta_destino,
  monto,
  actorRol,         // 'admin' | 'cliente'
  actorClienteId,   // null si admin
  actorId,          // users.id (para auditoría si lo usas)
  idempotencyKey = null
}) {
  const sql = 'SELECT sp_transferencia_realizar($1,$2,$3,$4,$5,$6,$7) AS data';
  const params = [
    cuenta_origen, cuenta_destino, monto, actorRol, actorClienteId, actorId,
    idempotencyKey
  ];
  return db.query(sql, params);
}


function listarTransferenciasPorCuentaSP({ cuenta_id, limit = 50, offset = 0 }) {
  const sql = 'SELECT sp_transferencias_listar_por_cuenta($1,$2,$3) AS data';
  return db.query(sql, [cuenta_id, limit, offset]);
}


function detalleTransferenciaSP({ transfer_id }) {
  const sql = 'SELECT sp_transferencia_detalle($1) AS data';
  return db.query(sql, [transfer_id]);
}
module.exports = { 
  realizarTransferenciaSP, 
  listarTransferenciasPorCuentaSP,
  detalleTransferenciaSP

 };