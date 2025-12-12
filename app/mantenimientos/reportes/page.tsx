"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth"; 
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, Calendar, Users, ListOrdered, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DetailedActivity {
    id: string;
    title: string;
    date: string;
    maxCapacity: number;
    category: string;
    enrollmentCount: number; 
}

interface MonthlyData {
    year: number;
    month: number;
    activityCount: number;
}

interface EnrollmentDetail {
    enrollmentId: string;
    enrollmentDate: string;
    matricula: string;
    userName: string;
    userEmail: string;
    activityTitle: string;
    activityDate: string;
    activityPlace: string;
    activityCategory: string;
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function ReportesPage() {
    const router = useRouter();
    const [detailedReport, setDetailedReport] = useState<DetailedActivity[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]); 
    const [enrollmentDetails, setEnrollmentDetails] = useState<EnrollmentDetail[]>([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const me = getCurrentUser();
        if (!me || (me.userType !== 'admin' && me.userType !== 'organizer')) {
            router.push("/dashboard"); 
            return;
        }
        
        Promise.all([fetchDetailedReport(), fetchMonthlyReport(), fetchEnrollmentDetails()]) 
            .then(() => setLoading(false))
            .catch(() => setLoading(false));

    }, [router]);

    const fetchDetailedReport = async () => {
        try {
            const res = await fetch('/api/reports/detailed');
            if (res.ok) {
                const data: DetailedActivity[] = await res.json();
                setDetailedReport(data);
            }
        } catch (error) {
            console.error("Error cargando reporte detallado", error);
        }
    };
    
    const fetchMonthlyReport = async () => {
        try {
            const res = await fetch('/api/reports/monthly');
            if (res.ok) {
                const data: MonthlyData[] = await res.json();
                
                const formatted = data.map(item => ({
                    name: `${MONTH_NAMES[item.month - 1]}/${item.year % 100}`,
                    Actividades: item.activityCount,
                }));
                setMonthlyData(formatted);
            }
        } catch (error) {
            console.error("Error cargando reporte mensual", error);
        }
    };
    
    const fetchEnrollmentDetails = async () => {
        try {
            const res = await fetch('/api/reports/enrollments-detail'); 
            if (res.ok) {
                const data: EnrollmentDetail[] = await res.json();
                setEnrollmentDetails(data);
            }
        } catch (error) {
            console.error("Error cargando detalles de inscripciones", error);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-green-700 animate-spin mr-3" />
                <p className="text-lg text-gray-600">Cargando reportes...</p>
            </div>
        );
    }

    const topActivities = detailedReport.slice(0, 5);

    return (
        <div className="flex min-h-screen items-start justify-center bg-gray-50 py-10">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-7xl">
                <h2 className="text-3xl font-bold text-green-800 mb-8 flex items-center gap-3 border-b pb-2">
                    <TrendingUp className="w-7 h-7"/> Reportes y Analíticas de Actividades
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-2 p-6 border rounded-xl shadow-inner bg-green-50">
                        <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5"/> Actividades Creadas por Mes
                        </h3>
                        {monthlyData.length > 0 ? (
                            <div style={{ width: '100%', height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={monthlyData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                        <XAxis dataKey="name" stroke="#374151" />
                                        <YAxis allowDecimals={false} stroke="#374151" />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="Actividades" fill="#10B981" radius={[10, 10, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-10">No hay suficientes datos para generar el gráfico.</p>
                        )}
                    </div>
                    
                    <div className="lg:col-span-1 p-6 border rounded-xl shadow-lg bg-white">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <ListOrdered className="w-5 h-5 text-red-600"/> Top 5 Actividades con más Estudiantes
                        </h3>
                        <div className="space-y-4">
                            {topActivities.length > 0 ? (
                                topActivities.map((activity, index) => (
                                    <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg shadow-sm">
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white ${
                                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-yellow-800' : 'bg-green-600'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 truncate">{activity.title}</p>
                                            <p className="text-xs text-gray-500">{activity.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-green-700 block">
                                                {activity.enrollmentCount}
                                            </span>
                                            <span className="text-xs text-gray-600">Inscritos</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No hay datos de inscripciones para mostrar.</p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 p-6 border rounded-xl shadow-lg bg-white">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5"/> Reporte Detallado de Actividades
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Inscritos</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad Máx.</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupación</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {detailedReport.map((activity) => {
                                    const occupancy = activity.maxCapacity > 0 
                                        ? ((activity.enrollmentCount / activity.maxCapacity) * 100).toFixed(1)
                                        : '0.0';
                                        
                                    const isFull = activity.enrollmentCount >= activity.maxCapacity && activity.maxCapacity > 0;

                                    return (
                                        <tr key={activity.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(activity.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-700">
                                                {activity.enrollmentCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                                {activity.maxCapacity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                <span className={`font-semibold ${isFull ? 'text-red-600' : 'text-blue-600'}`}>
                                                    {occupancy}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="mt-8 p-6 border rounded-xl shadow-lg bg-white">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5"/> Reporte Detallado de Inscripciones por Usuario
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario (Matrícula)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad Inscrita</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Actividad</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Inscripción</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {enrollmentDetails.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-4 text-center text-gray-500 text-sm">
                                            No hay inscripciones registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    enrollmentDetails.map((detail) => (
                                        <tr key={detail.enrollmentId} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {detail.userName}
                                                <span className="text-xs text-gray-500 block">({detail.matricula})</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                                                {detail.activityTitle}
                                                <span className="text-xs text-gray-500 block">({detail.activityCategory})</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(detail.activityDate).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(detail.enrollmentDate).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
