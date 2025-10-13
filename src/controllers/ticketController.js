const ticketModel = require('../models/ticketModel');
const logService = require("../services/logService");
const LogActions = require('../constants/logAction');

// Crear ticket
const toInt = v => (v === '' || v === null || v === undefined ? NaN : Number(v));
const isNonEmpty = s => !!String(s ?? '').trim();

exports.crearTicket = async (req, res, next) => {
  try {
    const user_id = req.user?.id ?? req.user?.sub ?? null;
    const asunto  = (req.body?.asunto || req.body?.motivo || '').trim();
    const mensaje = (req.body?.mensaje || '').trim();
    const prioridad = (req.body?.prioridad || 'MEDIA').toUpperCase();
    const categoria = (req.body?.categoria || null);

    if (!user_id) return res.fail(401, 'No autorizado');
    if (!isNonEmpty(asunto))  return res.fail(400, 'asunto es obligatorio');
    if (!isNonEmpty(mensaje)) return res.fail(400, 'mensaje es obligatorio');
    if (!['BAJA','MEDIA','ALTA'].includes(prioridad)) return res.fail(400, 'prioridad inválida');

    const { rows } = await model.crearTicket({ user_id, asunto, mensaje, prioridad, categoria });
    const data = rows?.[0]?.data;
    if (!data?.id) return res.fail(500, 'No se pudo crear el ticket');

    logService?.registrarLog?.({
      usuario_id: user_id,
      accion: LogActions.CREATE_TICKET,
      descripcion: `Ticket ${data.id} creado (${asunto})`,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      request_id: req.context?.requestId ?? null
    }).catch(()=>{});

    return res.status(201).success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};

exports.obtenerTicketsPorUsuario = async (req, res, next) => {
  try {
    // Si es cliente, ignora path param y usa el del token
    const isAdmin = req.user?.rol === 'admin';
    const pathUserId = toInt(req.params?.user_id);
    const user_id = isAdmin ? (Number.isInteger(pathUserId) ? pathUserId : (req.user?.id ?? null))
                            : (req.user?.id ?? null);

    if (!user_id) return res.fail(401, 'No autorizado');

    const { rows } = await model.obtenerTicketsPorUsuario(user_id);
    const data = rows?.[0]?.data ?? [];
    return res.success({ items: data });
  } catch (err) { err.status = err.status || 500; return next(err); }
};

exports.obtenerTodos = async (req, res, next) => {
  try {
    if (req.user?.rol !== 'admin') return res.fail(403, 'Solo admin');

    const estado    = req.query?.estado ? String(req.query.estado).toUpperCase().trim() : null;
    const prioridad = req.query?.prioridad ? String(req.query.prioridad).toUpperCase().trim() : null;
    const categoria = req.query?.categoria ? String(req.query.categoria).toUpperCase().trim() : null;
    const limit     = toInt(req.query?.limit)  || 50;
    const offset    = toInt(req.query?.offset) || 0;

    if (estado && !['PENDIENTE','EN_PROCESO','RESUELTO','CERRADO'].includes(estado))
      return res.fail(400, 'estado inválido');
    if (prioridad && !['BAJA','MEDIA','ALTA'].includes(prioridad))
      return res.fail(400, 'prioridad inválida');

    const { rows } = await model.obtenerTodosLosTickets({ estado, prioridad, categoria, limit, offset });
    const data = rows?.[0]?.data ?? { items: [], pagination: { limit, offset, total: 0 } };

    return res.success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};


exports.detalleTicket = async (req, res, next) => {
  try {
    const id = toInt(req.params?.id);
    if (!Number.isInteger(id) || id <= 0) return res.fail(400, 'ticket_id inválido');

    const { rows } = await model.detalleTicket(id);
    const data = rows?.[0]?.data;
    if (!data?.ticket?.id) return res.fail(404, 'Ticket no encontrado');

    // Seguridad mínima: si es cliente, solo su ticket
    const isClient = req.user?.rol !== 'admin';
    if (isClient && data.ticket.user_id !== (req.user?.id ?? req.user?.sub)) {
      return res.fail(403, 'No autorizado');
    }

    return res.success(data);
  } catch (err) { err.status = err.status || 500; return next(err); }
};


