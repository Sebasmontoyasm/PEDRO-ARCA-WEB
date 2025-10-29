import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import mysql from "mysql2/promise";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: process.env.DB_TIMEZONE || "-05:00",
  charset: "utf8mb4",
};

const pool = mysql.createPool(dbConfig);

export async function LogIn(email: string, password: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, name, email, password_hash, salt, role FROM user WHERE email = ? AND deleted IS NULL",
      [email]
    );

    if (!rows || rows.length === 0) return null;
    const user = rows[0];

    const isMatch = await bcrypt.compare(password + user.salt, user.password_hash);
    if (!isMatch) return null;

    const secret = process.env.JWT_SECRET || "secret_key_dev";
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: "2h" }
    );

    // Sesión en BD
    const dbToken = generateToken();
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO user_session (user_id, token, last_activity, created_at, expired_at)
       VALUES (?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), ?)`,
      [user.id, dbToken, expires]
    );

    await pool.query(
      `UPDATE user SET last_login = CURRENT_TIMESTAMP() WHERE id = ?`,
      [user.id]
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      jwt: jwtToken,
    };
  } catch (error) {
    console.error("Error en LogIn:", error);
    return null;
  }
}
