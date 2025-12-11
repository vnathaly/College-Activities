"use client";

import { useEffect, useState } from "react";
import { Bell, Send, Loader2, Info, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface NotificationItem {
  id: string;
  userId: string | null;
  type: string;
  message: string;
  sentAt: string;
  read: boolean;
}

export default function NotificacionesPage() {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm();
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifs(data);
      }
    } catch (error) {
      console.error("Error cargando notificaciones", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const me = getCurrentUser();
    if (!me || (me.userType !== 'admin' && me.userType !== 'organizer')) {
        router.push("/dashboard"); 
        return;
    }
    fetchNotifs();
  }, [router]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        alert(`Error al enviar: ${result.message || "Error desconocido."}`);
        throw new Error(result.message);
      }

      await fetchNotifs();
      reset(); 
    } catch (error) {
      console.error("Error al enviar notificación", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar notificación?")) return;

    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotifs((prev) => prev.filter((n) => n.id !== id));
      } else {
        alert("Error al eliminar la notificación.");
      }
    } catch (error) {
      console.error(error);
    }
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('es-ES', { 
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-red-100 border-red-300 text-red-800';
      case 'reminder': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'info':
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-6xl">
        <h2 className="text-2xl font-bold text-green-800 text-center mb-8">
          Gestión de Notificaciones y Anuncios
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 border rounded-xl shadow-inner bg-green-50 mb-10 space-y-4">
          <div className="text-lg font-semibold text-green-700 flex items-center gap-2">
            <Send className="w-5 h-5"/> Enviar Nuevo Anuncio
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje del Anuncio</label>
            <textarea
              placeholder="Escribe el anuncio aquí..."
              {...register("message", { required: true })}
              className="w-full border rounded-lg p-3 h-24 outline-none text-gray-700"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Notificación</label>
              <select
                {...register("type", { required: true })}
                className="w-full border rounded-lg p-3 outline-none text-gray-700"
                disabled={isSubmitting}
                required
              >
                <option value="info">Informativo (Azul)</option>
                <option value="alert">Alerta Urgente (Rojo)</option>
                <option value="reminder">Recordatorio (Amarillo)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID de Usuario Específico (Opcional)</label>
              <input
                type="text"
                placeholder="Dejar vacío para enviar a TODOS (Broadcast)"
                {...register("userId")}
                className="w-full border rounded-lg p-3 outline-none text-gray-700"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin"/> Enviando...
                </>
            ) : (
                <>
                    <Send className="w-5 h-5"/> Enviar Anuncio Ahora
                </>
            )}
          </button>
        </form>

        <h3 className="text-lg font-semibold text-green-800 mb-4">
          Historial de Notificaciones ({notifs.length})
        </h3>
        {loading ? (
          <div className="flex justify-center items-center h-20 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2"/> Cargando historial...
          </div>
        ) : (
          <div className="space-y-3">
            {notifs.map((n) => (
              <div
                key={n.id}
                className={`border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center ${getStyle(n.type)}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm capitalize">
                    {n.type}
                    <span className="text-xs font-normal ml-3 text-gray-600">
                        {n.userId ? <User className="w-3 h-3 inline mr-1"/> : "(BROADCAST)"} {n.userId || 'A todos los usuarios'}
                    </span>
                  </p>
                  <p className="text-gray-700 mt-1 break-words">{n.message}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Enviado: {formatTime(n.sentAt)}
                  </p>
                </div>

                <div className="flex gap-2 mt-3 sm:mt-0 sm:ml-4">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${n.read ? 'bg-gray-300 text-gray-700' : 'bg-red-500 text-white'}`}>
                    {n.read ? 'Leída' : 'Pendiente'}
                  </span>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="text-xs px-3 py-1 bg-red-50 border border-red-500 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
