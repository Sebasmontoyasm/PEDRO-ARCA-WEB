// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/database";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map(c => {
        const [key, ...vals] = c.split("=")
        return [key, vals.join("=")]
      })
    );

    const token = cookies["auth_token"];
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const payload: any = jwt.verify(token, process.env.JWT_SECRET || "secret_key_dev");

    // Verificar sesión activa en BD
    const [rows]: any = await pool.query(
      "SELECT * FROM user_session WHERE user_id = ? AND token = ? AND expired_at > CURRENT_TIMESTAMP()",
      [payload.id, token]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role
      }
    });

  } catch (err) {
    console.error("Error /api/auth/me:", err);
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
