"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "../../lib/auth"; 
import { useRouter } from "next/navigation";
import { Bell, AlertTriangle, Info, User } from "lucide-react";

interface NotificationItem {
  id: string;
  userId: string | null;
  type: "info" | "alert" | "reminder";
  message: string;
  sentAt: string;
  read: boolean;
}

export default function NotifsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [form, setForm] = useState({ message: "", type: "info", userId: "" });
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/pages/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifs(data);
      }
    } catch (error) {
      console.error("Error cargando notificaciones", error);
    }
  };

  useEffect(() => {
    const me = getCurrentUser();
    if (!me) router.push("/login");
    
    fetchNotifs();
  }, [router]);

  async function sendNotif(e: React.FormEvent) {
    e.preventDefault();
    if (!form.message) return alert("Escribe un mensaje");
    
    setLoading(true);
    try {
      const res = await fetch('/pages/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: form.message,
          type: form.type,
          userId: form.userId === "" ? null : form.userId
        }),
      });

      if (res.ok) {
        await fetchNotifs(); 
        setForm({ message: "", type: "info", userId: "" }); // Limpiar formulario
      } else {
        alert("Error al enviar");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    try {
      const res = await fetch(`/pages/api/notifications/${id}`, {
        method: 'PUT',
      });
      
      if (res.ok) {
        setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    } catch (error) {
      console.error("Error marcando como leída", error);
    }
  }

  async function del(id: string) {
    if (!confirm("¿Eliminar notificación?")) return;
    
    try {
      const res = await fetch(`/pages/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotifs((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error("Error eliminando", error);
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-white py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-5xl">
        <h2 className="text-2xl font-semibold text-green-800 text-center mb-8">
          Centro de Notificaciones
        </h2>

        <form onSubmit={sendNotif} className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <div className="flex items-start border rounded-lg px-3 py-2">
                <Bell className="text-gray-400 w-5 h-5 mr-2 mt-1" />
                <textarea
                  placeholder="Escribe el contenido de la notificación..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="flex-1 outline-none text-gray-700 min-h-[80px]"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de notificación
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                {form.type === "info" && <Info className="text-blue-400 w-5 h-5 mr-2" />}
                {form.type === "reminder" && <Bell className="text-yellow-400 w-5 h-5 mr-2" />}
                {form.type === "alert" && <AlertTriangle className="text-red-400 w-5 h-5 mr-2" />}
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="flex-1 outline-none text-gray-700 bg-transparent"
                  disabled={loading}
                >
                  <option value="info">Info</option>
                  <option value="reminder">Recordatorio</option>
                  <option value="alert">Alerta</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID de usuario (vacío = broadcast)
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <User className="text-gray-400 w-5 h-5 mr-2" />
                <input
                  placeholder="Ej: 123 o deja vacío"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
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
                {loading ? "Enviando..." : "Enviar"}
              </button>
              <button
                type="button"
                onClick={() => setForm({ message: "", type: "info", userId: "" })}
                className="flex-1 border border-green-700 text-green-700 py-2 rounded-lg hover:bg-green-50 transition"
                disabled={loading}
              >
                Limpiar
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              Historial de notificaciones
            </h3>
            <div className="space-y-3">
              {notifs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">
                  No hay notificaciones registradas.
                </p>
              ) : (
                notifs.map((n) => (
                  <div
                    key={n.id}
                    className={`border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center transition ${
                      n.read ? "bg-gray-50" : "bg-green-50"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-800 flex items-center gap-2">
                        {n.type === "alert" && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        {n.type === "info" && <Info className="w-4 h-4 text-blue-500" />}
                        {n.type === "reminder" && (
                          <Bell className="w-4 h-4 text-yellow-500" />
                        )}
                        {n.type.toUpperCase()}
                        <span className="text-xs text-gray-500 ml-2">
                          {n.userId ? `→ ${n.userId}` : "→ Todos"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(n.sentAt || "").toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-3 sm:mt-0">
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-sm px-3 py-1 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition"
                        >
                          Marcar leído
                        </button>
                      )}
                      <button
                        onClick={() => del(n.id)}
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
