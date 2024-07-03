import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Replace this array with an array of paths for pages in your app that do not require the
// user to be authenticated, e.g. a login page
const UNAUTHENTICATED_PAGES = []

export const config = {
  // necessary to ensure that you are redirected to the refresh page
  matcher: '/',
}

export async function middleware(req: NextRequest) {
  const cookieAuthToken = req.cookies.get('privy-token')
  const cookieSession = req.cookies.get('privy-session')

  // Bypass middleware when `privy_oauth_code` is a query parameter, as
  // we are in the middle of an authentication flow
  if (req.nextUrl.searchParams.get('privy_oauth_code'))
    return NextResponse.next()

  // Bypass middleware when the /refresh page is fetched, otherwise
  // we will enter an infinite loop
  if (req.url.includes('/refresh')) return NextResponse.next()

  // If the user has `privy-token`, they are definitely authenticated
  const definitelyAuthenticated = Boolean(cookieAuthToken)
  // If user has `privy-session`, they also have `privy-refresh-token` and
  // may be authenticated once their session is refreshed in the client
  const maybeAuthenticated = Boolean(cookieSession)

  if (!definitelyAuthenticated && maybeAuthenticated) {
    // If user is not authenticated, but is maybe authenticated
    // redirect them to the `/refresh` page to trigger client-side refresh flow
    return NextResponse.redirect(new URL('/refresh', req.url))
  }

  return NextResponse.next()
}
