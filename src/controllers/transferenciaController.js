const transferenciaModel = require('../models/transferenciaModel');
const logService = require('../services/logService');
const logAction = require('../constants/logAction');

exports.transferir = async (req, res) => {
  try {
    const { cuenta_origen, cuenta_destino, monto } = req.body;

    if (!cuenta_origen || !cuenta_destino || !monto) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios',
      });
    }

    const result = await transferenciaModel.realizarTransferencia({
      cuenta_origen,
      cuenta_destino,
      monto,
    });

    await logService.registrarLog({
      usuario_id: req.user.id,
      accion: logAction.TRANSFERENCIA_REALIZADA,
      descripcion: `trasnferencia realizada 
        cuenta origen ${cuenta_origen} 
        cuenta destino ${cuenta_destino}
        por un monto de: ${monto}
      `,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error en transferencia:', error.message);
    
      await logService.registrarLog({
      usuario_id: req.user?.id ?? null,
      accion: LogActions.TRANSFERENCIA_FALLIDA,
      descripcion: `Error al transferir de ${req.body?.cuenta_origen} a ${req.body?.cuenta_destino}. Detalle: ${error.message}`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    }); 

    return res.status(500).json({
      success: false,
      message: 'Error al realizar la transferencia',
      error: error.message,
    });
  }
};