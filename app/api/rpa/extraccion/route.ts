import { NextResponse } from "next/server"
import { getTimeArcaExtraccion } from "@/lib/database"


export async function GET() {
  try {
    const dateArcaExtraccion = await getTimeArcaExtraccion()
    return NextResponse.json(dateArcaExtraccion)
  } catch (error) {
    console.error("Error fetching censo:", error)
    return NextResponse.json({ error: "Error al obtener censo" }, { status: 500 })
  }
}