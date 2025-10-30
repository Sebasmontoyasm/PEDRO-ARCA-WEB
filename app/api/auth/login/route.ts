// app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import bcrypt from "bcryptjs";
import { generateJWT } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan credenciales." }, { status: 400 });
    }

    const SQL = `SELECT id, name, email, role, password_hash, salt FROM user WHERE email = ? LIMIT 1`;
    const rows: any = await executeQuery(SQL, [email]);

    // executeQuery puede devolver: rows (array) o [rows] dependiendo de implementación.
    const user = Array.isArray(rows) ? rows[0] : rows;
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 401 });
    }

    // ---- CORRECCIÓN CLAVE: comparar con bcrypt.compare ----
    // El hash almacenado debe ser comparado usando bcrypt.compare(password + salt, storedHash)
    const passwordMatch = await bcrypt.compare(password + (user.salt ?? ""), user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    // Generar JWT incluyendo name (para que /api/auth/me y middleware lo lean)
    const token = generateJWT({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Respuesta y cookie (cookie httpOnly creada POR EL BACKEND)
    const res = NextResponse.json({
      message: "Autenticación exitosa",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 2 * 60 * 60, // 2 horas
    });

    return res;
  } catch (err) {
    console.error("Error en login:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
