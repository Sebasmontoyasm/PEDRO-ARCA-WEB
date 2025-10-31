import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Sesión cerrada" });
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: false,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  return res;
}
