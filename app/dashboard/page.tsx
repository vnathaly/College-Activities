"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, logout } from "../../lib/auth";
import { Home as HomeIcon, CalendarDays, Users, Bookmark, LogOut, MapPin, Search, BarChart, UserCircle, Bell, Info, CheckCircle, ClipboardList } from "lucide-react";

interface SafeUser {
    id: string;
    firstName: string;
    lastName: string;
    userType: string;
}

interface Activity {
    id: string;
    title: string;
    description: string | null;
    date: string;
    place: string | null;
    maxCapacity: number;
    category: string;
}

const ToastMessage = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === 'success';

    return (
        <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center space-x-3 transition-transform duration-300 transform ${isSuccess ? 'bg-green-600' : 'bg-red-600'
                } text-white`}
            role="alert"
        >
            {isSuccess ? <CheckCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            <p className="font-medium text-sm">{message}</p>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition">
                &times;
            </button>
        </div>
    );
};


const SuggestedActivities = ({ activities, handleEnroll, enrolledActivities, loading, currentUserId }: {
    activities: Activity[],
    handleEnroll: (activityId: string) => Promise<void>,
    enrolledActivities: Set<string>,
    loading: boolean,
    currentUserId: string
}) => {
    const suggested = activities.filter(a => !enrolledActivities.has(a.id)).slice(0, 3);

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Sugerencias para ti</h3>
                {/* <span className="text-green-700 font-medium cursor-pointer text-sm">Ver más &gt;</span> */}
            </div>
            <div className="grid grid-cols-3 gap-4">
                {loading ? (
                    <p className="text-gray-500 text-sm col-span-3 text-center">Cargando sugerencias...</p>
                ) : suggested.length > 0 ? (
                    suggested.map((activity) => (
                        <div key={activity.id} className="flex flex-col items-center p-3 border rounded-lg bg-gray-50">
                            <div className="w-full h-16 bg-gray-200 rounded-lg mb-2 flex items-center justify-center text-gray-500">
                                <CalendarDays className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-center text-gray-700 mb-2">{activity.title}</p>

                            {enrolledActivities.has(activity.id) ? (
                                <button className="text-xs px-2 py-1 bg-green-500 text-white rounded-lg w-full cursor-default">
                                    Inscrito
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleEnroll(activity.id)}
                                    className="text-xs px-2 py-1 border border-yellow-700 text-yellow-700 rounded-lg hover:bg-yellow-50 transition w-full"
                                    disabled={loading}
                                >
                                    Inscribir
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm col-span-3 text-center">No hay sugerencias disponibles.</p>
                )}
            </div>
        </div>
    );
};

const MyWeekCalendar = ({ events }: { events: Activity[] }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    const eventDays = new Set(
        events
            .filter(e => new Date(e.date).getMonth() === currentMonth)
            .map(e => new Date(e.date).getDate())
    );

    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            day: i,
            isToday: i === today.getDate(),
            isEventDay: eventDays.has(i),
        });
    }

    const startDay = new Date(currentYear, currentMonth, 1).getDay();
    const startOffset = startDay === 0 ? 6 : startDay - 1;

    return (
        <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Mi semana</h3>
            <div className="grid grid-cols-7 text-xs font-bold text-gray-500 mb-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d} className="text-center">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array(startOffset).fill(0).map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
                {days.map((d, i) => (
                    <div
                        key={i}
                        className={`p-1 text-center text-sm rounded-full 
                            ${d.isEventDay ? 'bg-green-700 text-white' : 'text-gray-700'}
                            ${d.isToday && !d.isEventDay ? 'border-2 border-green-500 text-green-700 font-bold' : ''}
                            ${d.isToday && d.isEventDay ? 'ring-2 ring-green-900' : ''}
                            cursor-pointer
                        `}
                    >
                        {d.day}
                    </div>
                ))}
            </div>
        </div>
    );
};

const AttendancePanel = () => (
    <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Asistencia</h3>
        <div className="relative w-24 h-24 mb-4">
            <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                    className="text-gray-200"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                />
                <path
                    className="text-green-700"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    strokeWidth="3"
                    strokeDasharray="85, 100"
                />
                <text x="18" y="20.35" className="text-lg font-bold" fill="#15803d" textAnchor="middle">
                    85%
                </text>
            </svg>
        </div>
        <p className="text-sm text-gray-600 mb-2">Asistencia</p>
        <p className="text-xs text-gray-500 mb-4">22 mt</p>
        <button className="text-sm px-4 py-2 border border-yellow-700 text-yellow-700 rounded-lg hover:bg-yellow-50 transition w-full">
            Guardar
        </button>
    </div>
);


export default function DashboardPage() {
    const router = useRouter();
    const [me, setMe] = useState<SafeUser | null>(null);
    const [todayActivity, setTodayActivity] = useState<Activity | null>(null);
    const [allActivities, setAllActivities] = useState<Activity[]>([]);
    const [nextActivities, setNextActivities] = useState<Activity[]>([]);
    const [enrolledActivities, setEnrolledActivities] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const baseMenuItems = [
        { name: "Inicio", href: "/dashboard", icon: HomeIcon, requiredRoles: ['student', 'organizer', 'admin'], current: true },
        { name: "Inscripciones", href: "/enrollments", icon: ClipboardList, requiredRoles: ['student', 'organizer', 'admin'], current: false },
        //{ name: "Actividades", href: "/activities", icon: CalendarDays, requiredRoles: ['student', 'organizer', 'admin'], current: false },
        //{ name: "Guardado", href: "/saved", icon: Bookmark, requiredRoles: ['student', 'organizer', 'admin'], current: false },

        { name: "Eventos (Maint.)", href: "/mantenimientos/eventos", icon: CalendarDays, requiredRoles: ['admin', 'organizer'], current: false },
        { name: "Usuarios (Maint.)", href: "/mantenimientos/usuarios", icon: Users, requiredRoles: ['admin'], current: false },
        { name: "Notificaciones", href: "/mantenimientos/notificaciones", icon: Bell, requiredRoles: ['admin', 'organizer'], current: false },
    ];

    const filteredMenuItems = baseMenuItems.filter(item => {
        if (!me) return false;
        return item.requiredRoles.includes(me.userType);
    });

    const fetchEnrollments = useCallback(async (userId: string) => {
        try {
            const res = await fetch(`/api/enrollments?userId=${userId}`);
            if (res.ok) {
                const data: Activity[] = await res.json();
                const enrolledIds = new Set(data.map(e => e.id));
                setEnrolledActivities(enrolledIds);
            }
        } catch (error) {
            console.error("Error fetching enrollments", error);
        }
    }, []);


    const fetchActivities = useCallback(async (userId: string) => {
        try {
            const res = await fetch('/api/events');
            const data: Activity[] = res.ok ? await res.json() : [];

            setAllActivities(data);

            const today = new Date().toISOString().slice(0, 10);

            const todayEvent = data.find(
                (a) => new Date(a.date).toISOString().slice(0, 10) === today
            );

            const nextEvents = data.filter(
                (a) => new Date(a.date).toISOString().slice(0, 10) !== today
            ).slice(0, 5);

            setTodayActivity(todayEvent || null);
            setNextActivities(nextEvents);

            fetchEnrollments(userId);

        } catch (error) {
            console.error("Error fetching activities", error);
        } finally {
            setLoading(false);
        }
    }, [fetchEnrollments]);

    useEffect(() => {
        const user = getCurrentUser();
        if (!user) {
            router.push("/");
            return;
        }

        setMe(user as SafeUser);

        fetchActivities(user.id);

    }, [router, fetchActivities]);


    const handleEnroll = async (activityId: string) => {
        if (!me) return;

        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: me.id,
                    activityId: activityId,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                setEnrolledActivities(prev => new Set(prev).add(activityId));
                setMessage({
                    text: "¡Inscripción exitosa! Se ha generado una notificación.",
                    type: 'success'
                });
            } else {
                setMessage({ text: result.message || "Error al inscribirse.", type: 'error' });
            }
        } catch (error) {
            setMessage({ text: "Error de conexión.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    if (loading) return <div className="text-center mt-10 text-gray-600">Cargando Dashboard...</div>;

    const userName = me ? `${me.firstName} ${me.lastName}`.trim() || me.userType : 'Usuario';


    return (
        <div className="flex min-h-screen bg-gray-50">
            {message && <ToastMessage message={message.text} type={message.type} onClose={() => setMessage(null)} />}

            <aside className="w-64 bg-white shadow-xl flex flex-col p-4 rounded-r-2xl h-screen sticky top-0">
                <div className="text-2xl font-bold text-green-800 mb-8 p-2">
                    UTESA
                </div>
                <nav className="grow space-y-2">
                    {filteredMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center p-3 rounded-xl transition 
                                    ${item.current
                                        ? 'bg-green-100 text-green-800 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-100'}`
                                }
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="mt-8 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
                    <p className="text-xs text-gray-500 mb-3">{me?.userType.toUpperCase()}</p>
                    <button
                        onClick={handleLogout}
                        className="flex items-center p-3 rounded-xl text-red-500 hover:bg-red-50 transition w-full"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div className="relative w-full max-w-lg">
                        <input
                            type="text"
                            placeholder="Buscar actividades, eventos o departamentos"
                            className="w-full p-3 pl-10 border border-gray-200 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500"
                            disabled={loading}
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/mantenimientos/notificaciones" className="p-2 relative">
                            <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-green-700 transition" />
                            <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border border-white"></span>
                        </Link>

                        {/* Lo vamos a hacer si y solo si el tiempo lo permite. */}

                        {/* <button type="button">
                            <UserCircle className="w-8 h-8 text-green-700 cursor-pointer" />
                        </button> */}

                        {/* <div className="mt-8 pt-4 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
                            <p className="text-xs text-gray-500 mb-3">{me?.userType.toUpperCase()}</p>
                            <button
                                onClick={handleLogout}
                                className="flex items-center p-3 rounded-xl text-red-500 hover:bg-red-50 transition w-full"
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Cerrar Sesión
                            </button>
                        </div> */}

                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <section className="lg:col-span-2 space-y-8">

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Actividad del día</h2>
                            {todayActivity ? (
                                <div className="flex items-start gap-6">
                                    <div className="w-1/3 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                        <CalendarDays className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                                            {todayActivity.category || "Académica"}
                                        </span>
                                        <h3 className="text-2xl font-bold text-gray-900 mt-2">{todayActivity.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            {new Date(todayActivity.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {todayActivity.place}
                                        </p>

                                        {enrolledActivities.has(todayActivity.id) ? (
                                            <button className="bg-green-500 text-white px-4 py-2 rounded-lg cursor-default shadow-md">
                                                ¡Inscrito!
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEnroll(todayActivity.id)}
                                                className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition shadow-md"
                                                disabled={loading}
                                            >
                                                Inscribirme
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No hay eventos programados para hoy.</p>
                            )}
                        </div>

                        <SuggestedActivities
                            activities={allActivities}
                            handleEnroll={handleEnroll}
                            enrolledActivities={enrolledActivities}
                            currentUserId={me?.id || ''}
                            loading={loading}
                        />

                        <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex justify-between items-center">
                                Actividades Próximas
                                {/* <span className="text-green-700 font-medium cursor-pointer text-sm">Ver más &gt;</span> */}
                            </h3>
                            <div className="space-y-3">
                                {nextActivities.length > 0 ? (
                                    nextActivities.map(event => (
                                        <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50 transition flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-800">{event.title}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {event.place}
                                                </p>
                                            </div>
                                            <span className="text-xs text-green-700 font-semibold">
                                                {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">No hay eventos próximos registrados.</p>
                                )}
                            </div>
                        </div>

                    </section>

                    <aside className="lg:col-span-1 space-y-8">
                        <MyWeekCalendar events={allActivities} />
                        <AttendancePanel />
                    </aside>
                </div>
            </main>
        </div>
    );
}
