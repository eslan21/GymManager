import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/app/lib/session';

// URL del backend GraphQL (solo servidor). NEXT_PUBLIC_BACKEND_URI se acepta por compatibilidad.
const BACKEND_URI =
  process.env.BACKEND_URI || process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:4000';

/**
 * Proxy de GraphQL: el navegador nunca ve el JWT.
 * Lee el token de la cookie httpOnly y lo reenvía al backend como header Authorization.
 */
export async function POST(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const body = await req.text();

  let upstream;
  try {
    upstream = await fetch(BACKEND_URI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Error conectando con el backend GraphQL:', error);
    return NextResponse.json(
      { errors: [{ message: 'No se pudo conectar con el servidor.' }] },
      { status: 502 }
    );
  }

  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') || 'application/json' },
  });
}
