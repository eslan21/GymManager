import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken'


export async function GET() {
  const cookiesStorage = await cookies();
  const token =  cookiesStorage.get('token')?.value ?? null;


  // Si quieres 404 cuando no exista:
  //if (!jwt.verify(token, process.env.SECRETA)) return NextResponse.json({ error: 'Token no encontrado' }, { status: 404 });

  return NextResponse.json({ token }, { status: 200 });
}