"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { Mail, Lock, UserCircle, GraduationCap, IdCard } from "lucide-react";
import { readFromStorage, saveToStorage, User, INITIAL_USERS } from "../lib/data";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    career: "",
    matricula: "",
    email: "",
    password: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = readFromStorage<User[]>("agenda:users", []);
    if (stored.length === 0) {
      saveToStorage("agenda:users", INITIAL_USERS);
      setUsers(INITIAL_USERS);
    } else {
      setUsers(stored);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.career ||
      !form.matricula ||
      !form.email ||
      !form.password
    ) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const exists = users.some((u) => u.email === form.email);
    if (exists) {
      alert("Ya existe un usuario registrado con este correo.");
      return;
    }

    const newUser: User = {
      id: uuidv4(),
      name: form.name,
      email: form.email,
      role: "student",
      password: form.password,
      status: "active",
      career: form.career,
      matricula: form.matricula,
    } as any;

    const updated = [newUser, ...users];
    saveToStorage("agenda:users", updated);
    setUsers(updated);
    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="flex min-h-screen bg-white items-center justify-center px-6">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-12">

        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-semibold text-center mb-6 text-green-800">
            Registro — Agenda UTESA
          </h1>

          {success ? (
            <div className="text-center text-green-700 font-medium">
              Registro exitoso. Redirigiendo al login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <div className="flex items-center border rounded-md shadow-sm px-3 py-2">
                  <UserCircle className="text-gray-400 w-5 h-5 mr-2" />
                  <input
                    type="text"
                    placeholder="Ej: Ana Pérez"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="flex-1 outline-none text-gray-700 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrera
                </label>
                <div className="flex items-center border rounded-md shadow-sm px-3 py-2">
                  <GraduationCap className="text-gray-400 w-5 h-5 mr-2" />
                  <input
                    type="text"
                    placeholder="Ej: Ingeniería en Sistemas"
                    value={form.career}
                    onChange={(e) =>
                      setForm({ ...form, career: e.target.value })
                    }
                    className="flex-1 outline-none text-gray-700 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matrícula
                </label>
                <div className="flex items-center border rounded-md shadow-sm px-3 py-2">
                  <IdCard className="text-gray-400 w-5 h-5 mr-2" />
                  <input
                    type="text"
                    placeholder="Ej: 2023-1234"
                    value={form.matricula}
                    onChange={(e) =>
                      setForm({ ...form, matricula: e.target.value })
                    }
                    className="flex-1 outline-none text-gray-700 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo institucional
                </label>
                <div className="flex items-center border rounded-md shadow-sm px-3 py-2">
                  <Mail className="text-gray-400 w-5 h-5 mr-2" />
                  <input
                    type="email"
                    placeholder="usuario@utesa.edu.do"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="flex-1 outline-none text-gray-700 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="flex items-center border rounded-md shadow-sm px-3 py-2">
                  <Lock className="text-gray-400 w-5 h-5 mr-2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="flex-1 outline-none text-gray-700 bg-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition shadow-sm"
              >
                Registrarme
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mt-3">
                  ¿Ya tienes una cuenta?{" "}
                  <a
                    href="/login"
                    className="text-green-700 font-medium hover:underline"
                  >
                    Inicia sesión
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>

        <div className="hidden md:flex justify-center items-center flex-1">
          <Image
            src="/imagenes/register.png"
            alt="Registro UTESA"
            width={420}
            height={420}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
