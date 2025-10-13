const model = require('../models/tarjetaCreditoModel');
const db = require('../config/db');
const logService = require('../services/logService');
const { LogActions } = require('../constants/logAction');

const toInt = v => (v === '' || v === null || v === undefined ? NaN : Number(v));
const toNum = v => (v === '' || v === null || v === undefined ? NaN : Number(v));

exports.consumo = async (req, res, next) => {
  try {
    const tarjeta_id = toInt(req.params?.id);
    const monto = toNum(req.body?.monto);
    const descripcion = (req.body?.descripcion || '').trim();

    if (!Number.isInteger(tarjeta_id) || tarjeta_id <= 0) return res.fail(400, 'tarjeta_id inválido');
    if (!Number.isFinite(monto) || monto <= 0) return res.fail(400, 'monto debe ser > 0');

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;
    const actorId = req.user?.id ?? req.user?.sub ?? null;

    const { rows } = await spConsumo({ tarjeta_id, monto, descripcion, actorRol, actorClienteId });
    const data = rows?.[0]?.data;
    if (!data?.consumo) return res.fail(500, 'No se pudo registrar el consumo');

    logService.registrarLog({
      usuario_id: actorId,
      accion: LogActions.CARD_PURCHASE,
      descripcion: `Consumo tarjeta ${tarjeta_id} por ${monto}`,
      ip: req.ip, user_agent: req.headers['user-agent']
    }).catch(()=>{});

    return res.status(201).success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};


exports.pago = async (req, res, next) => {
  try {
    const tarjeta_id = toInt(req.params?.id);
    const cuenta_origen_id = toInt(req.body?.cuenta_origen_id);
    const monto = toNum(req.body?.monto);

    if (!Number.isInteger(tarjeta_id) || tarjeta_id <= 0) return res.fail(400, 'tarjeta_id inválido');
    if (!Number.isInteger(cuenta_origen_id) || cuenta_origen_id <= 0) return res.fail(400, 'cuenta_origen_id inválida');
    if (!Number.isFinite(monto) || monto <= 0) return res.fail(400, 'monto debe ser > 0');

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;
    const actorId = req.user?.id ?? req.user?.sub ?? null;

    const { rows } = await spPago({ tarjeta_id, cuenta_origen_id, monto, actorRol, actorClienteId });
    const data = rows?.[0]?.data;
    if (!data?.pago_tarjeta) return res.fail(500, 'No se pudo registrar el pago');

    logService.registrarLog({
      usuario_id: actorId,
      accion: LogActions.CARD_PAYMENT,
      descripcion: `Pago tarjeta ${tarjeta_id} por ${monto} desde cuenta ${cuenta_origen_id}`,
      ip: req.ip, user_agent: req.headers['user-agent']
    }).catch(()=>{});

    return res.status(201).success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};
