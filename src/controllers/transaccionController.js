const { page } = require('pdfkit');
const model = require('../models/transaccionModel');
const { generarEstadoCuentaPdf } = require('../utils/pdfService');

const toInt = v => (v === '' || v === null || v === undefined ? NaN : Number(v));
const toNum = v => (v === '' || v === null || v === undefined ? NaN : Number(v));

const TIPOS_PERMITIDOS = new Set(['Deposito', 'Retiro']);

exports.registrarTransaccion = async (req, res, next) => {
  try {
    const cuenta_id = toInt(req.body?.cuenta_id);
    const tipoRaw   = String(req.body?.tipo || '').trim();
    const monto     = toNum(req.body?.monto);

    if (!Number.isInteger(cuenta_id) || cuenta_id <= 0) return res.fail(400, 'cuenta_id inválida');
    if (!TIPOS_PERMITIDOS.has(tipoRaw)) return res.fail(400, 'tipo inválido (use: Deposito | Retiro)');
    if (!Number.isFinite(monto) || monto <= 0) return res.fail(400, 'monto debe ser > 0');

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;
    const actorId = req.user?.id ?? req.user?.sub ?? null;

    const { rows } = await model.registrarTransaccionSP({
      cuenta_id,
      tipo: tipoRaw, // 'Deposito' o 'Retiro'
      monto,
      actorRol,
      actorClienteId
    });

    const data = rows?.[0]?.data;
    if (!data?.transaccion) return res.fail(500, 'No se pudo registrar la transacción');

    // log no bloqueante
    logService.registrarLog({
      usuario_id: actorId,
      accion: tipoRaw === 'Deposito' ? LogActions.DEPOSITO : LogActions.RETIRO,
      descripcion: `${tipoRaw} en cuenta ${cuenta_id} por ${monto}`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      request_id: req.context?.requestId ?? null,
    }).catch(() => {});

    return res.status(201).success(data); // { data, meta, error } según tu middleware
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};


exports.depositar = async (req, res, next) => {
  try {
    const cuenta_id = toInt(req.body?.cuenta_id);
    const monto     = toNum(req.body?.monto);

    if (!Number.isInteger(cuenta_id) || cuenta_id <= 0) return res.fail(400, 'cuenta_id inválida');
    if (!Number.isFinite(monto) || monto <= 0)          return res.fail(400, 'monto debe ser > 0');

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;
    const actorId = req.user?.id ?? req.user?.sub ?? null;

    const { rows } = await model.registrarTransaccionSP({
      cuenta_id, tipo: 'Deposito', monto, actorRol, actorClienteId
    });
    const data = rows?.[0]?.data;
    if (!data?.transaccion) return res.fail(500, 'No se pudo registrar el depósito');

    logService.registrarLog({
      usuario_id: actorId,
      accion: LogActions.DEPOSITO,
      descripcion: `Depósito en cuenta ${cuenta_id} por ${monto}`,
      ip: req.ip, user_agent: req.headers['user-agent']
    }).catch(()=>{});

    return res.status(201).success(data);
  } catch (error) {
    error.status = error.status || 500; return next(error);
  }
};

exports.retirar = async (req, res, next) => {
  try {
    const cuenta_id = toInt(req.body?.cuenta_id);
    const monto     = toNum(req.body?.monto);

    if (!Number.isInteger(cuenta_id) || cuenta_id <= 0) return res.fail(400, 'cuenta_id inválida');
    if (!Number.isFinite(monto) || monto <= 0)          return res.fail(400, 'monto debe ser > 0');

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;
    const actorId = req.user?.id ?? req.user?.sub ?? null;

    const { rows } = await model.registrarTransaccionSP({
      cuenta_id, tipo: 'Retiro', monto, actorRol, actorClienteId
    });
    const data = rows?.[0]?.data;
    if (!data?.transaccion) return res.fail(500, 'No se pudo registrar el retiro');

    logService.registrarLog({
      usuario_id: actorId,
      accion: LogActions.RETIRO,
      descripcion: `Retiro en cuenta ${cuenta_id} por ${monto}`,
      ip: req.ip, user_agent: req.headers['user-agent']
    }).catch(()=>{});

    return res.status(201).success(data);
  } catch (error) {
    error.status = error.status || 500; return next(error);
  }
};

// Historial con filtros (por cuenta y rango de fechas)
exports.getHistorialConFiltros = async (req, res, next) => {
  try {
    const cliente_id  = req.user?.cliente_id;
    const cuenta_id   = toInt(req.query?.cuenta_id);
    const fecha_inicio = new Date(req.query?.fecha_inicio);
    const fecha_fin    = new Date(req.query?.fecha_fin);
    const limit = toInt(req.query?.limit) || 50;
    const offset = toInt(req.query?.offset) || 0;

    if (!cliente_id) return res.fail(401, 'No autorizado');
    if (!Number.isInteger(cuenta_id) || cuenta_id <= 0) return res.fail(400, 'cuenta_id inválida');
    if (isNaN(fecha_inicio.getTime()) || isNaN(fecha_fin.getTime())) return res.fail(400, 'fechas inválidas');
    if (fecha_inicio > fecha_fin) return res.fail(400, 'fecha_inicio > fecha_fin');

    const { rows } = await model.obtenerTransaccionesFiltradasSP({
      cliente_id, cuenta_id,
      fecha_inicio: fecha_inicio.toISOString(),
      fecha_fin: fecha_fin.toISOString(),
      limit, offset
    });

    const data = rows?.[0]?.data ?? { items: [], pagination: { limit, offset, total: 0 } };
    return res.success(data);
  } catch (error) {
    error.status = error.status || 500; return next(error);
  }
};

// PDF (si lo quieres aquí)
exports.getEstadoCuentaPdf = async (req, res, next) => {
  try {
    const cliente_id = req.user?.cliente_id;
    const cuenta_id  = toInt(req.query?.cuenta_id);
    const fIni = new Date(req.query?.fecha_inicio);
    const fFin = new Date(req.query?.fecha_fin);

    if (!cliente_id) return res.fail(401, 'No autorizado');
    if (!Number.isInteger(cuenta_id) || cuenta_id <= 0) return res.fail(400, 'cuenta_id inválida');
    if (isNaN(fIni.getTime()) || isNaN(fFin.getTime())) return res.fail(400, 'fechas inválidas');
    if (fIni > fFin) return res.fail(400, 'fecha_inicio > fecha_fin');

    const { rows } = await model.obtenerEstadoCuentaPeriodoSP({
      cliente_id, cuenta_id,
      fecha_inicio: fIni.toISOString(), fecha_fin: fFin.toISOString(),
      limit: 1000, offset: 0
    });

    const data = rows?.[0]?.data;
    if (!data) return res.fail(404, 'Sin datos para el período');

    const cliente = { nombre: req.user?.nombre || 'No registrado', email: req.user?.email || '' };
    const periodo = {
      cuenta_id,
      fecha_inicio: data.resumen?.fecha_inicio,
      fecha_fin:    data.resumen?.fecha_fin,
      saldo_inicial: data.resumen?.saldo_inicial,
      creditos:      data.resumen?.creditos,
      debitos:       data.resumen?.debitos,
      saldo_final:   data.resumen?.saldo_final
    };

    const pdf = generarEstadoCuentaPdf(cliente, data.items || [], periodo);
    res.setHeader('Content-Disposition', 'attachment; filename=estado_cuenta.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    pdf.pipe(res);
  } catch (error) {
    error.status = error.status || 500; 
    return next(error);
  }
};
