
const model = require('../models/creditoModel');

// POST: asignar crédito
exports.crearCredito = async (req, res) => {
  try {
    const result = await model.asignarCredito(req.body); // req.body tiene: cliente_id, monto, tasa_interes

    await registrarLog({
        usuario_id: req.user.id,
        accion: 'CREAR_CREDITO',
        descripcion: `Crédito asignado al cliente ID ${cliente_id}, monto: ${monto_total}, interés: ${tasa_interes}%`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
    });
    
    res.status(201).json({
      status_code: 201,
      status_desc: 'Crédito asignado correctamente',
      result: result.rows[0] ?? null
    });

  } catch (error) {
    console.error('Error en controlador al asignar crédito:', error.message);
    res.status(500).json({
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


