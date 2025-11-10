"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  SearchCheck,
  Bot,
  CircleX,
  FileText,
  TrendingUp,
  Users,
  FileWarning,
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Metric, Metric_Doc, Metric_General } from "@/types/metrics-grid";
import { Document } from "@/types/document";

export default function MetricsGrid() {
  const [generalMetric, setMetric] = useState<Metric[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [docsGenerales, setDocsGenerales] = useState<Metric_Doc[]>([]);

  useEffect(() => {
    let isMounted = true;
    let controller = new AbortController();

    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/dashboard/metrics", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Error al obtener métricas");
        const dataMetrics = await res.json();

        // === Procesamiento de datos ===
        const generalArray: Metric_General[] = dataMetrics.general || [];
        const general = generalArray.reduce<Record<string, number>>((acc, row) => {
          acc[row.NOMBRE.toUpperCase()] = row.TOTAL;
          return acc;
        }, {});

        const pendientes =
          (generalArray.find((g) => g.NOMBRE === "Pendiente")?.TOTAL ?? 0) +
          (generalArray.find((g) => g.NOMBRE === "Descargado")?.TOTAL ?? 0) +
          (generalArray.find((g) => g.NOMBRE === "Reprocesar")?.TOTAL ?? 0);

        const procesado = general.PROCESADO ?? 0;
        const incompleto = general.INCOMPLETO ?? 0;
        const procesadoTotal = procesado + incompleto;
        const tasaCumplimiento =
          procesadoTotal > 0
            ? ((procesado / procesadoTotal) * 100).toFixed(2)
            : "0.00";

        const docs: Document = dataMetrics.docs?.[0] || {
          PROCESADO: 0,
          PARCIALES: 0,
          TASA_CUMPLIMIENTO: "0.00",
        };

        const docsGeneralesCalc: Metric_Doc[] = [
          {
            title: "Documentos Validados",
            value: docs.PROCESADO,
            trendColor: "text-green-400",
            icon: FileText,
            showProgress: false,
          },
          {
            title: "Documentos Rechazados",
            value: docs.PARCIALES,
            trendColor: "text-red-400",
            icon: FileWarning,
            showProgress: false,
          },
          {
            title: "Tasa de cumplimiento de documentos",
            value: `${docs.TASA_CUMPLIMIENTO}%`,
            color: "text-green-400",
            trendColor: "text-green-400",
            icon: TrendingUp,
            showProgress: true,
          },
        ];

        const censoxmes = dataMetrics.censoxmes || [];
        const monthNames = [
          "Ene", "Feb", "Mar", "Abr", "May", "Jun",
          "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
        ];
        const barArray = censoxmes.map((row: { MES: string; TOTAL: number }) => {
          const [year, month] = row.MES.split("-");
          return {
            name: `${monthNames[parseInt(month) - 1]} ${year}`,
            ingresos: row.TOTAL,
            year,
          };
        });

        if (isMounted) {
          setDocsGenerales(docsGeneralesCalc);
          setPieData([
            { name: "Procesados", value: procesado, color: "#22c55e" },
            { name: "Incompletos", value: incompleto, color: "#f43f5e" },
            { name: "Pendientes", value: pendientes, color: "#3b82f6" },
          ]);
          setBarData(barArray);
          if (!selectedYear && barArray.length > 0) {
            setSelectedYear(barArray[0].year);
          }
          setMetric([
            { title: "Ingresos Pendientes", value: pendientes, trend: "up", icon: Users },
            { title: "Ingresos Procesados", value: procesadoTotal, trend: "up", icon: SearchCheck },
            { title: "Ingresos sin documentos obligatorios", value: general.INCOMPLETO ?? 0, trend: "down", icon: CircleX, color: "text-red-400" },
            { title: "Ingresos con documentación completa", value: procesado, trend: "up", icon: Bot, color: "text-green-400" },
            { title: "Tasa de cumplimiento de ingresos", value: `${tasaCumplimiento}%`, trend: "up", icon: TrendingUp, color: "text-green-400", showProgress: true },
          ]);
        }
      } catch (error: any) {
        if (error.name !== "AbortError") console.error("Error obteniendo métricas:", error);
      }
    };

    // Primera carga inmediata
    fetchMetrics();

    // Intervalo de refresco
    const interval = setInterval(() => {
      controller.abort(); // aborta fetch anterior
      controller = new AbortController(); // nuevo controlador
      fetchMetrics();
    }, 15000);

    // Limpieza al desmontar
    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [selectedYear]); // permite refrescar también si cambia el año

  // === Datos filtrados por año ===
  const filteredBarData = barData.filter((d) => d.year === selectedYear);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {generalMetric.map((metric, index) => {
        const Icon = metric.icon;
        const isPositive = metric.trend === "up";
        return (
          <Card key={index} className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                {metric.title}
              </CardTitle>
              <Icon
                className={`h-4 w-4 ${
                  metric.color ?? (isPositive ? "text-green-400" : "text-red-400")
                }`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${metric.color ?? "text-white"}`}
              >
                {metric.value}
              </div>
              {metric.showProgress && (
                <div className="mt-2">
                  <Progress
                    value={parseFloat(String(metric.value).replace("%", ""))}
                    className="w-full bg-slate-700"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {docsGenerales.map((doc, index) => {
        const Icon = doc.icon;
        return (
          <Card key={index} className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                {doc.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${doc.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${doc.color}`}>
                {doc.value}
              </div>
              {doc.showProgress && (
                <div className="mt-2">
                  <Progress
                    value={parseFloat(String(doc.value).replace("%", ""))}
                    className="w-full bg-slate-700"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* === Charts === */}
      <div className="md:col-span-4 flex flex-col md:flex-row gap-6">
        <Card className="flex-1 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">
              Distribución de Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex-1 bg-slate-800 border-slate-700">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-white">
              Ingresos Mensuales
            </CardTitle>
            <select
              className="bg-slate-700 text-white text-sm p-1 rounded"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {[...new Set(barData.map((d) => d.year))].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip formatter={(value: number) => [`${value}`, "Ingresos"]} />
                <Legend />
                <Bar dataKey="ingresos" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
