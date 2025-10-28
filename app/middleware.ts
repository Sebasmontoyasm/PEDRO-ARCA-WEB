import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
   const path = req.nextUrl.pathname.toLowerCase();

    const blockedPatterns = [
    "/.git", "/.env", "/cgi-bin", "/vendor", "/phpunit", "/config.php",
    "/password.php", "/upl.php", "/1.php", "/setup.cgi", "/luci",
    "/think", "/pearcmd", "/eval-stdin.php"
  ]
  
    if (blockedPatterns.some(p => path.includes(p))) {
    console.warn(`[SECURITY] Bloqueado intento a ${path} desde ${req.ip || "IP desconocida"}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  const origin = req.headers.get("origin")
  const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"]

  if (origin && allowedOrigins.includes(origin)) {
    const res = NextResponse.next()
    res.headers.set("Access-Control-Allow-Origin", origin)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
