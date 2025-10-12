import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
export async function GET() {
  try {
    const censo = await executeQuery(`
       CALL SP_ARCA_METRICS_CENSO();
    `)

    return NextResponse.json(censo)
  } catch (error) {
    console.error("Error fetching censo:", error)
    return NextResponse.json({ error: "Error al obtener censo" }, { status: 500 })
  }
}