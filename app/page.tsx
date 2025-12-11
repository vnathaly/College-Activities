"use client";

import Link from "next/link";
import { CalendarDays, Bell, AlertTriangle, Info, MapPin, Search } from "lucide-react";
import { useState, useEffect } from "react";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  date: string;
  place: string | null;
  maxCapacity: number;
  category: string;
}

interface NotificationItem {
  id: string;
  userId: string | null;
  type: "info" | "alert" | "reminder";
  message: string;
  sentAt: string;
  read: boolean;
}

interface SelectedActivity extends Activity {
  formattedDate: string;
}

export default function HomePage() {
  const [events, setEvents] = useState<Activity[]>([]);
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SelectedActivity | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const eventsRes = await fetch('/api/events');
      const eventsData: Activity[] = eventsRes.ok ? await eventsRes.json() : [];

      const notifsRes = await fetch('/api/notifications');
      const notifsData: NotificationItem[] = notifsRes.ok ? await notifsRes.json() : [];

      const publicNotifs = notifsData.filter(n => n.userId === null);
      
      setEvents(eventsData);
      setNotifs(publicNotifs.slice(0, 5));
    } catch (error) {
      console.error("Error al cargar datos públicos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDaysWithEvents = () => {
    return events.map(e => new Date(e.date).getDate());
  };
  const daysWithEvents = getDaysWithEvents();

  const handleEventClick = (event: Activity) => {
    const date = new Date(event.date);
    const formattedDate = date.toLocaleDateString('es-ES', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
    setSelectedEvent({ ...event, formattedDate });
  };
  
  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); 

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    let calendarDays = [];
    const startOffset = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); 

    for (let i = 0; i < startOffset; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isEventDay = daysWithEvents.includes(day);
      const isToday = day === today.getDate() && currentMonth === today.getMonth();

      const dayClasses = `p-2 text-center rounded-full text-sm font-medium transition cursor-pointer 
        ${isEventDay ? 'bg-green-700 text-white shadow-md hover:bg-green-600' : 'text-gray-700 hover:bg-gray-100'}
        ${isToday && isEventDay ? 'border-2 border-yellow-300 ring-2 ring-yellow-400' : ''}
        ${isToday && !isEventDay ? 'border-2 border-green-900 text-green-900 font-bold' : ''}
        `;
      
      const eventOfDay = events.find(e => new Date(e.date).getDate() === day);

      calendarDays.push(
        <div 
          key={day} 
          className={dayClasses}
          onClick={() => eventOfDay && handleEventClick(eventOfDay)}
        >
          {day}
        </div>
      );
    }

    return (
      <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4 text-green-800">
          <h3 className="text-xl font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <CalendarDays className="w-6 h-6" />
        </div>
        <div className="grid grid-cols-7 text-xs font-bold text-gray-500 mb-2">
      
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
            <div key={d} className="text-center p-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
            * Círculos verdes indican eventos.
        </p>
      </div>
    );
  };
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-lg text-green-700">Cargando agenda pública...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
      
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-green-800">
            Agenda UTESA Pública
          </h1>
          <p className="text-gray-600 mb-6">
            Consulta los eventos y anuncios institucionales.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition font-medium shadow-md"
            >
              Iniciar sesión / Administrar
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
+
          <div className="lg:col-span-2 space-y-8">
            {renderCalendar()}
            
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-semibold text-green-800 mb-4">Próximos Eventos</h3>
                {events.length === 0 ? (
                    <p className="text-gray-500">No hay eventos públicos programados.</p>
                ) : (
                    <div className="space-y-4">
                        {events.slice(0, 5).map(event => (
                            <div 
                                key={event.id} 
                                className="p-3 border rounded-lg hover:bg-green-50 transition cursor-pointer flex justify-between items-center"
                                onClick={() => handleEventClick(event)}
                            >
                                <div>
                                    <p className="font-medium text-gray-800">{event.title}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3"/> {event.place}
                                    </p>
                                </div>
                                <span className="text-xs text-green-700 font-semibold">
                                    {new Date(event.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                    <Bell className="w-6 h-6"/> Anuncios Públicos
                </h3>
                <div className="space-y-4">
                    {notifs.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay anuncios recientes.</p>
                    ) : (
                        notifs.map(n => (
                            <div key={n.id} className={`p-3 rounded-lg border ${
                                n.type === 'alert' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'
                            }`}>
                                <div className="flex items-center text-sm font-semibold mb-1">
                                    {n.type === 'alert' ? (
                                        <AlertTriangle className="w-4 h-4 text-red-600 mr-2"/>
                                    ) : (
                                        <Info className="w-4 h-4 text-blue-600 mr-2"/>
                                    )}
                                    <span className={n.type === 'alert' ? 'text-red-700' : 'text-blue-700'}>
                                        {n.type === 'alert' ? 'ALERTA' : 'INFORMATIVO'}
                                    </span>
                                </div>
                                <p className="text-gray-700 text-sm">{n.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(n.sentAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-green-800 mb-2">{selectedEvent.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedEvent.formattedDate}</p>

            <div className="space-y-3 mb-6">
                <p className="text-gray-700">{selectedEvent.description || "No se proporcionó una descripción detallada."}</p>
                <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600"/> 
                    Lugar: {selectedEvent.place || "N/A"}
                </p>
                <p className="text-sm font-medium text-gray-600">
                    Cupo Máximo: {selectedEvent.maxCapacity} personas
                </p>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
