"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, FileText } from "lucide-react";
import { EventItem, readFromStorage, saveToStorage } from "../../lib/data";
import { getCurrentUser } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function EventosPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    place: "",
    maxCapacity: 30,
  });

  useEffect(() => {
    const me = getCurrentUser();
    if (!me) router.push("/login");
    const stored = readFromStorage<EventItem[]>("agenda:events", []);
    setEvents(stored);
  }, [router]);

  useEffect(() => {
    saveToStorage("agenda:events", events);
  }, [events]);

  function startEdit(e: EventItem) {
    setEditing(e);
    setForm({
      title: e.title,
      description: e.description || "",
      date: e.date,
      place: e.place || "",
      maxCapacity: e.maxCapacity,
    });
  }

  function clearForm() {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      date: "",
      place: "",
      maxCapacity: 30,
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) return alert("Completa los campos obligatorios.");

    if (editing) {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editing.id
            ? {
                ...ev,
                title: form.title,
                description: form.description,
                date: form.date,
                place: form.place,
                maxCapacity: form.maxCapacity,
              }
            : ev
        )
      );
      clearForm();
    } else {
      const newEv: EventItem = {
        id: uuidv4(),
        title: form.title,
        description: form.description,
        date: form.date || new Date().toISOString(),
        place: form.place,
        maxCapacity: form.maxCapacity,
        status: "active",
      };
      setEvents((prev) => [newEv, ...prev]);
      clearForm();
    }
  }

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar evento?")) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-white py-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-5xl">
        <h2 className="text-2xl font-semibold text-green-800 text-center mb-8">
          Mantenimiento de Eventos
        </h2>
        <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del evento
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <FileText className="text-gray-400 w-5 h-5 mr-2" />
                <input
                  type="text"
                  placeholder="Ej: Charla sobre IA"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="flex-1 outline-none text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lugar
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <MapPin className="text-gray-400 w-5 h-5 mr-2" />
                <input
                  type="text"
                  placeholder="Auditorio principal"
                  value={form.place}
                  onChange={(e) => setForm({ ...form, place: e.target.value })}
                  className="flex-1 outline-none text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y hora
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <Calendar className="text-gray-400 w-5 h-5 mr-2" />
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="flex-1 outline-none text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cupo máximo
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <Users className="text-gray-400 w-5 h-5 mr-2" />
                <input
                  type="number"
                  min={1}
                  value={form.maxCapacity}
                  onChange={(e) =>
                    setForm({ ...form, maxCapacity: Number(e.target.value) })
                  }
                  className="flex-1 outline-none text-gray-700"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              placeholder="Describe brevemente el evento..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border rounded-lg p-3 h-40 outline-none text-gray-700"
            />

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
              >
                {editing ? "Guardar cambios" : "Crear evento"}
              </button>
              <button
                type="button"
                onClick={clearForm}
                className="flex-1 border border-green-700 text-green-700 py-2 rounded-lg hover:bg-green-50 transition"
              >
                Limpiar
              </button>
            </div>
          </div>
        </form>
        <h3 className="text-lg font-semibold text-green-800 mb-4">
          Lista de eventos
        </h3>
        {events.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">
            No hay eventos registrados.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 hover:bg-gray-100 transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {ev.title}
                    <span className="text-xs text-gray-500 ml-2">
                      ({new Date(ev.date).toLocaleString()})
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {ev.place} • Cupos: {ev.maxCapacity}
                  </p>
                  {ev.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {ev.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-3 sm:mt-0">
                  <button
                    onClick={() => startEdit(ev)}
                    className="text-sm px-3 py-1 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
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
