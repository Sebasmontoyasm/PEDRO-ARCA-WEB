"use client";

import { useState, useEffect } from "react";
import { LogIn, LogOut, LayoutDashboard, Eye, EyeOff, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog2";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; role: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("No autorizado");
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      }
    };
    checkSession();
  }, []);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password: password.trim() }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (data.jwt) {
        // Guardar cookie
        document.cookie = `auth_token=${data.jwt}; path=/; max-age=7200; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""
          }`;

        localStorage.setItem("user_name", data.name.split(" ")[0]);
        setUser({ name: data.name.split(" ")[0], role: data.role });

        setOpen(false); // cerrar diálogo
        setEmail("");
        setPassword("");
        alert("Redirigiendo al dashboard...");
        router.push("/dashboard");
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Error cerrando sesión en servidor", error);
    } finally {
      document.cookie =
        "auth_token=; Path=/; Max-Age=0; SameSite=Strict" +
        (process.env.NODE_ENV === "production" ? "; Secure" : "");
      localStorage.removeItem("user_name");
      setUser(null);
      router.push("/");
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Dashboard */}
        <div className="flex items-center gap-5">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm tracking-tight">C</span>
              </div>
              <span className="font-semibold text-lg text-white">Clínica de Fracturas</span>
            </div>
          </div>

          {/* Botón Dashboard */}
          {user && (
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-400 transition"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
          )}
        </div>

        {/* Sesión */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-white text-sm">
              Hola, <span className="text-yellow-400 font-medium">{user.name}</span>
            </span>

            {/* Menú de configuración */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-40 bg-slate-900 text-white border border-slate-700 shadow-md rounded-md"
              >
                <DropdownMenuLabel>Configuración</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {user.role === 4 && (
                  <DropdownMenuItem asChild>
                    <a href="/admin/user" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Usuarios
                    </a>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-8 px-3 text-xs bg-[#1E2537] text-white hover:bg-[#2A3248] transition">
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar sesión
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-slate-900 text-white border border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-yellow-500">
                  Iniciar sesión
                </DialogTitle>
              </DialogHeader>

              <form className="flex flex-col gap-3 mt-4" onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />

                {/* Contraseña con icono ojo */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold mt-2"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </header>
  );
}