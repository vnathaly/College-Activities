"use client";

import { useEffect, useState } from "react";
import { User, readFromStorage, saveToStorage, INITIAL_USERS } from "../../lib/data";
import { getCurrentUser } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { UserCircle, Mail, Lock, Shield } from "lucide-react";

export default function UsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "student", password: "" });
  const [meLoaded, setMeLoaded] = useState(false);

  useEffect(() => {
    const me = getCurrentUser();
    if (!me) router.push("/login");
    else setMeLoaded(true);

    const stored = readFromStorage<User[]>("agenda:users", []);
    if (stored.length === 0) {
      saveToStorage("agenda:users", INITIAL_USERS);
      setUsers(INITIAL_USERS);
    } else {
      setUsers(stored);
    }
  }, [router]);

  useEffect(() => {
    saveToStorage("agenda:users", users);
  }, [users]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert("Por favor completa todos los campos.");
      return;
    }

    if (editing) {
      setUsers(prev =>
        prev.map(u =>
          u.id === editing.id
            ? { ...u, name: form.name, email: form.email, role: form.role as any, password: form.password }
            : u
        )
      );
      setEditing(null);
    } else {
      const newUser: User = {
        id: uuidv4(),
        name: form.name,
        email: form.email,
        role: form.role as any,
        password: form.password,
        status: "active",
      };
      setUsers(prev => [newUser, ...prev]); 
    }

    setForm({ name: "", email: "", role: "student", password: "" });
  }

  function handleClear() {
    setEditing(null);
    setForm({ name: "", email: "", role: "student", password: "" });
  }

  function handleEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role, password: u.password || "" });
  }

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar este usuario?")) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  if (!meLoaded) return <div className="text-center mt-10 text-gray-600">Redirigiendo...</div>;

  return (
    <div className="flex min-h-screen items-start justify-center bg-white py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-5xl">
        <h2 className="text-2xl font-semibold text-green-800 text-center mb-8">
          Mantenimiento de Usuarios
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-4">
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
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
              >
                {editing ? "Guardar cambios" : "Crear usuario"}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 border border-green-700 text-green-700 py-2 rounded-lg hover:bg-green-50 transition"
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
                          ({u.role})
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
