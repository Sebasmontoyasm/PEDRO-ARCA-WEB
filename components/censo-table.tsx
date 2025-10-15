"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircleIcon, XCircleIcon, FileTextIcon, RefreshCwIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import CensoDetail from "@/components/censo-process"

interface CensoTableProps {
  data: Ingreso[]
  filtroEstado: string
  filtroRangoIngreso?: DateRange
  filtroRangoProcesado?: DateRange
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
  data,
  filtroEstado,
  filtroRangoIngreso,
  filtroRangoProcesado,
  busqueda,
}: CensoTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedRow, setSelectedRow] = useState<Ingreso | null>(null)

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

  // 🔎 Filtrado
  const filteredData = data.filter((item) => {
    const fechaIngreso = item.AINFECING !== "-" ? new Date(item.AINFECING) : null
    const fechaProcesado = item.FECHAINSERT !== "-" ? new Date(item.FECHAINSERT) : null

    const matchesEstado =
      filtroEstado === "todos" || item.ESTADO.toLowerCase() === filtroEstado.toLowerCase()

    const matchesBusqueda =
      !busqueda ||
      item.GPANOMCOM.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.AINCONSEC.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.PACNUMDOC?.toLowerCase().includes(busqueda.toLowerCase())

    const matchesRangoIngreso =
      !filtroRangoIngreso?.from ||
      !filtroRangoIngreso?.to ||
      (fechaIngreso &&
        fechaIngreso >= filtroRangoIngreso.from &&
        fechaIngreso <= filtroRangoIngreso.to)

    const matchesRangoProcesado =
      !filtroRangoProcesado?.from ||
      !filtroRangoProcesado?.to ||
      (fechaProcesado &&
        fechaProcesado >= filtroRangoProcesado.from &&
        fechaProcesado <= filtroRangoProcesado.to)

    return matchesEstado && matchesBusqueda && matchesRangoIngreso && matchesRangoProcesado
  })

  // 📊 Paginación dinámica
  const totalRecords = filteredData.length
  const blockSize = Math.max(Math.ceil(totalRecords / 10), 10)
  const totalBlocks = Math.ceil(totalRecords / blockSize)
  const firstIndex = (currentPage - 1) * blockSize
  const lastIndex = Math.min(firstIndex + blockSize, totalRecords)
  const currentData = filteredData.slice(firstIndex, lastIndex)
  const firstRecord = firstIndex + 1
  const lastRecord = lastIndex

  const currentGroup = Math.ceil(currentPage / 10)
  const startBlock = (currentGroup - 1) * 10 + 1
  const endBlock = Math.min(currentGroup * 10, totalBlocks)

  const handleOpenDetail = (row: Ingreso) => {
    setSelectedRow(row)
    setOpenDetail(true)
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 w-full">
      <h2 className="text-lg font-semibold text-white mb-2">Resultados de Validación</h2>
      <p className="text-slate-400 mb-4 text-sm">
        Mostrando {firstRecord}-{lastRecord} de {totalRecords} ingresos
      </p>

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
                "Documentos Obligatorios",
                "Exactitud",
                "Observación",
                "Fecha procesado",
                "Tiempo procesado",
                "Acciones",
              ].map((col) => (
                <TableHead key={col} className="text-slate-300 px-2 py-3 text-center">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentData.map((item) => (
              <TableRow key={item.AINCONSEC} className="border-slate-700 hover:bg-slate-700/50">
                <TableCell className="text-white px-2 py-3 text-center">{item.AINCONSEC}</TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-center">{formatDate(item.AINFECING)}</TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-center">{item.PACNUMDOC}</TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-center break-words whitespace-normal max-w-[180px]">
                  {item.GPANOMCOM}
                </TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-center">{item.ESTADO}</TableCell>
                <TableCell className="px-2 py-3 text-left">
                  <div className="space-y-1">
                    {item.documentos.map((doc, i) => (
                      <div key={i} className="flex items-center gap-1">
                        {getDocumentoIcon(doc.label)}
                        {doc.label === "Totales" ? "Totales obligatorios" : doc.label}
                        <span className="text-xs text-slate-400">{doc.value}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="px-2 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Progress value={item.exactitud} className="w-16 bg-slate-700" />
                    <span className="text-sm font-medium text-white">{item.exactitud}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-left break-words whitespace-normal max-w-[200px]">
                  {item.OBSERVACION}
                </TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-center">{formatDate(item.FECHAINSERT)}</TableCell>
                <TableCell className="text-slate-300 px-2 py-3 text-center">{item.TIMEPROCESS}</TableCell>
                <TableCell className="px-2 py-3 text-center flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900 p-2"
                    onClick={() => handleOpenDetail(item)}
                  >
                    <FileTextIcon className="h-4 w-4" />
                  </Button>

                  {item.ESTADO.toLowerCase() === "incompleto" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-slate-900 p-2"
                      onClick={() => console.log(`Recargar ingreso ${item.AINCONSEC}`)}
                    >
                      <RefreshCwIcon className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CensoDetail
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        data={selectedRow?.documentos ?? []}
      />


      {/* 📄 Paginador */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            Anterior
          </Button>

          {Array.from({ length: endBlock - startBlock + 1 }, (_, i) => startBlock + i).map((block) => {
            const startRecord = (block - 1) * blockSize + 1
            const endRecord = Math.min(block * blockSize, totalRecords)
            return (
              <Button
                key={block}
                onClick={() => setCurrentPage(block)}
                className={`w-16 h-8 rounded text-sm ${currentPage === block
                    ? "bg-yellow-500 text-slate-900 font-bold"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
              >
                {startRecord}-{endRecord}
              </Button>
            )
          })}

          <Button
            disabled={currentPage === totalBlocks}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            Siguiente
          </Button>
        </div>

        <div className="text-slate-300 text-sm">
          Mostrando {firstRecord}-{lastRecord} de {totalRecords} registros
        </div>
      </div>
    </div>
  )
}
