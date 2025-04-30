import { verifyToken } from '../utils/jwtUtils.js';

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Acceso denegado. Token no proporcionado.',
      });
    }

  
    try {
      const user = verifyToken(token);
      req.user = user;
      next();
    } catch (err) {
      return res.status(403).json({ 
        success: false,
        message: 'Token inválido o expirado.',
      });
    }
  } catch (error) {
    next(error);
  }
};

export default authenticateToken;