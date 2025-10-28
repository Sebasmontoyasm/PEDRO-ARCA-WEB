import { NextResponse } from "next/server";
import { reprocesarIngreso } from "@/lib/database";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ainid = searchParams.get("ainid");

    console.log("[API] Reprocesando ingreso ID:", ainid);

    if (!ainid || isNaN(Number(ainid))) {
      return NextResponse.json(
        { success: false, message: "ID de ingreso no válido." },
        { status: 400 }
      );
    }

    const result = await reprocesarIngreso(Number(ainid));

    return NextResponse.json(
      {
        success: true,
        message: `Ingreso ${ainid} reprocesado correctamente.`,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API ERROR] Error al reprocesar ingreso:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error al reprocesar el ingreso.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
