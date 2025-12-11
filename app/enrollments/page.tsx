"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, logout } from "../lib/auth"; 
import { CalendarDays, LogOut, MapPin, Loader2, ListOrdered, ArrowLeft, XCircle } from "lucide-react";

interface Activity {
  id: string; 
  title: string;
  description: string | null;
  date: string;
  place: string | null;
  category: string;
}

interface EnrolledActivity extends Activity {
    enrollmentId: string; 
    enrollmentDate: string;
}

export default function EnrollmentsPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [enrolledActivities, setEnrolledActivities] = useState<EnrolledActivity[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);


    const fetchEnrolledActivities = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/enrollments?userId=${id}`);
            const data: any[] = res.ok ? await res.json() : [];

            const activities: EnrolledActivity[] = data.map(item => ({
                ...item,
                enrollmentId: item.enrollmentId, 
                enrollmentDate: item.enrollmentDate,
            })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            setEnrolledActivities(activities);

        } catch (error) {
            console.error("Error fetching enrolled activities", error);
            setEnrolledActivities([]); 
        } finally {
            setLoading(false);
        }
    }, []);
    
    const handleCancel = async (enrollmentId: string, activityTitle: string) => {
        if (!confirm(`¿Está seguro de cancelar la inscripción a "${activityTitle}"?`)) return;
        
        setIsCancelling(true);
        try {
            const res = await fetch(`/api/enrollments/${enrollmentId}`, {
                method: 'DELETE',
            });
            
            if (res.ok) {
                setEnrolledActivities(prev => 
                    prev ? prev.filter(a => a.enrollmentId !== enrollmentId) : []
                );
            } else {
                alert("Error al cancelar la inscripción.");
            }

        } catch (error) {
            console.error("Error al cancelar", error);
            alert("Error de conexión al cancelar la inscripción.");
        } finally {
            setIsCancelling(false);
        }
    };


    useEffect(() => {
        const user = getCurrentUser();
        if (!user) {
            router.push("/login");
            return;
        }
        setUserId(user.id);
        fetchEnrolledActivities(user.id);
    }, [router, fetchEnrolledActivities]);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const formatActivityDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) + 
               ' a las ' + 
               date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 bg-white shadow-xl flex flex-col p-4 rounded-r-2xl h-screen sticky top-0">
                <div className="text-2xl font-bold text-green-800 mb-8 p-2">
                    UTESA
                </div>
                <Link
                    href="/dashboard"
                    className="flex items-center p-3 rounded-xl transition text-gray-600 hover:bg-gray-100 font-semibold mb-4 border border-gray-200"
                >
                    <ArrowLeft className="w-5 h-5 mr-3" />
                    Volver al Dashboard
                </Link>
                {/* <div className="flex-grow">
                    <p className="text-sm font-semibold text-gray-700 p-2 border-b mb-2">Filtros</p>
                    <div className="text-xs text-gray-500 p-2 space-y-1">
                        <p className="hover:text-green-700 cursor-pointer">Próximas</p>
                        <p className="hover:text-green-700 cursor-pointer">Pasadas</p>
                        <p className="hover:text-green-700 cursor-pointer">Académicas</p>
                    </div>
                </div> */}
                    <button 
                        onClick={handleLogout}
                        className="flex items-center p-3 rounded-xl text-red-500 hover:bg-red-50 transition w-full"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Cerrar Sesión
                    </button>
            
            </aside>

            <main className="flex-1 p-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-2">
                    Mis Inscripciones
                </h1>

                {(loading || isCancelling) && (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 text-green-700 animate-spin mr-2" />
                        <span className="text-lg text-gray-600">
                            {isCancelling ? "Cancelando inscripción..." : "Cargando actividades inscritas..."}
                        </span>
                    </div>
                )}

                {!loading && !isCancelling && enrolledActivities && enrolledActivities.length === 0 && (
                    <div className="p-10 bg-white rounded-xl shadow-lg border-2 border-dashed border-green-300 text-center">
                        <ListOrdered className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-green-700 mb-2">
                            ¡Aún no te has inscrito en ninguna actividad!
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Explora las opciones disponibles en el panel principal para empezar a participar en la vida universitaria.
                        </p>
                        <Link 
                            href="/dashboard" 
                            className="inline-flex items-center bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition font-medium shadow-lg"
                        >
                            Ver Actividades Disponibles
                        </Link>
                    </div>
                )}
                
                {!loading && !isCancelling && enrolledActivities && enrolledActivities.length > 0 && (
                    <div className="space-y-6">
                        <div className="text-sm font-medium text-gray-600 mb-4">
                            Mostrando {enrolledActivities.length} actividades inscritas.
                        </div>
                        {enrolledActivities.map((activity) => (
                            <div 
                                key={activity.id} 
                                className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-green-600 transition hover:shadow-xl hover:bg-gray-50"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                            {activity.category || "General"}
                                        </span>
                                        <h3 className="text-xl font-bold text-gray-800 mt-1">{activity.title}</h3>
                                        <p className="text-gray-600 mt-1 text-sm line-clamp-2">{activity.description}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleCancel(activity.enrollmentId, activity.title)}
                                        className="flex items-center text-xs text-red-500 hover:text-red-700 transition"
                                    >
                                        <XCircle className="w-4 h-4 mr-1"/>
                                        Cancelar
                                    </button>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                                    <p className="flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4 text-green-600"/>
                                        {formatActivityDate(activity.date)}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-green-600"/>
                                        {activity.place}
                                    </p>
                                </div>
                                <div className="text-xs text-right mt-2 text-gray-400">
                                    Te inscribiste el: {new Date(activity.enrollmentDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
