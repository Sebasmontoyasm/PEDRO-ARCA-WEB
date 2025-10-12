"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircleIcon, XCircleIcon, FileTextIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

interface CensoTableProps {
  filtroIngreso: string
  filtroEstado: string
  filtroRango?: DateRange
  busqueda: string
}

interface Documento {
  label: string
  value: number
}

interface Ingreso {
  AINCONSEC: string
  AINFECING: string
  PACNUMDOC: string
  GPANOMCOM: string
  ESTADO: string
  documentos: Documento[]
  FECHAINSERT: string
  OBSERVACION: string
  exactitud: number
  TIMEPROCESS: string
}

// ✅ Función para formatear fecha: YYYY/MM/DD HH:mm (zona Bogotá)
const formatDate = (date: string | null) => {
  if (!date || date === "-") return "-"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Bogota",
  })
    .format(d)
    .replace(",", "")
    .replace(/\//g, "/")
}

export default function CensoTable({
  filtroIngreso,
  filtroEstado,
  filtroRango,
  busqueda,
}: CensoTableProps) {
  const [data, setData] = useState<Ingreso[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/censo")
        const json = await res.json()

        const mapped: Ingreso[] = json[0].map((item: any) => ({
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
          exactitud: Number(item.EXACTITUD) || 0,
          FECHAINSERT: item.FECHAINSERT ? item.FECHAINSERT : "-",
          TIMEPROCESS: item.TIMEPROCESS || "-",
        }))

        setData(mapped)
      } catch (err) {
        console.error("Error cargando censo:", err)
      }
    }

    fetchData()
  }, [])

  const getDocumentoIcon = (label: string) => {
    switch (label) {
      case "Validados":
        return <CheckCircleIcon className="h-4 w-4 text-green-400" />
      case "Inválidos":
        return <XCircleIcon className="h-4 w-4 text-red-400" />
      case "Totales":
        return <FileTextIcon className="h-4 w-4 text-blue-400" />
      default:
        return null
    }
  }

  const filteredData = data.filter((item) => {
    const fechaIngreso = item.AINFECING !== "-" ? new Date(item.AINFECING) : null

    const matchesIngreso =
      !filtroIngreso ||
      item.AINCONSEC.toLowerCase().includes(filtroIngreso.toLowerCase())

    const matchesBusqueda =
      !busqueda ||
      item.GPANOMCOM.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.AINCONSEC.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.PACNUMDOC?.toLowerCase().includes(busqueda.toLowerCase())

    const matchesFecha =
      !filtroRango?.from ||
      !filtroRango?.to ||
      (fechaIngreso &&
        fechaIngreso >= filtroRango.from &&
        fechaIngreso <= filtroRango.to)

    return matchesIngreso && matchesBusqueda && matchesFecha
  })

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 w-full">
      <h2 className="text-lg font-semibold text-white mb-2">
        Resultados de Validación
      </h2>
      <p className="text-slate-400 mb-4 text-sm">
        {filteredData.length} de {data.length} ingresos mostrados
      </p>

      {/* 🔹 Scroll horizontal si el contenido no cabe */}
      <div className="overflow-x-auto">
        <Table className="min-w-full border-collapse text-xs md:text-sm whitespace-nowrap">
          <TableHeader>
            <TableRow className="border-slate-700 bg-slate-700/50">
              {[
                "N° Ingreso",
                "Fecha de ingreso",
                "Documento",
                "Paciente",
                "Estado",
                "Documentos",
                "Exactitud",
                "Observación",
                "Fecha procesado",
                "Tiempo procesado",
                "Acciones",
              ].map((col) => (
                <TableHead
                  key={col}
                  className="text-slate-300 px-2 py-3 text-center"
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map((item) => (
              <TableRow
                key={item.AINCONSEC}
                className="border-slate-700 hover:bg-slate-700/50"
              >
                <TableCell className="text-white px-2 py-3 text-center">
                  {item.AINCONSEC}
                </TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-center">
                  {formatDate(item.AINFECING)}
                </TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-center">
                  {item.PACNUMDOC}
                </TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-center truncate max-w-[180px]">
                  {item.GPANOMCOM}
                </TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-center">
                  {item.ESTADO}
                </TableCell>
                <TableCell className="px-2 py-3 text-left">
                  <div className="space-y-1">
                    {item.documentos.map((doc, i) => (
                      <div key={i} className="flex items-center gap-1">
                        {getDocumentoIcon(doc.label)}
                        <span className="flex-1 text-slate-300">{doc.label}</span>
                        <span className="text-xs text-slate-400">{doc.value}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="px-2 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Progress value={item.exactitud} className="w-16 bg-slate-700" />
                    <span className="text-sm font-medium text-white">
                      {item.exactitud}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-left truncate max-w-[200px]">
                  {item.OBSERVACION}
                </TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-center">
                  {formatDate(item.FECHAINSERT)}
                </TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-center">
                  {item.TIMEPROCESS}
                </TableCell>
                <TableCell className="px-2 py-3 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900 bg-transparent"
                  >
                    Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
