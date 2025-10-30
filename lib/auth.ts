import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "./database";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

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
      { id: user.id, name: user.name, email: user.email, role: user.role },
      secret,
      { expiresIn: "2h" }
    );

    const dbToken = generateToken();
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    await pool.query(
      `INSERT INTO user_session (user_id, token, last_activity, expired_at, created_at)
       VALUES (?, ?, CURRENT_TIMESTAMP(), ?, CURRENT_TIMESTAMP())`,
      [user.id, dbToken, expires]
    );

    await pool.query(`UPDATE user SET last_login = CURRENT_TIMESTAMP() WHERE id = ?`, [user.id]);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      jwt: jwtToken,
      sessionToken: dbToken,
      expiresAt: expires,
    };
  } catch (error) {
    console.error("Error en LogIn:", error);
    return null;
  }
}
