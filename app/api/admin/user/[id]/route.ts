import { NextResponse } from "next/server";
import { updateUser, deleteUser } from "@/lib/database";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const { name, email, password, role } = await req.json();

    if (!id || !name || !email || !role) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    await updateUser({ id, name, email, password, role });

    return NextResponse.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await deleteUser(id);

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "El correo electrónico ya está registrado." }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

}
