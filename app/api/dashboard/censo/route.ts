import { NextResponse } from "next/server"
import { getMetricCenso, censoProcess } from "@/lib/database"
export async function GET() {
  try {
    const censoProc = await censoProcess('3342');
    const censo = await getMetricCenso()
    return NextResponse.json(censo)
  } catch (error) {
    console.error("Error fetching censo:", error)
    return NextResponse.json({ error: "Error al obtener censo" }, { status: 500 })
  }
}