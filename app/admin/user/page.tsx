"use client";

import Navbar from "@/components/navbar";
import { User, Rol } from "@/types/user";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useToast } from "@/hooks/use-toast";

function UserRow({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: (u: User) => void;
  onDelete: (id: number) => void;
}) {
  const formatDate = (date: Date | null) => (date ? date.toLocaleString() : "-");

  return (
    <TableRow className="hover:bg-slate-800/80 transition-colors duration-200" key={user.id}>
      <TableCell className="text-gray-300 max-w-[150px] whitespace-pre-line wrap-break-word">
        {user.name}
      </TableCell>
      <TableCell className="text-gray-300 max-w-[200px] whitespace-pre-line wrap-break-word">
        {user.email}
      </TableCell>
      <TableCell className="text-gray-300 text-center">{user.rol}</TableCell>
      <TableCell className="text-gray-300 text-center">{formatDate(user.last_login)}</TableCell>
      <TableCell className="text-gray-300 text-center">{formatDate(user.sesion)}</TableCell>
      <TableCell className="text-gray-300 text-center">{formatDate(user.expired_at)}</TableCell>
      <TableCell className="text-gray-300 text-center">{formatDate(user.created)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(user)}
            className="text-yellow-400 hover:text-yellow-300 hover:scale-110 transition-transform"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(user.id)}
            className="text-red-500 hover:text-red-400 hover:scale-110 transition-transform"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}


export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: 1,
  });

  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/user", { credentials: "include", cache: "no-store" });
      const data = await res.json();

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
    } catch (error: any) {
      let msg = error.message || "No se pudo guardar el usuario";
      if (msg.includes("duplicate") || msg.includes("correo")) {
        msg = "El correo electrónico ya está registrado.";
      }

      toast({
        title: "⚠️ Error",
        description: msg,
        variant: "destructive",
      });
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


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
        cache: "no-store",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        let msg = data.error || "Error al guardar usuario";
        if (
          msg.toString().toLowerCase().includes("duplicate") ||
          msg.toString().toLowerCase().includes("correo") ||
          msg.toString().toLowerCase().includes("ya está registrado")
        ) {
          msg = "El correo electrónico ya está registrado.";
        }

        toast({
          title: "⚠️ Error",
          description: msg,
          variant: "destructive"
        });

        throw new Error(msg);
      }

      toast({
        title: "✅ Éxito",
        description: editingUser ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
        variant: "default"
      });

      setOpen(false);
      setEditingUser(null);
      setForm({ name: "", email: "", password: "", role: 1 });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "⚠️ Error",
        description: error?.message || "No se pudo guardar el usuario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/user/${id}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store"
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

  
  const handleEdit = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="p-8 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 min-h-screen transition-colors">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
            Gestión de Usuarios
          </h1>
          <Dialog
            open={open}
            onOpenChange={(state) => {
              setOpen(state);
              if (!state) {
                setEditingUser(null);
                setForm({ name: "", email: "", password: "", role: 1 });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/30 font-semibold transition-all duration-300 hover:scale-105"
                onClick={() => {
                  setEditingUser(null);
                  setForm({ name: "", email: "", password: "", role: 1 });
                  setOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-slate-900/95 border border-slate-700 shadow-xl shadow-slate-800/50 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-white text-xl font-semibold">
                  {editingUser ? "Editar Usuario" : "Crear Usuario"}
                </DialogTitle>
                <DialogDescription className="text-slate-300 text-sm">
                  {editingUser
                    ? "Modifica la información del usuario existente"
                    : "Rellena los campos para crear un nuevo usuario"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave} className="flex flex-col gap-4 mt-4">
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-300">
                    Usuario <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    placeholder="Nombre del usuario"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-yellow-500 rounded-xl"
                    required
                  />
                </div>

                
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Correo <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    placeholder="Correo electrónico"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-yellow-500 rounded-xl"
                    required
                  />
                </div>

                
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-slate-300 text-sm mb-1">
                    Contraseña
                  </label>
                  <Input
                    id="password"
                    placeholder="Contraseña"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-yellow-500 rounded-xl"
                    required={!editingUser}
                  />
                </div>

                
                <div className="flex flex-col gap-2">
                  <label htmlFor="role" className="text-sm font-medium text-gray-300">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: Number(e.target.value) })}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500"
                    required
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((r: Rol) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold mt-2 shadow-lg shadow-yellow-500/30 hover:scale-105 transition-transform rounded-xl"
                  disabled={loading}
                >
                  {editingUser ? "Guardar cambios" : "Crear"}
                </Button>
              </form>

            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg shadow-slate-900/40 overflow-hidden backdrop-blur-sm">
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
                users.map((u) => (
                  <UserRow key={u.id} user={u} onEdit={handleEdit} onDelete={handleDelete} />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
