"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog2";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role_id: 1 });

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", { credentials: "include" });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      toast({ title: "Error", description: "No se pudieron cargar los usuarios", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Guardar usuario (crear o editar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingUser ? "PUT" : "POST";
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar usuario");

      toast({ title: "Éxito", description: editingUser ? "Usuario actualizado" : "Usuario creado" });
      setOpen(false);
      setEditingUser(null);
      setForm({ name: "", email: "", password: "", role_id: 1 });
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  // Eliminar usuario
  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar usuario");
      toast({ title: "Usuario eliminado" });
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-400 text-slate-900">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 text-white border border-slate-700">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuario" : "Crear Usuario"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="flex flex-col gap-3 mt-4">
              <Input
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-white"
                required
              />
              <Input
                placeholder="Correo electrónico"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-white"
                required
              />
              {!editingUser && (
                <Input
                  placeholder="Contraseña"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="bg-slate-800 border border-slate-700 text-white"
                  required
                />
              )}
              <select
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
              >
                <option value={1}>Usuario</option>
                <option value={4}>Administrador</option>
              </select>

              <Button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold mt-2"
              >
                {editingUser ? "Guardar cambios" : "Crear"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">ID</TableHead>
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="text-white">Correo</TableHead>
              <TableHead className="text-white">Rol</TableHead>
              <TableHead className="text-white text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-6">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-6">
                  No hay usuarios registrados.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="text-gray-300">{u.id}</TableCell>
                  <TableCell className="text-gray-300">{u.name}</TableCell>
                  <TableCell className="text-gray-300">{u.email}</TableCell>
                  <TableCell className="text-gray-300">
                    {u.role_id === 4 ? "Administrador" : "Usuario"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingUser(u);
                          setForm({ name: u.name, email: u.email, password: "", role_id: u.role_id });
                          setOpen(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(u.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
