const solicitudModel = require("../models/solicitudCreditoModel");
const creditoModel = require("../models/creditoModel");
const logService = require("../services/logService");
const LogActions = require("../constants/logAction");

const toNumber = (v) =>
  v === "" || v === null || v === undefined ? NaN : Number(v);
const ALLOWED_STATES = new Set(["PENDIENTE", "APROBADO", "RECHAZADO"]);

exports.crearSolicitud = async (req, res, next) => {
  try {
    const cliente_id = req.user?.cliente_id ?? null;

    const monto_solicitado = toNumber(req.body?.monto_solicitado);
    const numero_cuotas = toNumber(req.body?.numero_cuotas);

    if (!cliente_id) return res.fail(401, "No autorizado");

    if (!Number.isFinite(monto_solicitado) || monto_solicitado < 0) {
      return res.fail(400, "Debe ingresar un monto mayor a 0");
    }
    if (!Number.isInteger(numero_cuotas) || numero_cuotas < 0) {
      return res.fail(400, "Numero de cuots obligatorias");
    }

    const solicitud = await solicitudModel.crearSolicitudSP({
      cliente_id,
      monto_solicitado,
      numero_cuotas,
    });

    await logService.registrarLog({
      usuario_id: req.user.id ?? req.user?.sub ?? null,
      accion: LogActions.SOLICITUD_CREDITO,
      descripcion: `Solicitud de crédito por ${monto_solicitado} 
      en ${numero_cuotas} cuotas(s) para el cliente
      ${cliente_id}`,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    res.status(201).success(solicitud);
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

exports.obtenerSolicitudes = async (req, res, next) => {
  try {
    let { estado } = req.query || {};
    estado = (estado || "").toString().trim().toUpperCase();
    if (estado && !ALLOWED_STATES.has(estado)) {
      return res.fail(
        400,
        "estdo inválido(use: PENDIENTE, APROBADO O RECHAZADO)"
      );
    }

    const isAdmin = req.user?.rol === "admin";
    const clienteId = isAdmin ? null : req.user?.cliente_id;

    const result = await solicitudModel.obtenerSolicitudesSP({
      estado: estado || null,
      cliente_id: clienteId,
    });
    const rows = result?.rows ?? [];

    return res.success(rows);
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

exports.aprobarSolicitud = async (req, res, next) => {
  try {
    const id = Number(req.params?.id);
    if (!Number.isInteger(id) || id <= 0)
      return res.fail(400, "id debe ser un entero > 0");

    const tasa_interes =
      req.body?.tasa_interes !== undefined
        ? Number(req.body.tasa_interes)
        : undefined;
    const observacion = (req.body?.observacion || "").trim() || null;

    const { rows } = await solicitudModel.actualizarEstadoSolicitud({
      id,
      nuevoEstado: "APROBADO",
      decididoPor: req.user?.id ?? req.user?.sub ?? null,
      observacion,
      tasa_interes: Number.isFinite(tasa_interes) ? tasa_interes : null,
    });

    const solicitud = rows?.[0]?.data; // ✅ JSONB de la SP
    if (!solicitud || solicitud.estado !== "APROBADO") {
      return res.fail(
        400,
        "No se puede aprobar: solicitud inexistente o no está PENDIENTE"
      );
    }

    // Validar tasa_final (prioriza body, si no, usa la de la solicitud)
    const tasaFinal = Number.isFinite(tasa_interes)
      ? tasa_interes
      : Number(solicitud.tasa_interes);
    if (!Number.isFinite(tasaFinal)) {
      return res.fail(422, "tasa_interes requerida para generar el crédito");
    }

    // Crear crédito real (tu SP/Modelo de crédito)
    const credito = await creditoModel.asignarCredito({
      cliente_id: solicitud.cliente_id,
      monto_total: Number(solicitud.monto_solicitado),
      tasa_interes: Number(tasaFinal),
      numero_cuotas: Number(solicitud.numero_cuotas),
    });

    await logService.registrarLog({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.CREDITO_ASIGNADO,
      descripcion: `Solicitud #${id} APROBADA. Crédito #${credito?.id} para cliente ${solicitud.cliente_id}`,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    return res.status(201).success({ solicitud, credito });
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

exports.rechazarSolicitud = async (req, res) => {
  try {
    const id = toNumber(req.params?.id);

    const motivo = (req.body?.motivo || "").trim();

    if (!Number.isInteger(id) || id <= 0)
      return res.fail(400, "id debe ser un entero > 0");
    if (!motivo) return res.fail(400, "motivo es obligatorio para rechazar");

    const upd = await solicitudModel.actualizarEstadoSiPendiente({
      id,
      nuevoEstado: "RECHAZADO",
      observacion: motivo,
      decididoPor: req.user?.id ?? req.user?.sub ?? null,
    });

    const solicitud = rows?.[0]?.data; // ✅ aquí está el JSONB que devuelve la SP
    if (!solicitud || solicitud.estado !== "RECHAZADO") {
      return res.fail(
        409,
        "No se puede rechazar: solicitud inexistente o no está PENDIENTE"
      );
    }

    await logService.registrarLog({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.CREDITO_RECHAZADO,
      descripcion: `Solicitud de crédito ${id} RECHAZADA (Motivo: ${motivo})`,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    return res.success({ solicitud });
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};
