const pool = require('../config/db');
const model = require('../models/tarjetaModel');
const { registrarLog } = ('../services/logService');
const LogActions = require('../constants/logAction');

const toInt = v => (v === '' || v === null || v === undefined ? NaN : Number(v));
const isNumber = (v) => typeof v === 'number' && !Number.isNaN(v);

exports.crearTarjeta = async (req, res, next) => {
  try {
    const cuenta_id = toInt(req.body?.cuenta_id);
    const tipo = String(req.body?.tipo || '').toLowerCase().trim();
    const limite_credito = req.body?.limite_credito !== undefined ? toNum(req.body.limite_credito) : null;

    if (!Number.isInteger(cuenta_id) || cuenta_id <= 0) return res.fail(400, 'cuenta_id inválido');
    if (!['debito', 'credito'].includes(tipo)) return res.fail(400, "tipo inválido (use: 'debito' | 'credito')");
    if (tipo === 'credito' && (!Number.isFinite(limite_credito) || limite_credito <= 0)) {
      return res.fail(400, 'limite_credito debe ser > 0 para tarjetas de crédito');
    }

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;
    const actorId = req.user?.id ?? req.user?.sub ?? null;

    const { rows } = await model.crearTarjetaSP({ cuenta_id, tipo, limite_credito, actorRol, actorClienteId });
    const data = rows?.[0]?.data;
    if (!data?.id) return res.fail(500, 'No se pudo crear la tarjeta');

    logService.registrarLog({
      usuario_id: actorId,
      accion: LogActions.CREATE_CARD,
      descripcion: `Tarjeta ${data.id} (${tipo}) creada para cuenta ${cuenta_id}${tipo === 'credito' ? `, límite ${limite_credito}` : ''}`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      request_id: req.context?.requestId ?? null,
    }).catch(()=>{});

    return res.status(201).success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};

exports.cambiarEstado = async (req, res, next) => {
  try {
    const tarjeta_id = toInt(req.params?.id);
    const nuevo_estado = String(req.body?.nuevo_estado || '').toUpperCase().trim();
    const motivo = (req.body?.motivo || '').trim() || null;

    if (!Number.isInteger(tarjeta_id) || tarjeta_id <= 0) return res.fail(400, 'tarjeta_id inválido');
    if (!['ACTIVA','BLOQUEADA','REPORTADA','CANCELADA'].includes(nuevo_estado)) {
      return res.fail(400, "nuevo_estado inválido (use: ACTIVA | BLOQUEADA | REPORTADA | CANCELADA)");
    }

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;
    const actorId = req.user?.id ?? req.user?.sub ?? null;

    const { rows } = await model.cambiarEstadoTarjetaSP({
      tarjeta_id, nuevo_estado, motivo, actorId, actorRol, actorClienteId
    });
    const data = rows?.[0]?.data;
    if (!data) return res.fail(500, 'No se pudo cambiar el estado');

    logService.registrarLog({
      usuario_id: actorId,
      accion: LogActions.CARD_STATUS_CHANGE,
      descripcion: `Tarjeta ${tarjeta_id}: ${data.estado_anterior} → ${data.estado_nuevo}${motivo ? ` (motivo: ${motivo})` : ''}`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    }).catch(()=>{});

    return res.success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};


exports.reportarTarjeta = async (req, res, next) => {
  try {
    const tarjeta_id = toInt(req.params?.id);
    const motivo = (req.body?.motivo || '').trim();

    if (!Number.isInteger(tarjeta_id) || tarjeta_id <= 0) return res.fail(400, 'tarjeta_id inválido');
    if (!motivo) return res.fail(400, 'motivo es obligatorio');

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;
    const actorId = req.user?.id ?? req.user?.sub ?? null;

    const { rows } = await model.reportarTarjetaSP({ tarjeta_id, motivo, actorId, actorRol, actorClienteId });
    const data = rows?.[0]?.data;
    if (!data) return res.fail(500, 'No se pudo reportar la tarjeta');

    logService.registrarLog({
      usuario_id: actorId,
      accion: LogActions.CARD_REPORTED,
      descripcion: `Tarjeta ${tarjeta_id} reportada (motivo: ${motivo})`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    }).catch(()=>{});

    return res.success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};


exports.detalleTarjeta = async (req, res, next) => {
  try {
    const tarjeta_id = toInt(req.params?.id);
    if (!Number.isInteger(tarjeta_id) || tarjeta_id <= 0) return res.fail(400, 'tarjeta_id inválido');

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;

    const { rows } = await model.detalleTarjetaSP({ tarjeta_id, actorRol, actorClienteId });
    const data = rows?.[0]?.data;
    if (data?.error) return res.fail(403, 'No autorizado');
    if (!data?.tarjeta) return res.fail(404, 'Tarjeta no encontrada');

    return res.success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};

/**
 * GET /tarjetas?cuenta_id=..&limit=..&offset=..
 */
exports.listarPorCuenta = async (req, res, next) => {
  try {
    const cuenta_id = toInt(req.query?.cuenta_id);
    const limit  = toInt(req.query?.limit)  || 50;
    const offset = toInt(req.query?.offset) || 0;

    if (!Number.isInteger(cuenta_id) || cuenta_id <= 0) return res.fail(400, 'cuenta_id inválido');

    const { rows } = await model.listarTarjetasPorCuentaSP({ cuenta_id, limit, offset });
    const data = rows?.[0]?.data ?? { items: [], pagination: { limit, offset, total: 0 } };

    return res.success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};

exports.actualizarLimite = async (req, res, next) => {
  try {
    const tarjeta_id   = toInt(req.params?.id);
    const nuevo_limite = toNum(req.body?.nuevo_limite);

    if (!Number.isInteger(tarjeta_id) || tarjeta_id <= 0) return res.fail(400, 'tarjeta_id inválido');
    if (!Number.isFinite(nuevo_limite) || nuevo_limite <= 0) return res.fail(400, 'nuevo_limite debe ser > 0');

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;
    const actorId = req.user?.id ?? req.user?.sub ?? null;

    const { rows } = await model.actualizarLimiteTarjetaSP({
      tarjeta_id, nuevo_limite, actorId, actorRol, actorClienteId
    });
    const data = rows?.[0]?.data;
    if (!data?.tarjeta_id) return res.fail(500, 'No se pudo actualizar el límite');

    logService.registrarLog({
      usuario_id: actorId,
      accion: LogActions.CARD_LIMIT_UPDATED,
      descripcion: `Tarjeta ${tarjeta_id}: límite actualizado a ${nuevo_limite}`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    }).catch(()=>{});

    return res.success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};

  