import { NextResponse } from "next/server"
import { getMetricDocs, getMetricGeneral, getMetricCensoxMes } from "@/lib/database"

export async function GET() {
  try {
    const metricDocs = await getMetricDocs()
    const metricGeneral = await getMetricGeneral()
    const metricCensoxMes = await getMetricCensoxMes()

    return NextResponse.json({
      docs: metricDocs,
      general: metricGeneral,
      censoxmes: metricCensoxMes
    })
  } catch (error) {
    console.error("Error en API de métricas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
