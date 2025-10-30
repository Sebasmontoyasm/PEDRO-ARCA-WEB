import { NextResponse } from "next/server"
import { getUsers, getUsersRoles } from "@/lib/database"

export async function GET() {
  try {
    const users = await getUsers()
    const roles = await getUsersRoles()

    // Convertir las fechas a ISO string para el frontend
    const formattedUsers = users.map((u: any) => ({
      ...u,
      last_login: u.last_login ? new Date(u.last_login).toISOString() : null,
      created: u.created ? new Date(u.created).toISOString() : null,
      last_activity: u.last_activity ? new Date(u.last_activity).toISOString() : null,
      expired_at: u.expired_at ? new Date(u.expired_at).toISOString() : null,
      sesion: u.sesion ? new Date(u.sesion).toISOString() : null,
    }))

    return NextResponse.json({ users: formattedUsers, roles })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}
