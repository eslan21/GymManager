import { NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/app/lib/session';

// Recibe el JWT del backend tras el login y lo guarda en una cookie httpOnly.
export async function POST(req) {
  let token;
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  // Verificando validez del token (firma + expiración)
  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  // Solo devolvemos los datos no sensibles necesarios para redirigir
  const dataToken = {
    id: payload.id,
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role,
  };

  const response = NextResponse.json({ message: 'Token stored successfully', dataToken });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE, // igual a la expiración del JWT
  });

  return response;
}
