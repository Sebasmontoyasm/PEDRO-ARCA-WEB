// app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import bcrypt from "bcryptjs";
import { generateJWT } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // ⚙️ Validación básica
    if (!email || !password) {
      return NextResponse.json({ error: "Faltan credenciales." }, { status: 400 });
    }

    // 🔍 Buscar usuario
    const SQL = `
      SELECT id, name, email, role, password_hash, salt
      FROM user
      WHERE email = ?
      LIMIT 1;
    `;
    const rows: any = await executeQuery(SQL, [email]);
    const user = Array.isArray(rows) ? rows[0] : rows;

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 401 });
    }

    // 🔑 Verificar contraseña
    const passwordMatch = await bcrypt.compare(password + (user.salt ?? ""), user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    // ⏱️ Actualizar última conexión (ajustada -1 hora)
    await executeQuery(
      `UPDATE user SET last_login = DATE_SUB(NOW(), INTERVAL 1 HOUR) WHERE id = ?`,
      [user.id]
    );

    // 🎟️ Generar JWT
    const token = generateJWT({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // 🍪 Crear respuesta con cookie
    const res = NextResponse.json({
      message: "Autenticación exitosa",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // ✅ Cookie segura y con expiración 2h
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 2 * 60 * 60, // 2 horas
    });

    return res;
  } catch (err: any) {
    console.error("❌ Error en login:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
