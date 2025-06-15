function allowRoles(...roles){
    return (req, res, next) => {
        if(!roles.includes(req.user.rol)){
            return res.status(403).json({
                status_code:403,
                status_desc: 'acceso denegado: rol insuficiente'
            });
        }
        next();
    }
}

module.exports = {
    allowRoles
}