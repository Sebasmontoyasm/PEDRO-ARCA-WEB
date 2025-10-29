"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Settings, ChevronDown, Calendar, LogOut, Users } from "lucide-react"

export function DashboardHeader() {
  const [dark, setDark] = useState(false)
  const [fechaExtraccion, setFecha] = useState<string | null>(null)
  const [role, setRol] = useState<number | null>(null)

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [dark])

  useEffect(() => {
    async function fetchFechaAnaExtraccion() {
      try {
        const res = await fetch("/api/rpa/extraccion")
        const data = await res.json()
        setFecha(data.timeAnaExtraccion.fechainsert)
      } catch (error) {
        console.error(error)
        setFecha(null)
      }
    }

    async function fetchUserRole() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        // Asegurarse de usar la propiedad correcta
        setRol(data.user?.role || data.user?.role || null)
      } catch (error) {
        console.error(error)
        setRol(null)
      }
    }

    fetchFechaAnaExtraccion()
    fetchUserRole()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/"
    } catch (error) {
      console.error("Error cerrando sesión", error)
    }
  }

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* --- Izquierda --- */}
          <div className="flex items-center gap-6">
            {/* Logo homogeneo */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm tracking-tight">C</span>
              </div>
              <span className="font-semibold text-lg">Clínica de Fracturas</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Resumen
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Análisis
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Reportes
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Configuración
              </a>
            </nav>
          </div>

          {/* --- Derecha --- */}
          <div className="flex items-center gap-4">
            {fechaExtraccion ? (
              <span className="text-sm font-semibold text-white select-none">
                Última actualización el {fechaExtraccion}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground select-none">
                Cargando fecha...
              </span>
            )}

            {/* Filtro de tiempo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <Calendar className="h-4 w-4" />
                  Últimas 24 horas
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Última hora</DropdownMenuItem>
                <DropdownMenuItem>Últimas 24 horas</DropdownMenuItem>
                <DropdownMenuItem>Últimos 7 días</DropdownMenuItem>
                <DropdownMenuItem>Últimos 30 días</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Badge
              variant="secondary"
              className="bg-success/10 text-success border-success/20"
            >
              Producción
            </Badge>

            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            {/* Menú de configuración */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Configuración</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {role === 4 && (
                  <DropdownMenuItem asChild>
                    <a href="/admin/usuarios" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Usuarios
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-primary hover:text-primary"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
