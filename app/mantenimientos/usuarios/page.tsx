"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "../../lib/auth"; 
import { useRouter } from "next/navigation";
import { UserCircle, Mail, Lock, Shield, BadgeCent } from "lucide-react"; // Importamos BadgeCent para el ícono de matrícula

interface User {
  id: string;
  matricula: string; // Campo obligatorio
  name: string;
  email: string;
  role: string;
  password?: string;
  status?: string;
}

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  // Agregamos matricula al estado inicial del formulario
  const [form, setForm] = useState({ matricula: "", name: "", email: "", role: "student", password: "" });
  const [loading, setLoading] = useState(false);
  const [meLoaded, setMeLoaded] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/pages/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios", error);
    }
  };

  useEffect(() => {
    const me = getCurrentUser();
    if (!me) router.push("/login");
    else setMeLoaded(true);

    fetchUsers();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validación incluyendo matrícula
    if (!form.matricula || !form.name || !form.email || !form.password) {
      alert("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);

    try {
      if (editing) {
        const res = await fetch(`/pages/api/users/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Error al actualizar");
      } else {
        const res = await fetch('/pages/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Error al crear");
      }

      await fetchUsers();
      handleClear();
    } catch (error) {
      alert("Error al guardar usuario (Verifica que la matrícula o correo no existan ya)");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setEditing(null);
    setForm({ matricula: "", name: "", email: "", role: "student", password: "" });
  }

  function handleEdit(u: User) {
    setEditing(u);
    setForm({ 
      matricula: u.matricula, // Cargamos la matrícula existente
      name: u.name, 
      email: u.email, 
      role: u.role, 
      password: u.password || "" 
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este usuario?")) return;
    
    try {
      const res = await fetch(`/pages/api/users/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!meLoaded) return <div className="text-center mt-10 text-gray-600">Verificando sesión...</div>;

  return (
    <div className="flex min-h-screen items-start justify-center bg-white py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-5xl">
        <h2 className="text-2xl font-semibold text-green-800 text-center mb-8">
          Mantenimiento de Usuarios
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-4">
            
            {/* Campo Matrícula */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matrícula
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <BadgeCent className="text-gray-400 w-5 h-5 mr-2" />
                <input
                  type="text"
                  placeholder="Ej: 1-22-1960"
                  value={form.matricula}
                  onChange={(e) => setForm({ ...form, matricula: e.target.value })}
                  className="flex-1 outline-none text-gray-700"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <UserCircle className="text-gray-400 w-5 h-5 mr-2" />
                <input
                  type="text"
                  placeholder="Ej: Ana Pérez"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="flex-1 outline-none text-gray-700"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo institucional
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <Mail className="text-gray-400 w-5 h-5 mr-2" />
                <input
                  type="email"
                  placeholder="usuario@utesa.edu.do"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="flex-1 outline-none text-gray-700"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol de usuario
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <Shield className="text-gray-400 w-5 h-5 mr-2" />
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="flex-1 outline-none text-gray-700 bg-transparent"
                  disabled={loading}
                >
                  <option value="student">Estudiante</option>
                  <option value="organizer">Organizador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <Lock className="text-gray-400 w-5 h-5 mr-2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="flex-1 outline-none text-gray-700"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
                disabled={loading}
              >
                {loading ? "Guardando..." : (editing ? "Guardar cambios" : "Crear usuario")}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 border border-green-700 text-green-700 py-2 rounded-lg hover:bg-green-50 transition"
                disabled={loading}
              >
                Limpiar
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              Lista de usuarios
            </h3>
            <div className="space-y-3">
              {users.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">
                  No hay usuarios registrados.
                </p>
              ) : (
                users.map((u) => (
                  <div
                    key={u.id}
                    className="border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {u.name}
                        <span className="text-xs text-gray-500 ml-2">
                          ({u.matricula}) - {u.role}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(u)}
                        className="text-sm px-3 py-1 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
                        className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
