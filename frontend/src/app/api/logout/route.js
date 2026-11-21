import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/app/lib/session';

// Cierra la sesión eliminando la cookie httpOnly (no accesible desde el navegador)
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  // Limpieza de la cookie 'user' que guardaban versiones anteriores
  response.cookies.delete('user');
  return response;
}
