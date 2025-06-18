const { page } = require('pdfkit');
const pool = require('../config/db');
const model = require('../models/transaccionModel');
const { generarEstadoCuentaPdf } = require('../utils/pdfService');

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


exports.getEstadoCuentaPdf = async (req, res) => {
  try{
    const cliente_id = req.user.cliente_id;
    const {cuenta_id, fecha_inicio, fecha_fin} = req.query;

   const transacciones = await model.obtenerTransaccionesFiltradas(cliente_id, {
      cuenta_id,
      fecha_inicio,
      fecha_fin,
      page: 1,
      limit: 1000
    });

    const cliente = {
      nombre:  req.user.nombre || 'No registrado',
      email: req.user.email
    };

    const periodo = {cuenta_id, fecha_inicio, fecha_fin};
    const pdf = generarEstadoCuentaPdf(cliente, transacciones, periodo);

    res.setHeader('Content-Disposition', 'attachment; filename=estado_cuenta.pdf' );
    res.setHeader('Content-type', 'application/pdf');
    pdf.pipe(res);
  } catch (error) {
      res.status(500).json({
        res_status_code: 500,
        res_status_desc: 'Error al generar PDF', error:  error.message
      });
  }
};
