export default function LoginForm () {
    return (
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

          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
          >
            Ingresar
          </button>

          <div className="text-center">
            <Link
              href="#"
              className="text-sm text-amber-600 hover:underline block"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="button"
            className="w-full border border-green-700 text-green-700 py-2 rounded-lg hover:bg-green-50 transition"
          >
            Registrarse
          </button>
        </form>
    )
}
