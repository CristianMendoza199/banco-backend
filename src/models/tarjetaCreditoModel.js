const db = require('../config/db');

function spConsumo({ tarjeta_id, monto, descripcion, actorRol, actorClienteId }) {
  const sql = 'SELECT sp_tarjeta_consumo($1,$2,$3,$4,$5) AS data';
  return db.query(sql, [tarjeta_id, monto, descripcion || null, actorRol, actorClienteId]);
}
function spPago({ tarjeta_id, cuenta_origen_id, monto, actorRol, actorClienteId }) {
  const sql = 'SELECT sp_tarjeta_pago($1,$2,$3,$4,$5) AS data';
  return db.query(sql, [tarjeta_id, cuenta_origen_id, monto, actorRol, actorClienteId]);
}


module.exports = {
    spConsumo,
    spPago
}