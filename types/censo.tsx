export interface Documento {
  label: string
  value: number
}

export interface CensoDocument {
  Documento: string
  Clasificacion: string
  Ruta: string
  Estado: string
  FechaProceso: string
}

export interface CensoDetailProps {
  open: boolean
  onClose: () => void
  data?: Ingreso | null
}

export interface Ingreso {
  AINID: number
  AINCONSEC: number
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