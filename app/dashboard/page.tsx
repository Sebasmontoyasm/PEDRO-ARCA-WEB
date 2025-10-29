"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DateRange } from "react-day-picker";

import MetricsGrid from "@/components/metrics-grid";
import CensoTable from "@/components/censo-table";
import Footer from "@/components/footer";
import { Ingreso } from "@/types/censo";

export default function DashboardPage() {
  const [dark] = useState(true);
  const [data, setData] = useState<Ingreso[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [filtroRangoIngreso, setFiltroRangoIngreso] = useState<DateRange | undefined>();
  const [filtroRangoProcesado, setFiltroRangoProcesado] = useState<DateRange | undefined>();
  const [estadosUnicos, setEstadosUnicos] = useState<string[]>([]);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/censo");
        const json = await res.json();

        const mapped: Ingreso[] = json.censo.map((item: any) => ({
          AINID: item.AINID,
          AINCONSEC: String(item.AINCONSEC),
          GPANOMCOM: item.GPANOMCOM,
          AINFECING: item.AINFECING ? item.AINFECING : "-",
          PACNUMDOC: item.PACNUMDOC,
          OBSERVACION: item.OBSERVACION || "-",
          ESTADO: item.ESTADO,
          documentos: [
            { label: "Validados", value: Number(item.PROCESADO) || 0 },
            { label: "Inválidos", value: Number(item.PARCIALES) || 0 },
            { label: "Totales", value: Number(item.TOTAL) || 0 },
          ],
          EXACTITUD: Number(item.EXACTITUD) || 0,
          FECHAINSERT: item.FECHAINSERT ? item.FECHAINSERT : "-",
          TIMEPROCESS: item.TIMEPROCESS || "-",
        }));

        setData(mapped);
        const estados = Array.from(new Set(mapped.map(i => i.ESTADO)));
        setEstadosUnicos(estados);
      } catch (err) {
        console.error("Error cargando censo:", err);
      }
    };

    fetchData();
  }, []);

  const handleResetFiltros = () => {
    setFiltroEstado("todos");
    setBusqueda("");
    setFiltroRangoIngreso(undefined);
    setFiltroRangoProcesado(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <DashboardHeader />
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Contenido igual */}
        <MetricsGrid />
        <CensoTable
          data={data}
          filtroEstado={filtroEstado}
          busqueda={busqueda}
          filtroRangoIngreso={filtroRangoIngreso}
          filtroRangoProcesado={filtroRangoProcesado}
        />
        <Footer />
      </main>
    </div>
  );
}
