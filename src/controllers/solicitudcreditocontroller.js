const solicitudModel = require('../models/solicitudCreditoModel');
const creditoModel = require('../models/creditoModel');
const logService = require('../services/logService');
const LogActions =  require('../constants/logAction')

exports.crearSolicitud = async (req, res) => {
  try {
    const cliente_id = req.user.cliente_id;
    const { monto_solicitado, tasa_interes, numero_cuotas } = req.body;

    const solicitud = await solicitudModel.crearSolicitud({ cliente_id, monto_solicitado, tasa_interes, numero_cuotas });

    await logService.registrarLog({
      usuario_id: cliente_id,
      accion: LogActions.SOLICITUD_CREDITO,
      descripcion: `Solicitud de crédito por ${monto_solicitado}`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.status(201).json({ success: true, solicitud });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.obtenerSolicitudes = async (req, res) => {
  try {
    const { estado } = req.query;
    const solicitudes = await solicitudModel.obtenerSolicitudes(estado);
    res.json({ success: true, solicitudes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.aprobarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await solicitudModel.actualizarEstadoSolicitud(id, 'Aprobado');

    // Crear crédito real
    const credito = await creditoModel.asignarCredito({
      cliente_id: solicitud.cliente_id,
      monto_total: solicitud.monto_solicitado,
      tasa_interes: solicitud.tasa_interes,
      numero_cuotas: solicitud.numero_cuotas
    });

    await logService.registrarLog({
      usuario_id: req.user.id,
      accion: LogActions.CREDITO_ASIGNADO,
      descripcion: `Crédito aprobado ID ${credito.id} para cliente ${credito.cliente_id}`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json({ success: true, credito });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.rechazarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await solicitudModel.actualizarEstadoSolicitud(id, 'Rechazado');

    await logService.registrarLog({
      usuario_id: req.user.id,
      accion: LogActions.CREDITO_RECHAZADO,
      descripcion: `Solicitud de crédito ${id} rechazada`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json({ success: true, solicitud });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};