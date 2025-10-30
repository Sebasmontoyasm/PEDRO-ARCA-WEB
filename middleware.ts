export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secret_key_dev");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPaths = ["/admin", "/dashboard"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("token")?.value ?? req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    const roleRaw = (payload as any).role;
    const role = typeof roleRaw === "string" ? Number(roleRaw) : roleRaw;

    if (pathname.startsWith("/admin") && ![2, 4].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Error verificando token:", err);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
