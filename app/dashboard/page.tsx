"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, CalendarDays, Bell } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) router.push("/login");
    else setUser(u);
  }, [router]);

  if (!user)
    return (
      <div className="text-center text-gray-600 mt-20">Redirigiendo...</div>
    );

  return (
    <div className="flex min-h-screen items-start justify-center bg-white py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-5xl">
        <h1 className="text-3xl font-semibold text-green-800 text-center mb-2">
          Panel Principal
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Bienvenido, <span className="font-medium">{user.name}</span> — Rol:{" "}
          <span className="capitalize">{user.role}</span>
        </p>

        <div className="grid sm:grid-cols-3 gap-6">
          <Link
            href="/mantenimientos/usuarios"
            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border hover:shadow-lg hover:bg-green-50 transition"
          >
            <Users className="w-10 h-10 text-green-700 mb-3" />
            <h3 className="font-semibold text-green-800 text-lg mb-1">
              Usuarios
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Alta, edición y baja de usuarios
            </p>
          </Link>

          <Link
            href="/mantenimientos/eventos"
            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border hover:shadow-lg hover:bg-green-50 transition"
          >
            <CalendarDays className="w-10 h-10 text-green-700 mb-3" />
            <h3 className="font-semibold text-green-800 text-lg mb-1">
              Eventos
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Crear y administrar actividades
            </p>
          </Link>

          <Link
            href="/mantenimientos/notificaciones"
            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border hover:shadow-lg hover:bg-green-50 transition"
          >
            <Bell className="w-10 h-10 text-green-700 mb-3" />
            <h3 className="font-semibold text-green-800 text-lg mb-1">
              Notificaciones
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Enviar recordatorios y avisos
            </p>
          </Link>
        </div>

\        <div className="mt-10 text-center text-gray-500 text-sm">
          <p>
            Sistema de Agenda UTESA — Gestión académica y administrativa
          </p>
        </div>
      </div>
    </div>
  );
}
