"use client";

import Navbar from "@/components/navbar";
import { User, Rol } from "@/types/user";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog2";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

function UserRow({ user, onEdit, onDelete }: { user: User; onEdit: (u: User) => void; onDelete: (id: number) => void }) {
  const formatDate = (date: Date | null) => (date ? date.toLocaleString() : "-");

  return (
    <TableRow className="hover:bg-slate-800 transition-colors" key={user.id}>
      <TableCell className="text-gray-300 max-w-[150px] whitespace-pre-line break-words">{user.name}</TableCell>
      <TableCell className="text-gray-300 max-w-[200px] whitespace-pre-line break-words">{user.email}</TableCell>
      <TableCell className="text-gray-300 text-center">{user.rol}</TableCell>
      <TableCell className="text-gray-300 max-w-[150px] whitespace-pre-line">{formatDate(user.last_login)}</TableCell>
      <TableCell className="text-gray-300 max-w-[150px] whitespace-pre-line">{formatDate(user.sesion)}</TableCell>
      <TableCell className="text-gray-300 max-w-[150px] whitespace-pre-line">{formatDate(user.expired_at)}</TableCell>
      <TableCell className="text-gray-300 max-w-[150px] whitespace-pre-line">{formatDate(user.created)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(user)}
            className="text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(user.id)}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Componente principal de la página de usuarios
export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: 1,
  });

  // Cargar usuarios y roles desde el backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/user", { credentials: "include" });
      const data = await res.json();
      
      console.log("Fetched users data:", data);

      const formattedUsers: User[] = (data.users || []).map((u: any) => ({
        ...u,
        last_login: u.last_login ? new Date(u.last_login) : null,
        created: new Date(u.created),
        last_activity: u.last_activity ? new Date(u.last_activity) : null,
        expired_at: u.expired_at ? new Date(u.expired_at) : null,
        sesion: u.sesion ? new Date(u.sesion) : null,
      }));

      setUsers(formattedUsers);
      setRoles(data.roles || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Guardar o actualizar usuario
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingUser ? "PUT" : "POST";
      const url = editingUser ? `/api/admin/user/${editingUser.id}` : "/api/admin/user";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar usuario");

      toast({
        title: "Éxito",
        description: editingUser ? "Usuario actualizado" : "Usuario creado",
      });

      setOpen(false);
      setEditingUser(null);
      setForm({ name: "", email: "", password: "", role: 1 });
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/user/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar usuario");
      toast({ title: "Usuario eliminado" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Editar usuario
  const handleEdit = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-md transition-all">
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
                  className="bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-yellow-500"
                  required
                />
                <Input
                  placeholder="Correo electrónico"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-yellow-500 whitespace-pre-line break-words"
                  required
                />
                {!editingUser && (
                  <Input
                    placeholder="Contraseña"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                )}
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: Number(e.target.value) })}
                  className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500"
                >
                  {roles.map((r: Rol) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold mt-2 shadow-md transition-all"
                  disabled={loading}
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
                <TableHead className="text-white text-center">Usuario</TableHead>
                <TableHead className="text-white text-center">Correo</TableHead>
                <TableHead className="text-white text-center">Rol</TableHead>
                <TableHead className="text-white text-center">Última conexión</TableHead>
                <TableHead className="text-white text-center">Sesión</TableHead>
                <TableHead className="text-white text-center">Finaliza</TableHead>
                <TableHead className="text-white text-center">Creado</TableHead>
                <TableHead className="text-white text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-400 py-6">
                    Cargando usuarios...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-400 py-6">
                    No hay usuarios registrados.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => <UserRow key={u.id} user={u} onEdit={handleEdit} onDelete={handleDelete} />)
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
