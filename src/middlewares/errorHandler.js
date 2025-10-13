// middlewares/errorHandler.js
module.exports = (err, req, res, _next) => {
  const status  = err.status || err.statusCode || 500;
  const expose  = err.expose === true || (status >= 400 && status < 500); // solo 4xx suelen ser “esperables”
  const message = expose ? (err.message || 'Solicitud inválida') : 'Internal Server Error';

  if (res.headersSent) return;
  return res.status(status).json({
    error:{ message, status },
    meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    error: { message, status }
    // <- NO devolvemos err.details ni stack por defecto
  });
};