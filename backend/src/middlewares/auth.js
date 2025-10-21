const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'jwt_dev_secret_change_me';
    const payload = jwt.verify(token, secret);
    req.user = { id_usuario: payload.id_usuario, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

module.exports = authMiddleware;