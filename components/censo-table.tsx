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

interface CensoTableProps {
  filtroIngreso: string
  filtroEstado: string
  filtroFecha?: Date
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

export default function CensoTable({
  filtroIngreso,
  filtroEstado,
  filtroFecha,
  busqueda,
}: CensoTableProps) {
  const [data, setData] = useState<Ingreso[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/censo")
        const json = await res.json()

        const mapped: Ingreso[] = json[0].map((item: any) => {

          return {
            AINCONSEC: String(item.AINCONSEC),
            GPANOMCOM: item.GPANOMCOM,
            AINFECING: item.AINFECING
              ? new Date(item.AINFECING).toLocaleString("es-CO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "America/Bogota",
                })
              : "-",
            PACNUMDOC: item.PACNUMDOC,
            OBSERVACION: item.OBSERVACION || "-",
            ESTADO: item.ESTADO,
            documentos: [
              { label: "Validados", value: Number(item.PROCESADO) || 0 },
              { label: "Inválidos", value: Number(item.PARCIALES) || 0 },
              { label: "Totales", value: Number(item.TOTAL) || 0 },
            ],
            exactitud: Number(item.EXACTITUD) || 0,
            FECHAINSERT: item.FECHAINSERT
              ? new Date(item.FECHAINSERT).toLocaleString("es-CO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "America/Bogota",
                })
              : "-",
            TIMEPROCESS: item.TIMEPROCESS || "-",
          }
        })

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
    const matchesIngreso =
      !filtroIngreso ||
      item.AINCONSEC.toLowerCase().includes(filtroIngreso.toLowerCase())
    const matchesBusqueda =
      !busqueda ||
      item.GPANOMCOM.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.AINCONSEC.toLowerCase().includes(busqueda.toLowerCase())
    const matchesFecha =
      !filtroFecha ||
      new Date(item.AINFECING).toLocaleDateString("es-CO") ===
        filtroFecha.toLocaleDateString("es-CO")
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
      <div className="overflow-x-hidden">
        <div className="w-full">
          <Table className="min-w-full table-fixed border-collapse text-xs md:text-sm">
            <TableHeader>
              <TableRow className="border-slate-700 bg-slate-700/50">
                <TableHead className="text-slate-300 px-2 py-3 break-words whitespace-normal">
                  N° Ingreso
                </TableHead>
                <TableHead className="text-slate-300 px-2 py-3 break-words whitespace-normal">
                  Fecha de ingreso
                </TableHead>
                <TableHead className="text-slate-300 px-2 py-3 break-words whitespace-normal">
                  Documento
                </TableHead>
                <TableHead className="text-slate-300 px-2 py-3 break-words whitespace-normal">
                  Paciente
                </TableHead>
                <TableHead className="text-slate-300 px-2 py-3 break-words whitespace-normal">
                  Estado
                </TableHead>
                <TableHead className="text-slate-300 px-2 py-3 break-words whitespace-normal">
                  Documentos
                </TableHead>
                <TableHead className="text-slate-300 px-2 py-3 break-words whitespace-normal">
                  Exactitud
                </TableHead>
                <TableHead className="text-slate-300 px-2 py-3 break-words whitespace-normal">
                  Observación
                </TableHead>
                <TableHead className="text-slate-300 px-2 py-3 break-words whitespace-normal">
                  Fecha procesado
                </TableHead>
                <TableHead className="text-slate-300 px-2 py-3 break-words whitespace-normal">
                  Tiempo procesado
                </TableHead>
                <TableHead className="text-slate-300 px-2 py-3 break-words whitespace-normal">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow
                  key={item.AINCONSEC}
                  className="border-slate-700 hover:bg-slate-700/50"
                >
                  <TableCell className="text-white px-2 py-3 break-words whitespace-normal align-top">
                    {item.AINCONSEC}
                  </TableCell>
                  <TableCell className="text-slate-300 px-2 py-3 break-words whitespace-normal align-top">
                    {item.AINFECING}
                  </TableCell>
                  <TableCell className="text-slate-300 px-2 py-3 break-words whitespace-normal align-top">
                    {item.PACNUMDOC}
                  </TableCell>
                  <TableCell className="text-slate-300 px-2 py-3 break-words whitespace-normal align-top">
                    {item.GPANOMCOM}
                  </TableCell>
                  <TableCell className="text-slate-300 px-2 py-3 break-words whitespace-normal align-top">
                    {item.ESTADO}
                  </TableCell>
                  <TableCell className="px-2 py-3 break-words whitespace-normal align-top">
                    <div className="space-y-1">
                      {item.documentos.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          {getDocumentoIcon(doc.label)}
                          <span className="flex-1 text-slate-300">
                            {doc.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {doc.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={item.exactitud}
                        className="w-16 bg-slate-700"
                      />
                      <span className="text-sm font-medium text-white">
                        {item.exactitud}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300 px-2 py-3 whitespace-pre-line break-words align-top">
                    {item.OBSERVACION && item.OBSERVACION !== "-" ? (
                      <ul className="list-disc list-inside space-y-1">
                        {item.OBSERVACION.split(",").map((obs, i) => (
                          <li key={i} className="text-slate-300 text-sm">
                            {obs.trim()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-slate-300 px-2 py-3 break-words whitespace-normal align-top">
                    {item.FECHAINSERT}
                  </TableCell>
                  <TableCell className="text-slate-300 px-2 py-3 break-words whitespace-normal align-top">
                    {item.TIMEPROCESS}
                  </TableCell>
                  <TableCell className="px-2 py-3 align-top">
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
    </div>
  )
}
