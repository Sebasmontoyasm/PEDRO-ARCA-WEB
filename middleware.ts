import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function verifyJWT(token: string, secret: string) {
  const [headerB64, payloadB64, signatureB64] = token.split(".");
  const encoder = new TextEncoder();
  const data = `${headerB64}.${payloadB64}`;

  const signature = Uint8Array.from(
    atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0)
  );

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    encoder.encode(data)
  );

  if (!valid) throw new Error("Invalid signature");

  const payload = JSON.parse(
    atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
  );

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw new Error("Token expired");
  }

  return payload;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isDashboard = path.startsWith("/dashboard");

  if (isDashboard) {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    try {
      await verifyJWT(token, process.env.JWT_SECRET || "secret_key_dev");
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
