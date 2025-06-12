const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_bancario_123';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Esperamos: Authorization: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status_code: 401,
      status_desc: 'Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // ahora req.user tendrá: id, email, rol
    next();
  } catch (error) {
    return res.status(403).json({
      status_code: 403,
      status_desc: 'Token inválido o expirado',
      error: error.message
    });
  }
}

module.exports = verifyToken;