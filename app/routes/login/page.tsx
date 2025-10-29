"use client";

import { useForm } from "react-hook-form";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { router, useSegments } from 'expo-router';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const [logined, setlogined] = useState(false);

  const onSubmit = (data: any) => {
    console.log(data);
    // backend que hare
  };

  const handleLoggin = () => {
    router.push('./homeppage')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-[380px]">
        <h1 className="text-2xl font-semibold text-center mb-6 text-green-800">
          Universidad - Portal de Actividades
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo institucional
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Mail className="text-gray-400 w-5 h-5 mr-2" />
              <input
                type="email"
                placeholder="Usa tu correo institucional"
                {...register("email")}
                className="flex-1 outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Lock className="text-gray-400 w-5 h-5 mr-2" />
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="flex-1 outline-none text-gray-700"
              />
            </div>
          </div>

          {/* <button type="submit" className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition" 
          onClick={handleLoggin}
          >
            Ingresar
          </button> */}

          {/* <div className="text-center">
            <Link
              href="#"
              className="text-sm text-amber-600 hover:underline block"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div> */}

          <button type="button"
            className="w-full border border-green-700 text-green-700 py-2 rounded-lg hover:bg-green-50 transition" 
            // onClick={}
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}

