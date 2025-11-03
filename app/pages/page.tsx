import Link from "next/link";
import { CalendarDays } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-3xl text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CalendarDays className="w-10 h-10 text-green-700" />
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-green-800 mb-3">
          Agenda UTESA
        </h1>
        <p className="text-gray-600 mb-8 text-sm">
          Plataforma institucional para la gestión de eventos, usuarios y
          notificaciones.  
          <br />
          <span className="text-gray-500">
            (Versión funcional básica — hardcodeada)
          </span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition font-medium"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto border border-green-700 text-green-700 px-6 py-2 rounded-lg hover:bg-green-50 transition font-medium"
          >
            Ir al panel
          </Link>
        </div>

        <section className="mt-10 text-left bg-white p-5 rounded-xl border">
          <h2 className="text-lg font-semibold text-green-800 mb-2 text-center">
            Credenciales de demostración
          </h2>
          <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
            <li>
              <strong>Administrador:</strong> admin@utesa.edu.do / admin123
            </li>
            <li>
              <strong>Organizador:</strong> orga@utesa.edu.do / orga123
            </li>
            <li>
              <strong>Estudiante:</strong> juan@utesa.edu.do / juan123
            </li>
          </ul>
        </section>

        <p className="mt-8 text-xs text-gray-400">
          Universidad Tecnológica de Santiago — UTESA © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
