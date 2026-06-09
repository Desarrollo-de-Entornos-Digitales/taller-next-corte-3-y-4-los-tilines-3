'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/context/AuthContext';
import { useProfileStore } from '@/lib/zustand/profileStore';
import { Check, Star, Play, ChevronRight, Calendar, BookOpen, BarChart3, Trophy, FileText, Users, Clock, Eye } from 'lucide-react';

import { getProfileOverview, ProfileStats } from '../services/profileService';
import { achievementsService, UserAchievement } from '../services/achievementsService';

const initialStats: ProfileStats = {
    activeUnits: 0,
    averageProgress: 0,
    completedExercises: 0,
    totalExercises: 0,
};

const formatActivityTime = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'hace un momento';
    if (diffMinutes < 60) return `hace ${diffMinutes} min`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `hace ${diffHours} h`;

    const diffDays = Math.floor(diffHours / 24);
    return `hace ${diffDays} d`;
};

// Datos de ejemplo para la vista de profesor
const mockProfessorTasks = [
    {
        id: '1',
        title: 'Condicionales',
        type: 'Ejercicio',
        courseName: 'Curso G1',
        moduleName: 'Unidad 2',
        dateLabel: 'Mantén',
        color: '#E9539A',
        href: '/ejercicios/manage/create',
    },
    {
        id: '2',
        title: 'Ciclos',
        type: 'Ejercicio',
        courseName: 'Curso G3',
        moduleName: 'Unidad 3',
        dateLabel: '18/sem',
        color: '#953DF1',
        href: '/ejercicios/manage/create',
    },
    {
        id: '3',
        title: 'Estructuras de control',
        type: 'Quiz',
        courseName: 'Todos los cursos',
        moduleName: 'Unidad 2',
        dateLabel: '02/sem',
        color: '#FFB800',
        href: '/ejercicios/manage/create',
    },
];

const mockProfessorActivity = [
    {
        id: '1',
        title: 'Creaste "Tipos de datos"',
        description: 'Has creado un nuevo ejercicio',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        icon: 'check' as const,
        color: '#4A86F7',
    },
    {
        id: '2',
        title: 'Actualizaste "Unidad 1"',
        description: 'Has modificado el módulo',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        icon: 'play' as const,
        color: '#37CDB2',
    },
    {
        id: '3',
        title: 'Eliminaste "Quiz objetos"',
        description: 'Has eliminado un ejercicio',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        icon: 'star' as const,
        color: '#E9539A',
    },
];

