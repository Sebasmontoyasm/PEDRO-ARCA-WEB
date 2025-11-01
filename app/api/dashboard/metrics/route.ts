import { NextResponse } from "next/server";
import { getMetricDocs, getMetricGeneral, getMetricCensoxMes } from "@/lib/database";

export async function GET() {
  try {
    const metricDocs = await getMetricDocs();
    const metricGeneral = await getMetricGeneral();
    const metricCensoxMes = await getMetricCensoxMes();

    const data = {
      docs: metricDocs,
      general: metricGeneral,
      censoxmes: metricCensoxMes,
    };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error en API de métricas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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
