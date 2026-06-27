import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TOKEN_COOKIE = 'frontend-marketplace-token'
const ROLE_COOKIE = 'frontend-marketplace-role'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(TOKEN_COOKIE)?.value
  const role = request.cookies.get(ROLE_COOKIE)?.value

  const isLoginPage = pathname === '/login'
  const isRegisterPage = pathname === '/register'
  const isPublicPage = isLoginPage || isRegisterPage

  if (token && isPublicPage) {
    const url = new URL('/', request.url)
    return NextResponse.redirect(url)
  }

  if (!token && !isPublicPage) {
    const url = new URL('/login', request.url)
    return NextResponse.redirect(url)
  }

  if (token && pathname.startsWith('/admin') && role !== 'admin') {
    const url = new URL('/', request.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
