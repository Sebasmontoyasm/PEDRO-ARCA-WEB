export interface Metric {
  title: string
  value: string | number
  change?: string
  trend: "up" | "down"
  icon: any
  description?: string
  color?: string
}

export interface Metric_Doc {
  PROCESADO: number
  PARCIALES: number
  TASA_CUMPLIMIENTO: number
}

export interface Metric_General {
  NOMBRE: string
  TOTAL: number
}

export interface Metric_IA {
  AINID: number
  EXACTITUD: number
  CONFIANZA: number
  CUMPLIMIENTO: number
}