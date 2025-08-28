
const model = require('../models/creditoModel');
const logService = require('../services/logService');
const LogActions = require('../constants/logAction');

// POST: asignar crédito
exports.crearCredito = async (req, res) => {
  try {
    const cliente_id = req.user.cliente_id;  // viene del JWT
    const { monto_total, tasa_interes, numero_cuotas } = req.body;

    const credito = await model.asignarCredito({ cliente_id, monto_total, tasa_interes, numero_cuotas });

    await logService.registrarLog({
      usuario_id: req.user.id,
      accion: LogActions.CREDITO_ASIGNADO,
      descripcion: `Crédito asignado al cliente ID ${cliente_id}, monto: ${monto_total}, numero de cuotas: ${numero_cuotas} , interés: ${tasa_interes}%`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      status_code: 201,
      status_desc: 'Crédito asignado correctamente',
      data: credito
    });

  } catch (error) {
    console.error('Error al asignar crédito:', error.message);
    res.status(500).json({
      success: false,
      status_code: 500,
      status_desc: 'Error al asignar crédito',
      error: error.message
    });
  }
};

exports.getMisCreditos = async (req, res) => {
  try {
    const cliente_id = req.user.cliente_id;

    const creditos = await model.obtenerCreditosPorCliente(cliente_id);

    res.status(200).json({
      status_code: 200,
      creditos
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status_desc: 'Error al obtener créditos',
      error: error.message
    });
  }
};


exports.getCuotas = async (req, res) => {
  try {
    const { id } = req.params; // ID del crédito
    const cuotas = await model.obtenerCuotasPorCredito(id);

    res.status(200).json({
      status_code: 200,
      status_desc: "Cuotas obtenidas correctamente",
      cuotas
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status_desc: "Error al obtener cuotas",
      error: error.message
    });
  }
};



// Pagar cuota
exports.pagarCuota = async (req, res) => {
  try {
    const { cuota_id, cuenta_id } = req.body;

    await model.pagarCuota(cuota_id, cuenta_id);

    // registrar log
    await logService.registrarLog({
      usuario_id: req.user?.id,
      action: LogActions.PAGO_CREDITO,
      description: `Pago de cuota ${cuota_id} desde cuenta ${cuenta_id}`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.status(200).json({
      status_code: 200,
      status_desc: "Cuota pagada correctamente"
    });
  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status_desc: "Error al pagar cuota",
      error: error.message
    });
  }
};

