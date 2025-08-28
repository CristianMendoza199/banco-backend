const model = require('../models/cuentaModel');
const LogActions = require('../constants/logAction');

// Crear cuenta (admin)
exports.crearCuenta = async (req, res) =>{
   try {
    const { cliente_id, tipo_cuenta_id, saldo } = req.body;

    if (!cliente_id || !tipo_cuenta_id || saldo == null) {
      return res.status(400).json({ status_desc: 'Datos incompletos' });
    }

     const cuenta = await model.crearCuenta({ cliente_id, tipo_cuenta_id, saldo });

    await logService.registrarLog({
      usuario_id: req.user.id,
      accion: LogActions.CREATE_ACCOUNT,
      descripcion: `Cuenta ID ${cuenta.id} creada para cliente ${cliente_id}, 
              tipo: ${tipo_cuenta_id}, 
              con un depósito inicial de: ${saldo}`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.status(201).json({
      status_code: 201,
      status_desc: 'Cuenta creada correctamente',
      cuenta: cuenta
    });

     } catch (error) {
    res.status(500).json({
      status_code: 500,
      status_desc: 'Error al crear cuenta',
      error: error.message
    });
  }
};

// Ver cuentas del cliente logueado
exports.obtenerCuentasPorCliente = async (req, res) => {
  try {
    const cliente_id = req.user.cliente_id;

    const result = await model.obtenerCuentasPorCliente(cliente_id);
   res.status(200).json({
      status_code: 200,
      cuentas: result.rows
    });
 } catch (error) {
    res.status(500).json({
      status_code: 500,
      status_desc: 'Error al obtener cuentas',
      error: error.message
    });
  }
};

// Ver todas las cuentas (admin)
exports.obtenerTodasLasCuentas = async (req, res) => {
  try {
    const result = await model.obtenerTodasLasCuentas();

    res.status(200).json({
      status_code: 200,
      cuentas: result.rows
    });
  } catch (error) {
    res.status(500).json({
      status_desc: 'Error al consultar todas las cuentas',
      error: error.message
    });
  }
};

exports.eliminarCuenta = async (req, res) => {
  try {
    const { id } = req.params;

    await model.eliminarCuenta(id);

    res.status(200).json({
      status_code: 200,
      status_desc: 'Cuenta eliminada correctamente'
    });

  } catch (error) {
    res.status(500).json({
      status_code: 500,
      status_desc: 'Error al eliminar cuenta',
      error: error.message
    });
  }
};

