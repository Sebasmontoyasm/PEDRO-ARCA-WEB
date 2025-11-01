import { NextResponse } from "next/server";
import { getMetricCenso } from "@/lib/database";

export async function GET() {
  try {
    const censo = await getMetricCenso();

    return NextResponse.json(censo, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching censo:", error);
    return NextResponse.json(
      { error: "Error al obtener censo" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}
