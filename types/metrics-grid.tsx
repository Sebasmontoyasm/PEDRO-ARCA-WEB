export type Metric = {
  title: string
  value: string | number
  trend: "up" | "down"
  icon: any
  color?: string
  showProgress?: boolean
}

export type Metric_Doc = {
  title: string
  value: string | number
  color?: string
  trendColor?: string
  icon: any
  showProgress?: boolean
}

export type Metric_General = {
  NOMBRE: string
  TOTAL: number
}
