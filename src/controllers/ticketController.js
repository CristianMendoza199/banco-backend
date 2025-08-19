const ticketModel = require('../models/ticketModel');
const logService = require("../services/logService");

// Crear ticket
exports.crearTicket = async (req, res) => {
  try {
    const {  motivo, mensaje } = req.body;
    const user_id = req.user.id; 
    const ticket = await ticketModel.crearTicket({ motivo, mensaje, user_id});
    
     await logService?.registrarLog?.({
      usuario_id: user_id,
      accion: 'CREAR_TICKET',
      descripcion: `Creó TICKET ${motivo}`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    return res.status(201).json({
      success: true,
      status_code: 201,
      message: "Ticket creado correctamente",
      data: ticket,
    });
  } catch (error) {
    console.error("error al crear el ticket:", error);
    return res.status(500).json({
      success: false,
      status_code: 500,
      message: error.message,
    });
  }
};

exports.responderTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { respuesta_admin, estado } = req.body || {};

     const ticket = await ticketModel.responderTicket({ id, respuesta_admin, estado });
    // Validar estados permitidos
    const estadosPermitidos = ["pendiente", "resuelto"];
    if (estado && !estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        status_code: 400,
        message: "Estado inválido",
      });
    }

    await logService?.registrarLog?.({
      usuario_id: req.user?.id,
      accion: 'RESPONDER_TICKET',
      descripcion:`Ticket ID ${id} - Estado: ${estado || "sin cambio"}`,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      status_code: 200,
      message: "Ticket actualizado correctamente",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status_code: 500,
      message: error.message,
    });
  }
};


// Obtener tickets por cliente
exports.obtenerTicketsPorUsuario = async (req, res) => {
    try {
        const { user_id } = req.params;

          if (!user_id) {
            return res.status(400).json({
              status_code: 400,
              status_desc: "El parámetro user_id es obligatorio"
            });
          }

        const tickets = await ticketModel.obtenerTicketsPorUsuario(user_id);

            if (!tickets || tickets.length === 0) {
              return res.status(404).json({
                status_code: 404,
                status_desc: "No se encontraron tickets para este usuario"
              });
        }

        res.status(200).json({
          status_code: 200,
          status_desc: "Tickets obtenidos correctamente",
          data: tickets,
        });
        } catch (error) {
          console.error("Error en obtenerTicketsPorUsuario:", error.message);
          res.status(500).json({
            status_code: 500,
            status_desc: "Error al obtener tickets",
            error: error.message
          });
        }
};
      

// Obtener todos los tickets (admin)
exports.obtenerTodos = async (req, res) => {
    try {
        const tickets = await ticketModel.obtenerTodosLosTickets();

        res.status(200).json({
            status_code: 200,
            status_desc: 'Lista de tickets',
            data: tickets,
        });
    } catch (error) {
        res.status(500).json({
            status_code: 500,
            status_desc: 'Error al obtener tickets',
            error: error.message
        });
    }
};

