const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  try {
    const raw = (req.headers.authorization || req.headers.Authorization || '').trim();

    // Soporta: "Bearer <token>" o "Bearer: <token>"
    let token = null;
    if (/^Bearer\s+.+/i.test(raw)) {
      token = raw.replace(/^Bearer\s+/i, '');
    } else if (/^Bearer:\s*.+/i.test(raw)) {
      token = raw.replace(/^Bearer:\s*/i, '');
    }

    if (!token) {
      return res.status(401).json({ status_code: 401, status_desc: 'Token no proporcionado' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ status_code: 500, status_desc: 'JWT_SECRET no configurado' });

    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.id ?? decoded.sub ?? null,
      email: decoded.email ?? null,
      rol: decoded.rol ?? decoded.role ?? null,
      cliente_id: decoded.cliente_id ?? null,
    };
    if (!req.user.id) return res.status(401).json({ status_code: 401, status_desc: 'Token inválido (sin id/sub)' });

    return next();
  } catch (error) {
    return res.status(403).json({ status_code: 403, status_desc: 'Token inválido o expirado', error: error.message });
  }
}



function verifyRole(...rolesPermitidos){
    return(req, res, next) => {
        const rol = req.user?.rol;
        if(!rolesPermitidos.includes(rol)){
            return res.status(403).json({status_desc: 'Acceso denegado: rol insuficiente'});
        }
        next();
    }
}

module.exports = {
    verifyToken, 
    verifyRole
};