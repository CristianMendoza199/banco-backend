const pool = require('../config/db');
const model = require('../models/tarjetaModel');
const { registrarLog } = ('../service/logService');

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

exports.bloquearTarjeta = async(req, res)  => {
  try{
    const { id } = req.params;
    await model.bloquearTarjeta(id);
    res.status(200).json({status_desc: 'Tarjeta bloqueada'});
  }catch(error){
    res.status(500).json({status_desc: 'Error al bloquear la tajeta', error: error.message});
  }
};

exports.activarTarjeta = async(req, res) => {
  try{
    const { id } = req.params;
    await model.activarTarjeta(id);
    res.status(200).json({status_desc: 'Tarjeta activada'});
  } catch(error){
    res.status(500).json({status_desc: 'Error al activar la tarjeta', error: error.message});
  }
};

exports.eliminarTarjeta = async(req, res) => {
  try{
    const { id } = req.params;
    await model.eliminarTarjeta(id);
    res.status(200).json({status_desc: 'Tarjeta eliminada'});
  }catch(error){
    res.status(500).json({status_desc: 'Error al eliminar la tarjeta', error: error.message});
  }
};

exports.obtenerTodas = async(req, res) => {
    try{
      const  result = await model.obtenerTodasTarjetas();
      res.status(200).json({tarjetas: result.rows});
    } catch(error){
      res.status(500).json({status_desc: 'Error al cargar las tarjetas', error: error.message});
    }
};


exports.reportarTarjeta =  async(req, res) => {
  try {
    const cliente_id = req.user.cliente_id;
    const { tarjeta_id, motivo } = req.body;


    const { rows } = await pool.query(
      'SELECT * FROM tarjeta WHERE id = $1 AND cuenta_id IN (SELECT id FROM cuentas WHERE cliente_id = $2)',
      [tarjeta_id, cliente_id]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        status_code: 403,
        status_desc: 'No tienes permiso para reportar esta tarjeta'
      });
    }

    const tarjeta = rows[0];

    if (tarjeta.estado === 'Reportada') {
          return res.status(409).json({
        status_code: 409,
          status_desc: 'La tarjeta ya fue reportada previamente'
        });
    }

    await model.reportarTarjeta(tarjeta_id, motivo);

      await registrarLog({
        usuario_id: req.user.id,
        accion: 'REPORTAR_TARJETA',
        descripcion: `Tarjeta ${tarjeta_id} reportada como: ${motivo}`,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });

    res.status(200).json({
      status_code: 200,
      status_desc: 'tarjeta reportada correctamente'
    });

  } catch (error){
    res.status(500).json({
      status_code: 500,
      status_desc: 'Error al reportar la tarjeta',
      error: error.message
    });
  }

}