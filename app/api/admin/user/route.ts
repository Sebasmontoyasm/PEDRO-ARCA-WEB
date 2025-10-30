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
    return NextResponse.json(result);
  } catch (err: any) {
    // 🧠 Manejo específico de duplicados
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado." },
        { status: 400 }
      );
    }

    // 🧱 Manejo general
    return NextResponse.json(
      { error: err.message || "Error en el servidor" },
      { status: 400 }
    );
  }
}