export default function ProfilePage() {
    const { user, token } = useAuth();
    const [realAchievements, setRealAchievements] = useState<UserAchievement[]>([]);

    const {
        tasks,
        loadingTasks,
        tasksError,
        recentActivity,
        stats,
        setStats,
        setTasks,
        setLoadingTasks,
        setTasksError,
        mergeRecentActivity,
    } = useProfileStore();

    const displayStats = stats || initialStats;
    const displayName = user?.username ?? 'majo';
    const displayUsername = user?.username ? `@${user.username.toLowerCase().replace(/\s+/g, '_')}` : '@majo';
    const displayRole = user?.roleName ? String(user.roleName).toLowerCase() : 'profesor';
    const isProfessor = displayRole === 'profesor' || displayRole === 'admin' || displayRole === 'teacher';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    // Datos específicos para cada rol
    const studentStats = {
        activeCourses: displayStats.activeUnits || 1,
        averageProgress: displayStats.averageProgress || 87,
    };

    const professorStats = {
        activeCourses: displayStats.activeUnits || 1,
        publishedExercises: displayStats.totalExercises || 3,
    };

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            setLoadingTasks(true);
            setTasksError(null);

            try {
                let userId = user?.id;

                if (!userId && typeof window !== 'undefined') {
                    const raw = localStorage.getItem('user');
                    if (raw) {
                        const parsed = JSON.parse(raw) as { id?: number | string };
                        userId = Number(parsed.id);
                    }
                }

                if (!userId || Number.isNaN(userId)) {
                    throw new Error('No se encontró el usuario autenticado.');
                }

                const overview = await getProfileOverview(userId);
                if (!mounted) return;

                setStats(overview.stats);
                setTasks(overview.upcomingTasks);
                mergeRecentActivity(overview.recentActivity);

                if (token && !isProfessor) {
                    try {
                        const uAchievements = await achievementsService.getUserAchievements(userId, token);
                        if (mounted) setRealAchievements(uAchievements.slice(0, 3));
                    } catch (error) {
                        console.error('Failed to fetch user achievements', error);
                    }
                }
            } catch (error: unknown) {
                if (!mounted) return;
                if (error instanceof Error) {
                    setTasksError(error.message);
                    return;
                }
                setTasksError('No se pudo cargar el perfil.');
            } finally {
                if (mounted) setLoadingTasks(false);
            }
        };

        void loadProfile();

        const handleActivityUpdate = () => {
            void loadProfile();
        };

        window.addEventListener('otly-activity-update', handleActivityUpdate);

        return () => {
            mounted = false;
            window.removeEventListener('otly-activity-update', handleActivityUpdate);
        };
    }, [user?.id, mergeRecentActivity, setLoadingTasks, setTasks, setTasksError, isProfessor, token, setStats]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavBar />

            <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8 md:py-12 font-sans">
                <h1 className="text-3xl font-black text-gray-900 mb-6">Perfil</h1>

                {tasksError && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-2xl mb-4">
                        {tasksError}
                    </div>
                )}

                {/* Layout de 2 columnas: Perfil a la izquierda, Tareas a la derecha */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Columna Izquierda: Tarjeta de Usuario */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm h-full">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4">
                                {avatarLetter}
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">{displayName}</h2>
                            <p className="text-gray-500 text-sm mt-1">{displayUsername}</p>
                            <div className="w-full mt-6 space-y-2">
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                    <span className="text-gray-400">🎓</span> Universidad Icesi
                                </div>
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                    <span className="text-gray-400">📅</span> Miembro desde: Junio 2024
                                </div>
                            </div>
                            <button className="mt-6 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition-colors w-full">
                                Editar perfil
                            </button>
                        </div>
                    </div>

                    {/* Columna Derecha: Próximas tareas */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm h-full">
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar className="w-5 h-5 text-[#1E3A8A]" />
                            <h3 className="font-black text-gray-900 text-lg">Próximas tareas</h3>
                        </div>

                        {loadingTasks ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {mockProfessorTasks.map((task) => (
                                    <Link
                                        key={task.id}
                                        href={task.href}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 text-sm">
                                                {task.type}: {task.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {task.moduleName} · {task.courseName}
                                            </p>
                                        </div>
                                        <span
                                            className="text-xs font-bold px-3 py-1.5 rounded-full"
                                            style={{ backgroundColor: `${task.color}15`, color: task.color }}
                                        >
                                            {task.dateLabel}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Fila inferior: Resumen de aprendizaje y Actividad reciente en una sola línea horizontal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Resumen de aprendizaje */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <h3 className="font-black text-gray-900 text-lg mb-6">Resumen de aprendizaje</h3>
                        <div className="flex gap-12 justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <p className="text-3xl font-black text-gray-900">{professorStats.activeCourses}</p>
                                <p className="text-xs font-medium text-gray-500 mt-1">Cursos activos</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <p className="text-3xl font-black text-gray-900">{professorStats.publishedExercises}</p>
                                <p className="text-xs font-medium text-gray-500 mt-1">Ejercicios publicados</p>
                            </div>
                        </div>
                    </div>

                    {/* Actividad reciente */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <h3 className="font-black text-gray-900 text-lg mb-6">Actividad reciente</h3>
                        <div className="space-y-4">
                            {mockProfessorActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${activity.color}15` }}
                                    >
                                        {activity.icon === 'check' && <Check className="w-5 h-5" style={{ color: activity.color }} />}
                                        {activity.icon === 'play' && <Play className="w-5 h-5" style={{ color: activity.color }} />}
                                        {activity.icon === 'star' && <Star className="w-5 h-5" style={{ color: activity.color }} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{formatActivityTime(activity.createdAt)}</p>
                                    </div>
                                    <Eye className="w-4 h-4 text-gray-300" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <Link href="/activity" className="text-sm font-semibold text-[#2563EB] hover:underline flex items-center justify-between">
                                Ver toda mi actividad <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}