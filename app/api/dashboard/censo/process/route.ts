import { NextRequest, NextResponse } from "next/server";
import { censoProcess } from "@/lib/database";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ainid = searchParams.get("ainid");

    if (!ainid) {
      return NextResponse.json({ error: "Falta el parámetro ainid" }, { status: 400 });
    }

    const result = await censoProcess(Number(ainid));
    return NextResponse.json(result.censoProcess);
  } catch (error) {
    console.error("Error ejecutando SP_ARCA_CENSO_PROCESS:", error);
    return NextResponse.json({ error: "Error al procesar el censo" }, { status: 500 });
  }
}
