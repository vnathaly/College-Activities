"use client";

import { useForm } from "react-hook-form";
import { Mail, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getCurrentUser,
  setLocalUser,
  bootstrapInitialData,
  loginWithEmail,
} from "../lib/auth";

type LoginFormInputs = {
    email: string;
    password: string;
};

export default function LoginPage() {
  const { register, handleSubmit, reset } = useForm<LoginFormInputs>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    bootstrapInitialData();
    const user = getCurrentUser();
    if (user) router.push("/dashboard");
  }, [router]);

  const onSubmit = async (data: LoginFormInputs) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/pages/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Error al intentar iniciar sesión.");
        return;
      }
      
      setLocalUser(result.user); 

      reset();
      router.push("/dashboard");

    } catch (err) {
      setError("Error de conexión con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white items-center justify-center px-6">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-12">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-semibold text-center mb-6 text-green-800">
            Universidad - Portal de Actividades
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo institucional
              </label>
              <div className="flex items-center border rounded-md shadow-sm px-3 py-2">
                <Mail className="text-gray-400 w-5 h-5 mr-2" />
                <input
                  type="email"
                  placeholder="usuario@utesa.edu.do"
                  {...register("email", { required: true })}
                  className="flex-1 outline-none text-gray-700 bg-transparent"
                  disabled={isLoading}
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
                  {...register("password", { required: true })}
                  className="flex-1 outline-none text-gray-700 bg-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <button
              type="submit"
              className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition shadow-sm disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/register")}
              className="w-full border border-green-700 text-green-700 py-2 rounded-lg hover:bg-green-50 transition shadow-sm disabled:opacity-50"
              disabled={isLoading}
            >
              Registrarse
            </button>

            {/* <div className="text-center mt-2">
              <a href="#" className="text-sm text-orange-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div> */}
          </form>
        </div>

        <div className="hidden md:flex justify-center items-center flex-1">
          <Image
            src="/imagenes/register.png"
            alt="Login ilustración UTESA"
            width={420}
            height={420}
            className="object-contain rounded-xl shadow-lg"
            priority
            onError={(e) => { e.currentTarget.src = '/imagenes/register.png' }}
          />
        </div>
      </div>
    </div>
  );
}