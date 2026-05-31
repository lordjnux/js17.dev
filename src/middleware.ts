import { type NextRequest, NextResponse } from 'next/server'

const LATAM_COUNTRIES = new Set([
  'CO', 'MX', 'AR', 'CL', 'PE', 'EC', 'BO', 'VE', 'UY', 'PY',
  'CR', 'PA', 'GT', 'HN', 'SV', 'NI', 'CU', 'DO', 'PR',
])

// next-intl reads this header in getRequestConfig({ requestLocale }) to determine locale
const LOCALE_HEADER = 'X-NEXT-INTL-LOCALE'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // ES-prefixed paths: pass through and set locale header so next-intl server context
  // resolves to 'es'. Without this header, requestLocale falls back to 'en', which
  // causes usePathname() to not strip /es and produces /es/es on language switch.
  if (pathname === '/es' || pathname.startsWith('/es/')) {
    const response = NextResponse.next()
    response.headers.set(LOCALE_HEADER, 'es')
    return response
  }

  // /en-prefixed paths: redirect to canonical unprefixed URL (SEO)
  // Middleware will then rewrite / → /en on the next hit (internal, no loop)
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const stripped = pathname === '/en' ? '/' : pathname.slice(3)
    return NextResponse.redirect(new URL(stripped + search, request.url), 308)
  }

  // Unprefixed path (canonical EN): check LATAM geo-detection and ES preference
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value

  if (localeCookie === 'es') {
    // User explicitly chose ES — redirect to /es equivalent
    const esPath = `/es${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(new URL(esPath + search, request.url))
  }

  if (!localeCookie) {
    const country = request.headers.get('x-vercel-ip-country') ?? ''
    if (LATAM_COUNTRIES.has(country)) {
      const esPath = `/es${pathname === '/' ? '' : pathname}`
      const response = NextResponse.redirect(new URL(esPath + search, request.url))
      response.cookies.set('NEXT_LOCALE', 'es', {
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
        sameSite: 'lax',
      })
      return response
    }
  }

  // Default EN: rewrite internally to /en/* so Next.js matches [locale]/page.tsx.
  // Set locale header so next-intl server context resolves to 'en'.
  const rewriteUrl = new URL(`/en${pathname === '/' ? '' : pathname}${search}`, request.url)
  const response = NextResponse.rewrite(rewriteUrl)
  response.headers.set(LOCALE_HEADER, 'en')
  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|admin|auth|.*\\..*).*)', '/'],
}
