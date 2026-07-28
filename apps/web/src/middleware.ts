import { NextResponse, type NextRequest } from "next/server";

/** Espelha SESSION_COOKIE em lib/auth/constants — inline para Edge. */
const SESSION_COOKIE = "altora_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/what-if/:path*"],
};
