import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/register',
  '/public',
  '/api/public'
]

// Función para redirigir a login 
function redirigitTo(req) {
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('redirectFrom', req.nextUrl.pathname) // ✅ Usar req.nextUrl.pathname
  return NextResponse.redirect(url)
}

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Ignorar archivos estáticos y _next
  const isStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|map|txt|woff2?)$/)

  if (isStatic) {
    return NextResponse.next()
  }

  // Permitir rutas públicas
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    const res = NextResponse.next()
    res.headers.set('x-powered-by', 'Next.js + Middleware')
    return res
  }
  /// ************ Verificando /userdashboard
  const userURL = pathname.startsWith('/userdashboard')
  if (userURL) {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return redirigitTo(req)
    }

    try {

      const secret = new TextEncoder().encode(process.env.SECRETA)

      // ✅ Agregar await
      const { payload } = await jwtVerify(token, secret)

      // ✅ Verificar payload.role
      if (payload.role !== 'CLIENTE') {
        return redirigitTo(req)
      }

      return NextResponse.next()

    } catch (error) {
      console.log('Token no válido', error)
      return redirigitTo(req)
    }
  }
  /// ************ Verificando /admindashboard
  const adminURL = pathname.startsWith('/admindashboard');
  if (adminURL) {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return redirigitTo(req)
    }

    try {

      const secret = new TextEncoder().encode(process.env.SECRETA)

      // ✅ Agregar await
      const { payload } = await jwtVerify(token, secret)

      // ✅ Verificar payload.role
      if (payload.role !== 'ADMIN') {
        return redirigitTo(req)
      }

      return NextResponse.next()

    } catch (error) {
      console.log('Token no válido', error)
      return redirigitTo(req)
    }
  }
  // Respuesta por defecto
  const res = NextResponse.next()
  res.headers.set('x-powered-by', 'Next.js + Middleware')
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|map|txt|woff2?)).*)'
  ]
}