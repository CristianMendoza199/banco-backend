const { randomUUID } = require('crypto');
module.exports = () => (req, res, next) => {
  const rid = req.header('x-request-id') || randomUUID();
  req.requestId = rid;
  res.setHeader('x-request-id', rid);
  next();
};