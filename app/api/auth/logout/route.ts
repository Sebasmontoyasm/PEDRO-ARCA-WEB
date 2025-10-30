import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Sesión cerrada correctamente." });
    
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en logout:", error);
    return NextResponse.json(
      { success: false, message: "Error cerrando sesión." },
      { status: 500 }
    );
  }
}