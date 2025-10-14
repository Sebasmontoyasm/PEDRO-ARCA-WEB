"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + título */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-yellow-500 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-lg text-white">
              CLÍNICA DE FRACTURAS
            </span>
          </div>

          {/* Botón de login con modal */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="h-8 px-3 text-xs bg-[#1E2537] text-white hover:bg-[#2A3248] transition"
              >
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

              <form className="flex flex-col gap-3 mt-4">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold mt-2"
                >
                  Entrar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
