'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CensoDetailProps, CensoDocument } from '@/types/censo'
import { Copy } from 'lucide-react'

export default function CensoDetail({ open, onClose, data }: CensoDetailProps) {
  const [docs, setDocs] = useState<CensoDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null) 

  useEffect(() => {
    if (open && data?.AINID) {
      setLoading(true)
      const ainid = data.AINID

      async function fetchData() {
        try {
          const res = await fetch(`/api/dashboard/censo/process?ainid=${ainid}`)
          const json = await res.json()
          setDocs(json || [])
        } catch (error) {
          console.error('Error cargando detalles:', error)
          setDocs([])
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    } else {
      setDocs([])
      setLoading(false)
    }
  }, [open, data])

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setToast('Ruta copiada al portapapeles')
      setTimeout(() => setToast(null), 3000) 
    }).catch(err => {
      console.error('Error copiando al portapapeles:', err)
      setToast('Error al copiar')
      setTimeout(() => setToast(null), 3000)
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-screen-2xl bg-slate-800 border border-slate-700 text-slate-200 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-yellow-400">
              Detalle del Ingreso {data?.AINCONSEC ?? 'N/A'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Documentos procesados del ingreso seleccionado.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <p className="text-center text-slate-400 mt-4">Cargando detalles...</p>
          ) : docs.length > 0 ? (
            <div className="mt-4 overflow-auto flex justify-center">
              <div className="rounded-lg border border-slate-700 max-h-[70vh] overflow-auto">
                <table className="min-w-[600px] text-sm text-left border-collapse">
                  <thead className="bg-slate-700 text-slate-300 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2">Documento</th>
                      <th className="px-3 py-2">Clasificación</th>
                      <th className="px-3 py-2">Archivo</th>
                      <th className="px-3 py-2">Archivo</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2 whitespace-nowrap">Fecha de procesamiento</th>
                    </tr>
                  </thead>

                  <tbody>
                    {docs.map((doc, index) => (
                      <tr
                        key={`${doc.Documento ?? index}-${index}`}
                        className="hover:bg-slate-700/40 border-b border-slate-700 align-top"
                      >
                        <td className="px-3 py-2">{doc.Documento ?? '-'}</td>
                        <td className="px-3 py-2">{doc.Clasificacion ?? '-'}</td>
                        <td className="px-3 py-2 max-w-[250px] whitespace-normal break-words">
                          {doc.Ruta ? (
                            <div className="flex flex-col gap-1">
                              <span className="break-words">{doc.Archivo}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {doc.Ruta ? (
                            <button
                              onClick={() => copyToClipboard(doc.Ruta!)}
                              className="p-1 rounded-full text-blue-400 hover:bg-yellow-500 hover:text-slate-900 transition-all"
                              aria-label="Copiar ruta al portapapeles"
                              type="button"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-2">{doc.Estado ?? '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {doc.FechaProceso
                            ? new Date(doc.FechaProceso).toLocaleString()
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center mt-4">
              No hay documentos procesados disponibles.
            </p>
          )}

          <div className="flex justify-end mt-6">
            <Button
              onClick={onClose}
              className="bg-yellow-500 text-black hover:bg-yellow-600"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      
      {toast && (
        <div
          role="alert"
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fadeInOut"
          style={{ minWidth: '200px', textAlign: 'center', zIndex: 9999 }}
        >
          {toast}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          10%, 90% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
        }
        .animate-fadeInOut {
          animation: fadeInOut 3s ease forwards;
        }
      `}</style>
    </>
  )
}
