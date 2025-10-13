module.exports = () => (req, res, next) => {
  res.success = (data, meta = {}) => res.json({
    data,
    meta: { requestId: req.requestId, timestamp: new Date().toISOString(), ...meta }
  });
  res.fail = (status, message, details) => res.status(status).json({
    meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    error: { message, status, details },
  });
  next();
};