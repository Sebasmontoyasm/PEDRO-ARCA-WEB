export type CensoDetailProps = {
  open: boolean
  onClose: () => void
  data?: {
    label: string
    value: number
  }[]
}
