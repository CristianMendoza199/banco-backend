const pool = require('../config/db');
const model = require('../models/transaccionModel');

exports.registrarTransaccion = async (req, res) => {
    try {
       console.log('Datos recibidos:', req.body);  
    const result = await model.registrarTransaccion(req.body); // req.body debe incluir: cuenta_id, tipo, monto

    res.status(201).json({
      status_code: 201,
      status_desc: 'Transacción registrada correctamente',
      result: result.rows[0] ?? null
    });

  } catch (error) {
    console.error('Error en controlador al registrar transacción:', error.message);
    res.status(500).json({
      status_code: 500,
      status_desc: 'Error al registrar transacción',
      error: error.message
    });
  }
};


exports.getHistorialConFiltros = async(req, res) => { 
    try{
      const cliente_id = req.user.cliente_id;
      const filtros = req.query;
      
      const transacciones =  await model.obtenerTransaccionesFiltradas(cliente_id, filtros);

      res.status(200).json({
        status_code: 200,
        transacciones
      }); 
    }catch (error) {
      res.status(500).json({
        status_code: 500,
        status_desc: ' error al obtener el historial',
        error: error.message
      });
    }
};
    
