import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { executeQuery } from '@/lib/database'
import validator from 'validator'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'
const TOKEN_EXPIRATION_SECONDS = 60 * 60 // 1 hora

const DUMMY_PASSWORD = '__DUMMY_PASSWORD__'
const DUMMY_HASH = bcrypt.hashSync(DUMMY_PASSWORD, 10)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!email || !password) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 400 })
    }

    if (!validator.isEmail(email) || email.length > 320) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 400 })
    }

    if (password.length > 200) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 400 })
    }

    const userQuery = `SELECT id, email, password FROM user WHERE email = ? LIMIT 1;`
    const userResult: any = await executeQuery(userQuery, [email])

    const rows = Array.isArray(userResult) ? userResult : []
    const user = rows[0]

    let passwordMatches = false
    if (user && user.password) {
      passwordMatches = await bcrypt.compare(password, user.password)
    } else {
      await bcrypt.compare(password, DUMMY_HASH).catch(() => {})
      passwordMatches = false
    }

    if (!passwordMatches) {
      return NextResponse.json({ error: 'Email o contraseña inválidos' }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION_SECONDS }
    )

    const insertSessionQuery = `
      INSERT INTO user_sessions (userId, token, expiresAt)
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND));
    `
    await executeQuery(insertSessionQuery, [user.id, token, TOKEN_EXPIRATION_SECONDS])

  } catch (err) {
    console.error('Login error:', (err as any)?.message ?? err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
