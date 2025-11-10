import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import bcrypt from "bcryptjs";
import { generateJWT } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Faltan credenciales." }, { status: 400 });

    const SQL = `
      SELECT id, name, email, role, password_hash, salt
      FROM user
      WHERE email = ?
      LIMIT 1;
    `;
    const rows: any = await executeQuery(SQL, [email]);
    const user = Array.isArray(rows) ? rows[0] : rows;
    if (!user) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 401 });

    const passwordMatch = await bcrypt.compare(password + (user.salt ?? ""), user.password_hash);
    if (!passwordMatch) return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });

    await executeQuery(
      `UPDATE user SET last_login = DATE_SUB(NOW(), INTERVAL 1 HOUR) WHERE id = ?`,
      [user.id]
    );

    const token = generateJWT({ id: user.id, name: user.name, email: user.email, role: user.role });

    const res = NextResponse.json({
      message: "Autenticación exitosa",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      path: "/",
      maxAge: 2 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    console.error("❌ Error en login:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
