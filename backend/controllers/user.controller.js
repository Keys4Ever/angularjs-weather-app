import sql from 'mssql';
import poolPromise from '../config/db.js';

// Obtener todos los usuarios
export const getAllUsers = async (req, res, next) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT userId, username FROM Users');
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT userId, username FROM Users WHERE userId = @userId');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (err) {
    next(err);
  }
};

