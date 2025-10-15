"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CensoDetailProps } from "@/types/censo";

export default function CensoDetail({ open, onClose}: CensoDetailProps) {
   const data: any = [];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-800 border border-slate-700 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-yellow-400">
            Documentos procesados
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Detalle del procesamiento de documentos asociados al censo.
          </DialogDescription>
        </DialogHeader>

        {data.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-700 max-h-[60vh] overflow-y-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-slate-700 text-slate-300 sticky top-0">
                <tr>
                  <th className="px-4 py-2">Documento</th>
                  <th className="px-4 py-2">Clasificación</th>
                  <th className="px-4 py-2">Ruta</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Fecha de procesamiento</th>
                </tr>
              </thead>
              <tbody>
                {data.map((doc:any, index:any) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-700/40 border-b border-slate-700"
                  >
                    <td className="px-4 py-2">{doc.documento}</td>
                    <td className="px-4 py-2">{doc.clasificacion}</td>
                    <td className="px-4 py-2 truncate max-w-[200px]">
                      <a
                        href={doc.ruta}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {doc.ruta}
                      </a>
                    </td>
                    <td className="px-4 py-2">{doc.estado}</td>
                    <td className="px-4 py-2">
                      {new Date(doc.fechaProcess).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  );
}
