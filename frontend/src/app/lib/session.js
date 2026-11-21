import { jwtVerify } from 'jose';

// Nombre de la cookie httpOnly que guarda el JWT emitido por el backend
export const SESSION_COOKIE = 'token';

// Debe coincidir con la expiración del token en el backend ("24h")
export const SESSION_MAX_AGE = 60 * 60 * 24;

// Única fuente del secreto. Debe ser el MISMO valor que JWT_SECRET en el backend.
// Se acepta SECRETA por compatibilidad con la configuración anterior.
function getSecret() {
  const secret = process.env.JWT_SECRET || process.env.SECRETA;
  if (!secret) {
    throw new Error('Falta la variable de entorno JWT_SECRET en el frontend.');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Verifica firma y expiración del JWT. Funciona en Edge (middleware) y Node (route handlers).
 * @returns {Promise<object|null>} payload ({ id, email, fullName, role }) o null si no es válido
 */
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}
