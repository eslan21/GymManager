import { NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE } from '@/app/lib/session'

// Rutas protegidas y el rol requerido para cada una
const PROTECTED_ROUTES = [
  { prefix: '/userdashboard', role: 'CLIENTE' },
  { prefix: '/admindashboard', role: 'ADMIN' },
]

const HOME_BY_ROLE = {
  CLIENTE: '/userdashboard',
  ADMIN: '/admindashboard',
}

// Función para redirigir a login
function redirectToLogin(req) {
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.search = ''
  url.searchParams.set('redirectFrom', req.nextUrl.pathname)
  const res = NextResponse.redirect(url)
  // Si había un token inválido/expirado, lo eliminamos
  res.cookies.delete(SESSION_COOKIE)
  return res
}

export async function middleware(req) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(SESSION_COOKIE)?.value

  // Usuario ya autenticado que visita /login: lo enviamos a su panel
  if (pathname === '/login' && token) {
    const payload = await verifySessionToken(token)
    const home = payload && HOME_BY_ROLE[payload.role]
    if (home) {
      return NextResponse.redirect(new URL(home, req.url))
    }
    return NextResponse.next()
  }

  const route = PROTECTED_ROUTES.find(r => pathname.startsWith(r.prefix))
  if (!route) {
    return NextResponse.next()
  }

  if (!token) {
    return redirectToLogin(req)
  }

  const payload = await verifySessionToken(token)
  if (!payload) {
    return redirectToLogin(req)
  }

  if (payload.role !== route.role) {
    // Sesión válida pero rol equivocado: enviar a su propio panel si existe
    const home = HOME_BY_ROLE[payload.role]
    return home ? NextResponse.redirect(new URL(home, req.url)) : redirectToLogin(req)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/userdashboard/:path*', '/admindashboard/:path*'],
}
