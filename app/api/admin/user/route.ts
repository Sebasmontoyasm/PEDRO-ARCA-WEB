import { NextResponse } from "next/server";
import { getAllUsersAndRoles, createUser } from "@/lib/database";

export async function GET() {
  try {
    const { users, roles } = await getAllUsersAndRoles();
    return NextResponse.json({ users, roles });
  } catch (error) {
    console.error("Error obteniendo usuarios y roles:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios y roles" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createUser(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creando usuario:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear usuario" },
      { status: 500 }
    );
  }
}
