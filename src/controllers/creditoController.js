
const model = require('../models/creditoModel');

// POST: asignar crédito
exports.crearCredito = async (req, res) => {
  try {
    const result = await model.asignarCredito(req.body); // req.body tiene: cliente_id, monto, tasa_interes
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


/*
// Importamos el modelo que contiene la función para ejecutar la SP

const model = require('../models/creditoModel');

// Controlador para la ruta POST /api/creditos/crear
exports.crearCredito = async (req, res) => {
  const { cliente_id, monto, tasa_interes, estado } = req.body; // Extraemos los datos del cuerpo de la solicitud

  try {
    await model.asignarCredito(cliente_id, monto, tasa_interes, estado); // Llamamos al modelo para asignar el crédito usando la SP
    res.status(201).json({
         status_code: 201,
         status_desc: 'Crédito asignado correctamente' }); // Respondemos al cliente con un mensaje de éxito
         
  } catch (error) { // Si ocurre un error, lo mostramos en consola y respondemos con estado 500
    console.error('Error al asignar crédito:', error);
    res.status(500).json({
         status_code: 500,
          status_desc: 'Error al asignar crédito' });
  }
};
*/