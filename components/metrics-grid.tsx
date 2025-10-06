"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  SearchCheck,
  Bot,
  CircleX,
  FileText,
  TrendingUp,
  Users,
  FileWarning,
} from "lucide-react"
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
} from "recharts"
import {
  Metric,
  Metric_Doc,
  Metric_General,
  Metric_IA,
} from "@/types/metrics-grid"

export default function Page() {
  const [generalMetric, setMetric] = useState<Metric[]>([])
  const [pieData, setPieData] = useState<any[]>([])
  const [barData, setBarData] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [docsGenerales, setDocsGenerales] = useState<any[]>([])

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/dashboard/metrics")
        const dataMetrics = await res.json()

        const ia: Metric_IA[] = dataMetrics.ia
        const generalArray: Metric_General[] = dataMetrics.general

        const general = generalArray.reduce<Record<string, number>>(
          (acc, row) => {
            acc[row.NOMBRE.toUpperCase()] = row.TOTAL
            return acc
          },
          {}
        )

        const penReal =
          (generalArray.find((g) => g.NOMBRE === "Pendiente")?.TOTAL ?? 0) +
          (generalArray.find((g) => g.NOMBRE === "Descargado")?.TOTAL ?? 0)

        const pProcesado =
          (generalArray.find((g) => g.NOMBRE === "Procesado")?.TOTAL ?? 0) +
          (generalArray.find((g) => g.NOMBRE === "Incompleto")?.TOTAL ?? 0)

        const exactitud =
          general.PROCESADO + general.INCOMPLETO > 0
            ? (
              (general.PROCESADO /
                (general.PROCESADO + general.INCOMPLETO)) *
              100
            ).toFixed(2)
            : "0.00"
         
      

        const docs: Metric_Doc[] = dataMetrics.docs
        const docsGeneralesCalc = [
          {
            title: "Documentos Validados",
            value: docs.reduce(
              (sum, doc) => sum + Number(doc.PROCESADO ?? 0),
              0
            ),
            color: "text-white",
            trendColor: "text-green-400",
            icon: FileText,
            // description:  "+15.3% vs día anterior",
          },
          {
            title: "Documentos Rechazados",
            value: docs.reduce(
              (sum, doc) => sum + Number(doc.PARCIALES ?? 0),
              0
            ),
            color: "text-red-400",
            trendColor: "text-red-400",
            icon: FileWarning,
            // description:  "-12.8% vs día anterior",
          },
        ]
        setDocsGenerales(docsGeneralesCalc)

        setPieData([
          {
            name: "Procesados",
            value:
              generalArray.find((g) => g.NOMBRE === "Procesado")?.TOTAL ?? 0,
            color: "#22c55e",
          },
          {
            name: "Incompletos",
            value:
              generalArray.find((g) => g.NOMBRE === "Incompleto")?.TOTAL ?? 0,
            color: "#f43f5e",
          },
          {
            name: "Pendientes",
            value:
              penReal ?? 0,
            color: "#3b82f6",
          },
        ])

        const censoxmes = dataMetrics.censoxmes
        const monthNames = [
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Sep",
          "Oct",
          "Nov",
          "Dic",
        ]

        const barProcessed = censoxmes.map(
          (row: { MES: string; TOTAL: number }) => {
            const [year, month] = row.MES.split("-")
            return {
              name: `${monthNames[parseInt(month) - 1]} ${year}`,
              ingresos: row.TOTAL,
              year: year,
            }
          }
        )

        setBarData(barProcessed)

        if (barProcessed.length > 0 && !selectedYear) {
          setSelectedYear(barProcessed[0].year)
        }

        const mapped: Metric[] = [
          {
            title: "Ingresos Pendientes",
            value: general.PENDIENTE ?? 0,
           // change:"+100%",
            trend: "up",
            icon: Users,
            // description:  "Identificaciones correctas",
          },
          {
            //Cambiar esta por suma de procesados a incompletos
            title: "Ingresos Procesados",
            value: pProcesado ?? 0,
           // change:"+0%",
            trend: "up",
            icon: SearchCheck,
            // description:  "Identificaciones correctas",
          },
          {
            title: "Ingresos sin documentos obligatorios",
            value: general.INCOMPLETO ?? 0,
           // change:"",
            trend: "down",
            icon: CircleX,
            // description:  "Sin documentos obligatorios",
          },
          {
            title: "Ingresos con documentacion completa",
            value: generalArray.find((g) => g.NOMBRE === "Procesado")?.TOTAL ?? 0,
           // change:"0%",
            trend: "up",
            icon: Bot,
            // description:  "Promedio de exactitud %",
          },
           {
            title: "Tasa de cumplimiento de ingresos",
            value: `${exactitud}%`,
           // change:"0%",
            trend: "up",
            icon: Bot,
            // description:  "Promedio de exactitud %",
          }
        ]

        setMetric(mapped)
      } catch (error) {
        console.error("Error obteniendo métricas:", error)
      }
    }

    fetchMetrics()
  }, [selectedYear])

  const filteredBarData = barData.filter((d) => d.year === selectedYear)

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <h2 className="text-xl font-bold tracking-tight text-white">
        Métricas Generales
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {generalMetric.map((metric, index) => {
          const Icon = metric.icon
          const isPositive = metric.trend === "up"

          return (
            <Card key={index} className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {metric.title}
                </CardTitle>
                <Icon
                  className={`h-4 w-4 ${metric.color ??
                    (isPositive ? "text-green-400" : "text-red-400")
                    }`}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${metric.color ?? "text-white"
                    }`}
                >
                  {metric.value}
                </div>
                <p
                  className={`text-xs ${isPositive ? "text-green-400" : "text-red-400"
                    }`}
                >
                  {metric.change} – {metric.description}
                </p>
                {(metric.title === "Exactitud" ||
                  metric.title === "Confianza Promedio") && 
                    <div className="mt-2">
                      <Progress
                        value={parseFloat(String(metric.value))}
                        className="w-full bg-slate-700"
                      />
                    </div>
                  }
              </CardContent>
            </Card>
          )
        })}

        {docsGenerales.map((doc, index) => {
          const Icon = doc.icon
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
                <p className={`text-xs ${doc.trendColor}`}>{doc.description}</p>
              </CardContent>
            </Card>
          )
        })}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Tasa de cumplimiento de documentos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400"></div>
            <p className="text-xs text-green-400">docvalidos/docrechazados+docvalidos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
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

        <Card className="bg-slate-800 border-slate-700">
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
                <Tooltip
                  formatter={(value: number) => [`${value}`, "Ingresos"]}
                />
                <Legend />
                <Bar dataKey="ingresos" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
