const jwt = require('jsonwebtoken');
const { config } = require('../../config/config'); // Asegúrate de tener tu secret aquí

function validacionJWT(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: 'Token no encontrado' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret); // valida el token

    req.user = decoded; // payload, ejemplo: { sub, role, id_empresa, iat, exp }
    next();
  } catch (err) {
    console.error('Error al verificar el token:', err);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}


function verificarRol(rolesPermitidos) {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.role)){
            return res.status(403).json(
                {
                    message: 'Forbidden: No tienes acceso'
                }
            );
        }
        next();
    }
}

module.exports = { validacionJWT, verificarRol };