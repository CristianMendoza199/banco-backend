const transferenciaModel = require('../models/transferenciaModel');
const logService = require('../services/logService');
const LogActions =  require('../constants/logAction');

exports.transferir = async (req, res, next) => { 
  try {
    const cuenta_origen  = Number(req.body?.cuenta_origen);
    const cuenta_destino = Number(req.body?.cuenta_destino);
    const monto          = Number(req.body?.monto);
    if (!Number.isInteger(cuenta_origen) || cuenta_origen<=0) 
       return res.fail(400,'cuenta_origen inválida');
    if (!Number.isInteger(cuenta_destino)|| cuenta_destino<=0)
       return res.fail(400,'cuenta_destino inválida');
    if (cuenta_origen === cuenta_destino)
       return res.fail(400,'Las cuentas deben ser distintas');
    if (!Number.isFinite(monto) || monto<=0) 
      return res.fail(400,'monto debe ser > 0');

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;
    const actorId = req.user?.id ?? req.user?.sub ?? null;
    const idempotencyKey = req.headers['x-idempotency-key'] || null;

    const { rows } = await transferenciaModel.realizarTransferenciaSP({
      cuenta_origen, cuenta_destino, monto, actorRol, actorClienteId, actorId, idempotencyKey
    });
    const data = rows?.[0]?.data;
    if (!data?.transfer) return res.fail(500, 'No se pudo realizar la transferencia');

    logService.registrarLog({
      usuario_id: actorId,
      accion: LogActions.TRANSFERENCIA_REALIZADA,
      descripcion: `Transferencia ${data.transfer.id}: ${cuenta_origen} → ${cuenta_destino} por ${monto}`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      request_id: req.context?.requestId ?? null,
    }).catch(()=>{});

    return res.status(200).success(data);
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};