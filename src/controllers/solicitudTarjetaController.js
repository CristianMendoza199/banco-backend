const model = require('../models/solicitudTarjetaModel');
const tarjetaModel = require('../models/tarjetaModel');
const logService = require('../services/logService');
const { LogActions } = require('../constants/logAction');

const toInt = v => (v === '' || v === null || v === undefined ? NaN : Number(v));
const toNum = v => (v === '' || v === null || v === undefined ? NaN : Number(v));

exports.crear = async (req, res, next) => {
  try {
    const cliente_id = req.user?.cliente_id ?? null;
    const cuenta_id  = toInt(req.body?.cuenta_id);
    const tipo       = String(req.body?.tipo || '').toLowerCase().trim();
    const limite_solicitado = req.body?.limite_solicitado !== undefined ? toNum(req.body.limite_solicitado) : null;

    if (!cliente_id) return res.fail(401, 'No autorizado');
    if (!Number.isInteger(cuenta_id) || cuenta_id <= 0) return res.fail(400, 'cuenta_id inválido');
    if (!['debito','credito'].includes(tipo)) return res.fail(400, "tipo inválido (debito|credito)");
    if (tipo === 'credito' && (!Number.isFinite(limite_solicitado) || limite_solicitado <= 0)) {
      return res.fail(400, 'limite_solicitado debe ser > 0 para crédito');
    }

    const { rows } = await model.crearSolicitudTarjeta({ cliente_id, cuenta_id, tipo, limite_solicitado });
    const data = rows?.[0]?.data;
    if (!data?.id) return res.fail(500, 'No se pudo crear la solicitud');

    logService?.registrarLog?.({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.SOLICITUD_TARJETA_CREAR,
      descripcion: `Solicitud tarjeta (${tipo}) creada para cuenta ${cuenta_id}`,
      ip: req.ip, user_agent: req.headers['user-agent']
    }).catch(()=>{});

    return res.status(201).success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};

exports.listar = async (req, res, next) => {
  try {
    const estado = req.query?.estado ? String(req.query.estado).toUpperCase().trim() : null;
    if (estado && !['PENDIENTE','APROBADA','RECHAZADA'].includes(estado))
      return res.fail(400, 'estado inválido');

    const isAdmin = req.user?.rol === 'admin';
    const cliente_id = isAdmin ? null : (req.user?.cliente_id ?? null);
    if (!isAdmin && !cliente_id) return res.fail(401, 'No autorizado');

    const { rows } = await model.listarSolicitudesTarjeta({ estado, cliente_id });
    const data = rows?.[0]?.data ?? [];
    return res.success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};

exports.aprobar = async (req, res, next) => {
  try {
    if (req.user?.rol !== 'admin') return res.fail(403, 'Solo admin');
    const id = toInt(req.params?.id);
    const limiteAprobado = req.body?.limite_aprobado !== undefined ? toNum(req.body.limite_aprobado) : null;
    const observacion = (req.body?.observacion || '').trim() || null;

    if (!Number.isInteger(id) || id <= 0) return res.fail(400, 'id inválido');

    const { rows } = await model.decidirSolicitudTarjeta({
      id,
      nuevoEstado: 'APROBADA',
      decididoPor: req.user?.id ?? req.user?.sub ?? null,
      observacion,
      limiteAprobado
    });
    const solicitud = rows?.[0]?.data;
    if (!solicitud || solicitud.estado !== 'APROBADA') {
      return res.fail(409, 'No se pudo aprobar (no existe o no está PENDIENTE)');
    }

    // Emitir tarjeta
    const actorRol = 'admin';
    const actorClienteId = solicitud.cliente_id;
    // Para crédito, usa tu sp_tarjeta_crear; para demo, muestro débito por cuenta si fuera el caso:
    // const { rows: r2 } = await tarjetaModel.emitirDebitoPorCuenta({
    //   cuenta_id: solicitud.cuenta_id, actorRol, actorClienteId
    // });
    // const tarjeta = r2?.[0]?.data?.tarjeta;

    // Si tienes sp_tarjeta_crear para crédito:
    // const { rows: r2 } = await tarjetaCreditoModel.crearTarjetaSP({...});
    // const tarjeta = r2?.[0]?.data;

    const tarjeta = null; // ← reemplaza con tu creación real de tarjeta de crédito

    logService?.registrarLog?.({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.SOLICITUD_TARJETA_APROBADA,
      descripcion: `Solicitud ${id} APROBADA. Tarjeta emitida (${solicitud.tipo})`,
      ip: req.ip, user_agent: req.headers['user-agent']
    }).catch(()=>{});

    return res.status(201).success({ solicitud, tarjeta });
  } catch (err) { err.status = err.status || 500; return next(err); }
};

exports.rechazar = async (req, res, next) => {
  try {
    if (req.user?.rol !== 'admin') return res.fail(403, 'Solo admin');
    const id = toInt(req.params?.id);
    const observacion = (req.body?.motivo || req.body?.observacion || '').trim();

    if (!Number.isInteger(id) || id <= 0) return res.fail(400, 'id inválido');
    if (!observacion) return res.fail(400, 'motivo/observacion es obligatorio');

    const { rows } = await model.decidirSolicitudTarjeta({
      id,
      nuevoEstado: 'RECHAZADA',
      decididoPor: req.user?.id ?? req.user?.sub ?? null,
      observacion
    });
    const solicitud = rows?.[0]?.data;
    if (!solicitud || solicitud.estado !== 'RECHAZADA') {
      return res.fail(409, 'No se pudo rechazar (no existe o no está PENDIENTE)');
    }

    logService?.registrarLog?.({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.SOLICITUD_TARJETA_RECHAZADA,
      descripcion: `Solicitud ${id} RECHAZADA (${observacion})`,
      ip: req.ip, user_agent: req.headers['user-agent']
    }).catch(()=>{});

    return res.success({ solicitud });
  } catch (err) { err.status = err.status || 500; return next(err); }
};

