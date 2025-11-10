export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secret_key_dev");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const origin = req.headers.get("origin") || "*";
  const headers = new Headers({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  });

  if (req.method === "OPTIONS") return new NextResponse(null, { status: 200, headers });

  const protectedPaths = ["/admin", "/dashboard"];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next({ headers });

  const token = req.cookies.get("token")?.value ?? req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url), { headers });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const roleRaw = (payload as any).role;
    const role = typeof roleRaw === "string" ? Number(roleRaw) : roleRaw;

    if (pathname.startsWith("/admin") && ![2,4].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url), { headers });
    }

    const res = NextResponse.next({ headers });
    res.cookies.set("token", token, { path: "/", httpOnly: true, secure: false, sameSite: "lax" });
    return res;

  } catch (err) {
    console.error("JWT inválido:", err);
    const redirectRes = NextResponse.redirect(new URL("/", req.url), { headers });
    redirectRes.cookies.set("token", "", { path: "/", httpOnly: true, secure: false, sameSite: "lax", maxAge: 0 });
    return redirectRes;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
