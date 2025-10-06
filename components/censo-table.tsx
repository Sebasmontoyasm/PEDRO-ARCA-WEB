"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

        const mapped: Ingreso[] = json[0].map((item: any) => ({
          AINCONSEC: String(item.AINCONSEC),
          GPANOMCOM: item.GPANOMCOM,
          AINFECING: item.AINFECING
            ? new Date(item.AINFECING).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "-",
          PACNUMDOC: item.PACNUMDOC,
          OBSERVACION: item.OBSERVACION || "-",
          ESTADO: item.ESTADO,
          documentos: [
            {
              label: "Validados",
              value: Number(item.PROCESADO) || 0,
            },
            {
              label: "Inválidos",
              value: Number(item.PARCIALES) || 0,
            },
            {
              label: "Totales",
              value: Number(item.TOTAL) || 0,
            },
          ],
          exactitud: Number(item.EXACTITUD) || 0,
          FECHAINSERT: item.FECHAINSERT
            ? new Date(item.FECHAINSERT).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "-",
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
    const matchesIngreso =
      !filtroIngreso || item.AINCONSEC.toLowerCase().includes(filtroIngreso.toLowerCase())
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
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <h2 className="text-lg font-semibold text-white">Resultados de Validación</h2>
      <p className="text-slate-400 mb-4">
        {filteredData.length} de {data.length} ingresos mostrados
      </p>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-300">Número de Ingreso</TableHead>
              <TableHead className="text-slate-300">Fecha de ingreso</TableHead>
              <TableHead className="text-slate-300">Documento</TableHead>
              <TableHead className="text-slate-300">Paciente</TableHead>
              <TableHead className="text-slate-300">Estado</TableHead>
              <TableHead className="text-slate-300">Documentos</TableHead>
              <TableHead className="text-slate-300">Exactitud</TableHead>
              <TableHead className="text-slate-300">Observación</TableHead>
              <TableHead className="text-slate-300">Fecha de procesado</TableHead>
              <TableHead className="text-slate-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow
                key={item.AINCONSEC}
                className="border-slate-700 hover:bg-slate-700/50"
              >
                <TableCell className="font-medium text-white">{item.AINCONSEC}</TableCell>
                <TableCell className="text-slate-300">{item.AINFECING}</TableCell>
                <TableCell className="text-slate-300">{item.PACNUMDOC}</TableCell>
                <TableCell className="text-slate-300">{item.GPANOMCOM}</TableCell>
                <TableCell className="text-slate-300">{item.ESTADO}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {item.documentos.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {getDocumentoIcon(doc.label)}
                        <span className="flex-1 text-slate-300">{doc.label}</span>
                        <span className="text-xs text-slate-400">{doc.value}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={item.exactitud} className="w-16 bg-slate-700" />
                    <span className="text-sm font-medium text-white">
                      {item.exactitud}%
                    </span>
                  </div>
                </TableCell>

                {/* 🔹 Observación con lista estética */}
                <TableCell className="text-slate-300 whitespace-pre-line">
                  {item.OBSERVACION && item.OBSERVACION !== "-" ? (
                    <ul className="list-disc list-inside space-y-1">
                      {item.OBSERVACION.split(",").map((doc, i) => (
                        <li key={i} className="text-slate-300 text-sm">
                          {doc.trim()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "-"
                  )}
                </TableCell>

                <TableCell className="text-slate-300">{item.FECHAINSERT}</TableCell>
                <TableCell>
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
