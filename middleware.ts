import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'
import { type NextRequest, NextResponse } from 'next/server'

const LATAM_COUNTRIES = new Set([
  'CO', 'MX', 'AR', 'CL', 'PE', 'EC', 'BO', 'VE', 'UY', 'PY',
  'CR', 'PA', 'GT', 'HN', 'SV', 'NI', 'CU', 'DO', 'PR',
])

const handleI18n = createMiddleware(routing)

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const hasEsPrefix = pathname.startsWith('/es')
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value

  if (!hasEsPrefix && !localeCookie) {
    const country = request.headers.get('x-vercel-ip-country') ?? ''
    if (LATAM_COUNTRIES.has(country)) {
      const newPath = `/es${pathname === '/' ? '' : pathname}`
      const response = NextResponse.redirect(new URL(newPath, request.url))
      response.cookies.set('NEXT_LOCALE', 'es', {
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
        sameSite: 'lax',
      })
      return response
    }
  }

  return handleI18n(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|auth|.*\\..*).*)', '/'],
}
