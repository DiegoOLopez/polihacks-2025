const jwt = require('jsonwebtoken');
const { config } = require('../config/config'); // Asegúrate de tener tu secret aquí

function authMiddleware(req, res, next) {
  const token = req.cookies.jwt;
  console.log('Token recibido:', token);
  console.log('Secret JWT:', config.jwtSecret);
  if (!token) return res.status(401).json({ loggedIn: false });

  try {
    const decoded = jwt.verify(token, config.jwtSecret); // valida el token
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ loggedIn: false });
  }
}

module.exports = authMiddleware;
