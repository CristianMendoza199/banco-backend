const model = require('../models/tarjetaModel');

exports.crearTarjeta = async (req, res) => {
  try {
    const { cuenta_id, tipo, limite_credito } = req.body;

    if (!cuenta_id || !tipo) {
      return res.status(400).json({
        status_code: 400,
        status_desc: 'Datos incompletos'
      });
    }

    await model.crearTarjeta({ cuenta_id, tipo, limite_credito });

    res.status(201).json({
      status_code: 201,
      status_desc: 'Tarjeta creada correctamente'
    });

  } catch (error) {
    console.error('Error al crear tarjeta:', error.message);
    res.status(500).json({
      status_code: 500,
      status_desc: 'Error interno al crear tarjeta',
      error: error.message
    });
  }
};


  exports.obtenerTarjetasPorCliente = async (req, res) => {
  try {
    const cliente_id = req.user.cliente_id;

    if (!cliente_id) {
      return res.status(403).json({
        status_code: 403,
        status_desc: 'Este usuario no tiene tarjetas asociadas'
      });
    }

    const result = await model.obtenerTarjetasPorCliente(cliente_id);

    res.status(200).json({
      status_code: 200,
      status_desc: 'Tarjetas encontradas',
      tarjetas: result.rows
    });

  } catch (error) {
    console.error('Error al obtener tarjetas:', error.message);
    res.status(500).json({
      status_code: 500,
      status_desc: 'Error al consultar tarjetas',
      error: error.message
    });
  }
};