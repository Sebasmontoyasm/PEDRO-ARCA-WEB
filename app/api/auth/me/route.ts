import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const decoded = verifyJWT(token);
  if (!decoded) return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({ user: decoded });
}
