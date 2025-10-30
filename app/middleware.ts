import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin")
  const allowedOrigins = ["http://localhost", "http://127.0.0.1"]

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
