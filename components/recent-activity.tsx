import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock, User, ShoppingBag, CreditCard } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "sale",
    title: "Nueva venta completada",
    description: "Pedido #12847 por €2,450",
    time: "Hace 2 minutos",
    status: "success",
    icon: CheckCircle,
    user: "Carlos M.",
  },
  {
    id: 2,
    type: "user",
    title: "Nuevo usuario registrado",
    description: "Ana García se unió a la plataforma",
    time: "Hace 15 minutos",
    status: "info",
    icon: User,
    user: "Ana G.",
  },
  {
    id: 3,
    type: "payment",
    title: "Pago procesado",
    description: "Factura #INV-2024-0892 pagada",
    time: "Hace 32 minutos",
    status: "success",
    icon: CreditCard,
    user: "Sistema",
  },
  {
    id: 4,
    type: "order",
    title: "Pedido pendiente",
    description: "Pedido #12846 requiere atención",
    time: "Hace 1 hora",
    status: "warning",
    icon: AlertCircle,
    user: "Luis R.",
  },
  {
    id: 5,
    type: "inventory",
    title: "Stock bajo",
    description: "Producto 'Laptop Pro' tiene 3 unidades",
    time: "Hace 2 horas",
    status: "warning",
    icon: ShoppingBag,
    user: "Sistema",
  },
]

const statusColors = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
}

export function RecentActivity() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      activity.status === "success"
                        ? "bg-success/10"
                        : activity.status === "warning"
                          ? "bg-warning/10"
                          : activity.status === "info"
                            ? "bg-info/10"
                            : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        activity.status === "success"
                          ? "text-success"
                          : activity.status === "warning"
                            ? "text-warning"
                            : activity.status === "info"
                              ? "text-info"
                              : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{activity.title}</h4>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={statusColors[activity.status as keyof typeof statusColors]}>
                        {activity.status === "success"
                          ? "Completado"
                          : activity.status === "warning"
                            ? "Pendiente"
                            : activity.status === "info"
                              ? "Información"
                              : "Error"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">por {activity.user}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estado del Servidor</span>
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                Operativo
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base de Datos</span>
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                Conectada
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">API Externa</span>
              <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                Lenta
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <h4 className="text-sm font-medium">Métricas del Sistema</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CPU</span>
                <span className="font-medium">23%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "23%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Memoria</span>
                <span className="font-medium">67%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-chart-2 h-2 rounded-full" style={{ width: "67%" }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Almacenamiento</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-chart-3 h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
