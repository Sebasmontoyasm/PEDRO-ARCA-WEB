import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: process.env.DB_TIMEZONE || "-05:00",
  charset: "utf8mb4",
};

export async function GET(req: Request) {
  try {
    // 🧩 1️⃣ Leer cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const token = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // 🧩 2️⃣ Verificar JWT
    const secret = process.env.JWT_SECRET || "secret_key_dev";
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      console.error("JWT inválido:", err);
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // 🧩 3️⃣ Verificar sesión en la BD
    const pool = await mysql.createPool(dbConfig);
    const [rows] = await pool.query<any[]>(
      `
      SELECT us.id AS session_id, us.expired_at, u.name, u.email, u.role
      FROM user_session us
      INNER JOIN user u ON u.id = us.user_id
      WHERE us.user_id = ? 
        AND us.expired_at > NOW()
      ORDER BY us.created_at DESC
      LIMIT 1
      `,
      [decoded.id]
    );

    await pool.end();

    if (!rows || rows.length === 0) {
      console.warn("Sesión no encontrada o expirada para user_id:", decoded.id);
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = rows[0] as {
      session_id: number;
      expired_at: string;
      name: string;
      email: string;
      role: number;
    };

    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.id,
        name: session.name,
        email: session.email,
        role: session.role,
      },
    });
  } catch (err) {
    console.error("Error verificando sesión:", err);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
