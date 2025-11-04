"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CalendarIcon,
  FilterIcon,
  SearchIcon,
  RotateCcwIcon,
  DownloadIcon,
  FileTextIcon,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import MetricsGrid from "@/components/metrics-grid";
import CensoTable from "@/components/censo-table";
import Footer from "@/components/footer";
import { Ingreso } from "@/types/censo";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [dark] = useState(true);

  const [data, setData] = useState<Ingreso[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [filtroRangoIngreso, setFiltroRangoIngreso] = useState<DateRange | undefined>();
  const [filtroRangoProcesado, setFiltroRangoProcesado] = useState<DateRange | undefined>();
  const [estadosUnicos, setEstadosUnicos] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/dashboard/censo", {
        credentials: "include",
        cache: "no-store",
        next: { revalidate: 0 }
      });
      const json = await res.json();

      const mapped: Ingreso[] = json.censo.map((item: any) => ({
        AINID: item.AINID,
        AINCONSEC: String(item.AINCONSEC),
        GPANOMCOM: item.GPANOMCOM,
        AINFECING: item.AINFECING || "-",
        PACNUMDOC: item.PACNUMDOC,
        OBSERVACION: item.OBSERVACION || "-",
        ESTADO: item.ESTADO,
        documentos: [
          { label: "Validados", value: Number(item.PROCESADO) || 0 },
          { label: "Inválidos", value: Number(item.PARCIALES) || 0 },
          { label: "Totales", value: Number(item.TOTAL) || 0 },
        ],
        EXACTITUD: Number(item.EXACTITUD) || 0,
        FECHAINSERT: item.FECHAINSERT || "-",
        TIMEPROCESS: item.TIMEPROCESS || "-",
      }));

      setData(mapped);
      setEstadosUnicos(Array.from(new Set(mapped.map((i) => i.ESTADO))));
    } catch (err) {
      console.error("Error cargando censo:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(); // primera carga
    const interval = setInterval(fetchData, 60000); // cada 60 segundos
    return () => clearInterval(interval);
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
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileTextIcon className="h-8 w-8 text-yellow-500" />
            <div>
              <h1 className="text-2xl font-bold">Panel de Ingresos de Pedro Arca</h1>
              <p className="text-sm text-slate-300">
                Sistema de validación de documentos con IA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isRefreshing && (
              <p className="text-sm text-slate-400 animate-pulse">Actualizando...</p>
            )}
            <Button
              onClick={fetchData}
              variant="outline"
              size="sm"
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900 bg-transparent"
            >
              <RotateCcwIcon className="h-4 w-4 mr-2" />
              Refrescar
            </Button>
          </div>
        </div>

        {/* MÉTRICAS */}
        <MetricsGrid />

        {/* FILTROS */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="flex items-center gap-2 text-white text-lg font-semibold">
              <FilterIcon className="h-5 w-5 text-yellow-500" /> Filtros de Búsqueda
            </h2>
            <Button
              onClick={handleResetFiltros}
              className="w-8 h-8 rounded text-sm bg-black border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900 transition-colors"
              title="Reiniciar filtros"
            >
              <RotateCcwIcon className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-slate-400 mb-4">
            Filtra los resultados por estado, fecha de ingreso, fecha procesado o búsqueda general
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* BÚSQUEDA GENERAL */}
            <div>
              <label className="text-sm font-medium text-white">Búsqueda General</label>
              <div className="relative mt-1">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por n° ingreso, documento o paciente"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* ESTADO */}
            <div>
              <label className="text-sm font-medium text-white">Estado del ingreso</label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="todos" className="text-white hover:bg-slate-600">
                    Todos
                  </SelectItem>
                  {estadosUnicos.map((estado) => (
                    <SelectItem
                      key={estado}
                      value={estado.toLowerCase()}
                      className="text-white hover:bg-slate-600"
                    >
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RANGO INGRESO */}
            <div>
              <label className="text-sm font-medium text-white">Rango de ingreso</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600 mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtroRangoIngreso?.from ? (
                      filtroRangoIngreso.to ? (
                        <>
                          {format(filtroRangoIngreso.from, "PPP", { locale: es })} -{" "}
                          {format(filtroRangoIngreso.to, "PPP", { locale: es })}
                        </>
                      ) : (
                        format(filtroRangoIngreso.from, "PPP", { locale: es })
                      )
                    ) : (
                      "Seleccionar rango"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-slate-700 border-slate-600"
                  align="start"
                >
                  <Calendar
                    mode="range"
                    selected={filtroRangoIngreso}
                    onSelect={setFiltroRangoIngreso}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* RANGO PROCESADO */}
            <div>
              <label className="text-sm font-medium text-white">Rango de procesado</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-white hover:bg-slate-600 mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtroRangoProcesado?.from ? (
                      filtroRangoProcesado.to ? (
                        <>
                          {format(filtroRangoProcesado.from, "PPP", { locale: es })} -{" "}
                          {format(filtroRangoProcesado.to, "PPP", { locale: es })}
                        </>
                      ) : (
                        format(filtroRangoProcesado.from, "PPP", { locale: es })
                      )
                    ) : (
                      "Seleccionar rango"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-slate-700 border-slate-600"
                  align="start"
                >
                  <Calendar
                    mode="range"
                    selected={filtroRangoProcesado}
                    onSelect={setFiltroRangoProcesado}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* TABLA */}
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
