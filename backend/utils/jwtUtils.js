import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "clave_super_secreta_para_jwt";
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';

/**
 * Generate a JWT for a given payload.
 * @param {Object} payload - The data to include in the token.
 * @returns {string} - The signed JWT.
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Verify the validity of a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {Object} - The decoded token payload if valid.
 * @throws {Error} - If the token is invalid or expired.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
