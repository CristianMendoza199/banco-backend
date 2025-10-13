const model = require("../models/creditoModel");
const logService = require("../services/logService");
const LogActions = require("../constants/logAction");
const { toInt, toNum } = require("../utils/casters");

// POST: asignar crédito
exports.crearCredito = async (req, res, next) => {
  try {
    // si lo mantienes: SOLO admin
    if (req.user?.rol !== "admin") return res.fail(403, "No autorizado");

    const cliente_id = toInt(req.body?.cliente_id ?? req.user?.cliente_id);
    const monto_total = toNum(req.body?.monto_total);
    const tasa_interes = toNum(req.body?.tasa_interes);
    const numero_cuotas = toInt(req.body?.numero_cuotas);

    if (!Number.isInteger(cliente_id) || cliente_id <= 0)
      return res.fail(400, "cliente_id inválido");
    if (!Number.isFinite(monto_total) || monto_total <= 0)
      return res.fail(400, "monto_total debe ser > 0");
    if (
      !Number.isFinite(tasa_interes) ||
      tasa_interes < 0 ||
      tasa_interes > 100
    )
      return res.fail(400, "tasa_interes fuera de rango (0-100)");
    if (!Number.isInteger(numero_cuotas) || numero_cuotas < 1)
      return res.fail(400, "numero_cuotas debe ser >= 1");

    const { rows } = await model.asignarCreditoSP({
      cliente_id,
      monto_total,
      tasa_interes,
      numero_cuotas,
    });
    const credito = rows?.[0]?.data;
    if (!credito) return res.fail(500, "No se pudo crear el crédito");

    logService
      .registrarLog({
        usuario_id: req.user?.id ?? req.user?.sub ?? null,
        accion: LogActions.CREDITO_ASIGNADO,
        descripcion: `Crédito asignado al cliente ${cliente_id} (monto: ${monto_total}, cuotas: ${numero_cuotas}, interés: ${tasa_interes}%)`,
        ip: req.ip,
        user_agent: req.headers["user-agent"],
        request_id: req.context?.requestId ?? null,
      })
      .catch(() => {});

    return res.status(201).success(credito);
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

exports.getMisCreditos = async (req, res, next) => {
  try {
    const cliente_id = toInt(req.user?.cliente_id);
    if (!Number.isInteger(cliente_id) || cliente_id <= 0) {
      return res.fail(401, "No autorizado");
    }

    // filtros opcionales por query
    const estado = (req.query?.estado || "").toString().trim() || null; // ej. ACTIVO, CERRADO
    const limit = req.query?.limit ? Number(req.query.limit) : 50;
    const offset = req.query?.offset ? Number(req.query.offset) : 0;

    const { rows } = await model.obtenerCreditosPorClienteSP({
      cliente_id,
      estado,
      limit,
      offset,
    });

    const data = rows?.[0]?.data ?? {
      items: [],
      pagination: { limit, offset, total: 0 },
    };
    return res.success(data); // { items:[...], pagination:{...} }
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

exports.getCuotas = async (req, res, next) => {
  try {
    const credito_id = toInt(req.params?.id);
    if (!Number.isInteger(credito_id) || credito_id <= 0) {
      return res.fail(400, 'credito_id inválido');
    }

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;

    const { rows } = await model.obtenerCuotasPorCreditoSP({
      credito_id,
      actorRol,
      actorClienteId,
      limit: Number(req.query?.limit ?? 50),
      offset: Number(req.query?.offset ?? 0),
    });

    const data = rows?.[0]?.data ?? { items: [], pagination: { limit: 50, offset: 0, total: 0 } };
    return res.success(data); // { items: [...], pagination: {...} }
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

// Pagar cuota
exports.pagarCuota = async (req, res, next) => {
  try {
    const cuota_id  = toInt(req.body?.cuota_id);
    const cuenta_id = toInt(req.body?.cuenta_id);

    if (!Number.isInteger(cuota_id)  || cuota_id  <= 0) return res.fail(400, 'cuota_id inválido');
    if (!Number.isInteger(cuenta_id) || cuenta_id <= 0) return res.fail(400, 'cuenta_id inválido');

    const actorRol = req.user?.rol || 'cliente';
    const actorClienteId = req.user?.cliente_id ?? null;

    const { rows } = await model.pagarCuotaSP({ cuota_id, cuenta_id, actorRol, actorClienteId });
    const data = rows?.[0]?.data;
    if (!data?.ok) return res.fail(500, 'No se pudo pagar la cuota');

    logService.registrarLog({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.PAGO_CREDITO,
      descripcion: `Pago de cuota ${cuota_id} desde cuenta ${cuenta_id}`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      request_id: req.context?.requestId ?? null,
    }).catch(() => {});

    return res.status(200).success(data); // { ok: true, cuota:{...}, credito:{...} }
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};