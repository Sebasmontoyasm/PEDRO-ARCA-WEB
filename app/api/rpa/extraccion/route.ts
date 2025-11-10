import { NextResponse } from "next/server"
import { getTimeArcaExtraccion } from "@/lib/database"


export async function GET() {
  try {
    const dateArcaExtraccion = await getTimeArcaExtraccion()
    return NextResponse.json(dateArcaExtraccion, {
       headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    
  } catch (error) {
    console.error("Error fetching censo:", error)
    return NextResponse.json({ error: "Error al obtener censo" }, { status: 500 })
  }
}