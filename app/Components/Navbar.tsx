"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getCurrentUser, logout } from "../lib/auth";
import {
  LogOut,
  UserCircle2,
  LayoutDashboard,
  Home,
  Users,
  Mail,
  Shield,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [openProfile, setOpenProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
    setUser(null);
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-100 relative z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-semibold text-green-800">
            Agenda UTESA
          </span>
        </Link>

        {/* Links principales */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`flex items-center gap-1 text-sm font-medium hover:text-green-700 transition ${
              pathname === "/" ? "text-green-800" : "text-gray-600"
            }`}
          >
            <Home className="w-4 h-4" /> Inicio
          </Link>

          <Link
            href="/dashboard"
            className={`flex items-center gap-1 text-sm font-medium hover:text-green-700 transition ${
              pathname.startsWith("/dashboard")
                ? "text-green-800"
                : "text-gray-600"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Panel
          </Link>

          <Link
            href="/mantenimientos/usuarios"
            className={`flex items-center gap-1 text-sm font-medium hover:text-green-700 transition ${
              pathname.startsWith("/mantenimientos")
                ? "text-green-800"
                : "text-gray-600"
            }`}
          >
            <Users className="w-4 h-4" /> Mantenimientos
          </Link>
        </div>

        {/* Usuario o login */}
        <div className="flex items-center gap-3" ref={dropdownRef}>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpenProfile((prev) => !prev)}
                className="flex items-center gap-2 text-gray-700 hover:text-green-800 transition"
              >
                <UserCircle2 className="w-5 h-5 text-green-700" />
                <span className="text-sm font-medium">{user.name}</span>
              </button>

              {openProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 animate-fadeIn">
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <UserCircle2 className="w-4 h-4 text-green-700" />
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <Shield className="w-4 h-4 text-gray-500" />
                      Rol: <span className="capitalize">{user.role}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-green-700 text-white px-4 py-1.5 rounded-lg hover:bg-green-800 transition font-medium"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
