// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { LogIn } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos." }, { status: 400 });
    }

    const user = await LogIn(email, password);
    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    // Guardar JWT en cookie httpOnly
    const response = NextResponse.json({
      success: true,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    response.cookies.set("auth_token", user.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
      maxAge: 2 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
