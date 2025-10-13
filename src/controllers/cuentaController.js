const model = require("../models/cuentaModel");
const tarjetaModel = require('../models/tarjetaModel');
const LogActions = require("../constants/logAction");
const logService = require("../services/logService");

const toInt = (v) => (Number.isInteger(+v) ? +v : NaN);
const toNum = (v) =>
  v === "" || v === null || v === undefined ? NaN : Number(v);

exports.crearCuenta = async (req, res, next) => {
  try {
    const isAdmin = req.user?.rol === "admin";
    const cliente_id_body = toInt(req.body?.cliente_id);
    const tipo_cuenta_id = toInt(req.body?.tipo_cuenta_id);
    const saldo = toNum(req.body?.saldo);

    const cliente_id = isAdmin ? cliente_id_body : (req.user?.cliente_id ?? NaN);

    if (!Number.isInteger(cliente_id) || cliente_id <= 0) {
      return res.fail(400, "cliente_id inválido");
    }
    if (!Number.isInteger(tipo_cuenta_id) || tipo_cuenta_id <= 0) {
      return res.fail(400, "tipo_cuenta_id inválido");
    }
    if (!Number.isFinite(saldo) || saldo < 0) {
      return res.fail(400, "saldo debe ser un número >= 0");
    }

    // 1) Crear cuenta (SP)
    const { rows } = await model.crearCuentaSP({ cliente_id, tipo_cuenta_id, saldo });
    const cuenta = rows?.[0]?.data;
    if (!cuenta) return res.fail(500, "No se pudo crear la cuenta");

    // 2) Emitir tarjeta débito por defecto (se puede desactivar con auto_debito=false)
    const wantAutoDebito = req.body?.auto_debito !== false;
    let tarjetaDebito = null;

    if (wantAutoDebito) {
      try {
        const { rows: r2 } = await tarjetaModel.emitirDebitoPorCuenta({
          cuenta_id: cuenta.id,
          actorRol: req.user?.rol || 'admin',
          actorClienteId: req.user?.cliente_id ?? null
        });
        tarjetaDebito = r2?.[0]?.data?.tarjeta ?? null;

        await logService?.registrarLog?.({
          usuario_id: req.user?.id ?? req.user?.sub ?? null,
          accion: LogActions.CREATE_DEBIT_CARD,
          descripcion: `Tarjeta débito emitida para cuenta ${cuenta.id}`,
          ip: req.ip,
          user_agent: req.headers['user-agent']
        });
      } catch (emitErr) {
        // No bloquea la creación de la cuenta; auditamos el fallo
        console.error('Fallo emitiendo tarjeta débito:', emitErr);
        await logService?.registrarLog?.({
          usuario_id: req.user?.id ?? req.user?.sub ?? null,
          accion: LogActions.ERROR_CREATE_DEBIT_CARD,
          descripcion: `Fallo emitiendo débito para cuenta ${cuenta.id}: ${emitErr?.message || emitErr}`,
          ip: req.ip,
          user_agent: req.headers['user-agent']
        });
      }
    }

    // 3) Log de creación de cuenta
    await logService?.registrarLog?.({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.CREATE_ACCOUNT,
      descripcion: `Cuenta ${cuenta.id} creada para cliente ${cliente_id} (tipo ${tipo_cuenta_id}, saldo ${saldo})`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    // 4) Respuesta estándar
    return res.status(201).success({ cuenta, tarjetaDebito });
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};
// Ver cuentas del cliente logueado
exports.obtenerCuentasPorCliente = async (req, res, next) => {
  try {
    const cliente_id = parseInt(req.params.cliente_id || req.user?.cliente_id, 10);
    if (isNaN(cliente_id)) return res.fail(400, "cliente invalido");

    const { rows } = await model.obtenerCuentasPorCliente(cliente_id);
    const cuentas = rows.map(r =>r.data);

    if (!cuentas.length) return res.fail(404, "Cuenta no  encontrada");

    return res.status(201).success(cuentas);
  } catch (error) {
    error.status = 500;
    return next(error);
  }
};

// Ver todas las cuentas (admin)
exports.obtenerTodasLasCuentas = async (req, res, next) => {
  try {
    const { rows } = await model.obtenerTodasLasCuentas();
    const cuentas = rows?.[0]?.data ??[];
    return res.success(cuentas);
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};

exports.eliminarCuenta = async (req, res, next) => {
  try {
    const id = toInt(req.params?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.fail(400, 'id inválido');
    }

    if (req.user?.rol !== 'admin') {
    return res.fail(403, 'No autorizado para eliminar cuentas');
    }

      const { rows } = await model.eliminarCuenta(id);
      const eliminada = rows?.[0]?.data || null;

      if (!eliminada){
        return res.fail(404, 'Cuenta no encontrada');
      }

    await logService.registrarLog({
      usuario_id: req.user?.id ?? req.user?.sub ?? null,
      accion: LogActions.CLOSE_ACCOUNT,
      descripcion: `Cuenta ID ${id} eliminada`,
      ip: req.ip,
      user_agent: req.headers["user-agent"],
    });

    return res.success({ deleted: true, cuenta: eliminada });
  } catch (error) {
    error.status = error.status || 500;
    return next(error);
  }
};
