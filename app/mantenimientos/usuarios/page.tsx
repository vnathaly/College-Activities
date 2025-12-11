"use client";

import { useEffect, useState } from "react";
import { Mail, UserCircle, Shield, Loader2, UserPlus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface UserItem {
  id: string;
  matricula: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UsuariosPage() {
  const router = useRouter();
  const { register, handleSubmit, reset, setValue } = useForm();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const me = getCurrentUser();
    if (!me || me.userType !== 'admin') {
        router.push("/dashboard"); 
        return;
    }
    fetchUsers();
  }, [router]);

  const startEdit = (user: UserItem) => {
    setEditingId(user.id);
    setValue("matricula", user.matricula);
    setValue("name", user.name);
    setValue("email", user.email);
    setValue("role", user.role);
  };

  const clearForm = () => {
    setEditingId(null);
    reset({
        matricula: "",
        name: "",
        email: "",
        role: "",
        password: ""
    });
  };
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/users/${editingId}` : '/api/users';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        alert(`Error: ${result.message || "No se pudo guardar el usuario."}`);
        throw new Error(result.message);
      }

      await fetchUsers();
      clearForm();
    } catch (error) {
      console.error("Error al guardar usuario", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar usuario? Esta acción es irreversible.")) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert("Error al eliminar el usuario.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-6xl">
        <h2 className="text-2xl font-bold text-green-800 text-center mb-8">
          Mantenimiento de Usuarios
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-6 p-6 border rounded-xl shadow-inner bg-gray-50 mb-10">
          <div className="md:col-span-3 text-lg font-semibold text-gray-700 flex items-center gap-2">
            <UserPlus className="w-5 h-5"/> {editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Matrícula"
              {...register("matricula", { required: true })}
              className="w-full border rounded-lg p-3 outline-none text-gray-700"
              disabled={isSubmitting || editingId !== null} 
            />
            <input
              type="text"
              placeholder="Nombre Completo"
              {...register("name", { required: true })}
              className="w-full border rounded-lg p-3 outline-none text-gray-700"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Correo"
              {...register("email", { required: true })}
              className="w-full border rounded-lg p-3 outline-none text-gray-700"
              disabled={isSubmitting}
            />
            <input
              type="password"
              placeholder={editingId ? "Nueva Contraseña (Opcional)" : "Contraseña (Obligatoria)"}
              {...register("password", { required: !editingId })}
              className="w-full border rounded-lg p-3 outline-none text-gray-700"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <select
              {...register("role", { required: true })}
              className="w-full border rounded-lg p-3 outline-none text-gray-700"
              disabled={isSubmitting}
            >
              <option value="">Seleccione Rol</option>
              <option value="student">Estudiante</option>
              <option value="organizer">Organizador</option>
              <option value="admin">Administrador</option>
            </select>
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition disabled:bg-gray-400"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : (editingId ? "Guardar Cambios" : "Crear Usuario")}
                </button>
                <button
                    type="button"
                    onClick={clearForm}
                    className="flex-1 border border-green-700 text-green-700 py-2 rounded-lg hover:bg-green-50 transition disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {editingId ? "Cancelar" : "Limpiar"}
                </button>
            </div>
          </div>
        </form>

        <h3 className="text-lg font-semibold text-green-800 mb-4">
          Lista de Usuarios ({users.length})
        </h3>
        {loading ? (
          <div className="flex justify-center items-center h-20 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2"/> Cargando usuarios...
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className={`border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 hover:bg-gray-100 transition ${editingId === u.id ? 'ring-2 ring-yellow-500' : ''}`}
              >
                <div>
                  <p className="font-semibold text-gray-800 flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-green-700"/> {u.name}
                    <span className="text-xs text-gray-500 font-normal ml-3">Matrícula: {u.matricula}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-500"/> {u.email}
                  </p>
                </div>

                <div className="flex gap-2 items-center mt-3 sm:mt-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    u.role === 'admin' ? 'bg-red-100 text-red-800' : u.role === 'organizer' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {u.role.toUpperCase()}
                  </span>
                  
                  <button
                    onClick={() => startEdit(u)}
                    className="text-sm px-3 py-1 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
