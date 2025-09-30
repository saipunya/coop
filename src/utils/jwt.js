import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET;

export function signToken(payload, expiresIn) {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, secret);
}
