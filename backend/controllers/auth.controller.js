import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import poolPromise from '../config/db.js';
import { generateToken } from '../utils/jwtUtils.js';

const JWT_SECRET = process.env.JWT_SECRET || "clave_super_secreta_para_jwt";
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT userId, username, password FROM Users WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const payload = { 
      userId: user.userId, 
      username: user.username 
    };
    const token = generateToken(payload);

    res.json({
      success: true,
      token,
      expiresIn: JWT_EXPIRY,
      user: {
        userId: user.userId,
        username: user.username
      }
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    const pool = await poolPromise;
    const userCheck = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT userId FROM Users WHERE username = @username');
      console.log(userCheck.recordset);
    if (userCheck.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El nombre de usuario ya existe'
      });
    }
    
    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insertar usuario
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, hashedPassword)
      .query(`
        INSERT INTO Users (username, password) 
        VALUES (@username, @password);
        SELECT SCOPE_IDENTITY() AS userId;
      `);
    
    const userId = result.recordset[0].userId;

    const payload = { 
      userId, 
      username 
    };
    const token = generateToken(payload);
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      token,
      expiresIn: JWT_EXPIRY,
      data: { userId, username }
    });
  } catch (err) {
    next(err);
  }
};

const validateToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token no proporcionado',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    return res.json({
      success: true,
      valid: true,
      data: decoded,
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Token expirado',
      });
    }

    return res.status(401).json({
      success: false,
      valid: false,
      message: 'Token inválido',
    });
  }
};

const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token no proporcionado',
    });
  }

  try {
    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido, no se puede refrescar',
      });
    }

    const newToken = generateToken({
      userId: decoded.userId,
      username: decoded.username,
    });

    return res.json({
      success: true,
      token: newToken,
      expiresIn: process.env.JWT_EXPIRY || '1h',
    });
  } catch (err) {
    console.error('Error al refrescar el token:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al refrescar el token',
    });
  }
};

export { login, register, validateToken, refreshToken  };