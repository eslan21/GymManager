'use server'
import { verify, decode } from "jsonwebtoken"
import { cookies } from "next/headers";
const SECRET_KEY = "palabrasecreta";


export  async function   isUserLogin(token) {

  try {
   
    if (!token) {
      return false;
    }

    // Verificar el token
    const decoded = verify(token, SECRET_KEY);
    
    //return decoded;
    return decoded;
  } catch (error) {
    console.error('Error al verificar el token:', error.message);
    return false;
  }
}

//Get user data 

export async function  getDataUser(token){

  const data =  decode(token);
  
  return data;

}

// Función para verificar si el token está expirado
export async function isTokenExpired(token) {
  try {
   
    if (!token) {
      console.log('No se encontró el token en localStorage.');
      return true;
    }

    // Decodificar el token sin verificar la firma
    const decoded = decode(token);
    if (!decoded || !decoded.exp) {
      console.log('El token no tiene una fecha de expiración válida.');
      return true;
    }

    // Verificar si el token está expirado
    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    if (decoded.exp < currentTime) {
      console.log('El token ha expirado.');
      return true;
    }

    console.log('El token es válido.');
    return false;
  } catch (error) {
    console.log('Error al verificar si el token está expirado:', error.message);
    return true;
  }
}


/**
 * Verifica si un token JWT es válido y si el usuario tiene el rol de 'ADMIN'.
 * @param {string} token El token JWT a verificar.
 * @returns {boolean} Devuelve true si el token es válido y el rol es 'ADMIN', de lo contrario devuelve false.
 */
export const esTokenDeAdmin = async (token) => {
  // 1. Si no se proporciona un token, no es válido.
  if (!token) {
    return false;
  }

  try {
    // 2. Intenta verificar el token con la clave secreta.
    // Si el token es inválido (expirado, malformado, firma incorrecta),
    // jwt.verify lanzará un error y el código saltará al bloque catch.
    const payloadDecodificado = verify(token, SECRET_KEY);

    // 3. Si la verificación fue exitosa, comprueba que el rol sea 'ADMIN'.
    // Esta comparación devuelve directamente true o false.
    // Es sensible a mayúsculas y minúsculas, 'admin' no sería igual a 'ADMIN'.
    return payloadDecodificado.role === 'ADMIN';

  } catch (error) {
    // 4. Si jwt.verify falla, el token no es válido.
    console.error("Error al verificar el token:", error.message);
    return false;
  }
};

export const  deleteCookies = async (cookie)=>{
    const cookieStorage = await cookies();
    cookieStorage.delete(cookie);
}