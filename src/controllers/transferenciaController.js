const transferenciaModel = require('../models/transferenciaModel');


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

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error en transferencia:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al realizar la transferencia',
      error: error.message,
    });
  }
};