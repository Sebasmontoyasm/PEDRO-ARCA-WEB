import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const decoded = verifyJWT(token);
  if (!decoded) return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({ user: decoded });
}
