'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/context/AuthContext';
import { useProfileStore } from '@/lib/zustand/profileStore';
import { Check, Star, Play, ChevronRight, Calendar, BookOpen, BarChart3, Trophy, Compass, FileText } from 'lucide-react';

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

    const displayName = user?.username ?? 'Kevin';
    const displayRole = user?.roleName ? String(user.roleName).toLowerCase() : 'profesor';
    const isProfessor = displayRole === 'profesor' || displayRole === 'admin' || displayRole === 'teacher';
    const avatarLetter = displayName.charAt(0).toUpperCase();

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
                    throw new Error('No se encontro el usuario autenticado.');
                }

                const overview = await getProfileOverview(userId);
                if (!mounted) return;

                console.log('Profile Overview Loaded:', overview.stats);
                setStats(overview.stats);
                setTasks(overview.upcomingTasks);
                mergeRecentActivity(overview.recentActivity);

                if (token) {
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
    }, [user?.id, mergeRecentActivity, setLoadingTasks, setTasks, setTasksError]);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <NavBar />

            <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8 md:py-10 space-y-8 font-sans">
                <header>
                    <h1 className="text-2xl font-black text-gray-900 mb-6">Perfil</h1>
                </header>

                {tasksError && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-2xl">
                        {tasksError}
                    </div>
                )}

                <section className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                    {/* User Card */}
                    <article className="rounded-3xl bg-white border border-gray-200 p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)] h-full flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 flex-1">
                            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
                                <div className="w-32 h-32 rounded-full relative overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center text-4xl font-bold text-gray-500">
                                    {avatarLetter}
                                </div>
                                <div className="text-center sm:text-left">
                                    <h2 className="text-[28px] font-black text-gray-900 leading-tight">
                                        {displayName}
                                    </h2>
                                    <p className="text-gray-500 font-medium text-sm mt-1">
                                        @{displayName.toLowerCase().replace(/\s+/g, '_')}
                                    </p>

                                    <div className="mt-4 space-y-2 text-sm text-gray-600 font-medium">
                                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                                            <span className="text-gray-400">🎓</span> Universidad Icesi
                                        </div>
                                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                                            <span className="text-gray-400">👤</span> Miembro desde Junio 2024
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl px-8 py-3 text-sm transition-colors cursor-pointer w-full sm:w-auto h-fit mt-auto sm:mt-0 sm:self-end">
                                Editar perfil
                            </button>
                        </div>
                    </article>

                    {/* Next Tasks */}
                    <article className="rounded-3xl bg-white border border-gray-200 p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)] h-full">
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar className="size-5 text-[#1E3A8A]" />
                            <h2 className="font-black text-gray-900 text-[17px]">Próximas tareas</h2>
                        </div>

                        {loadingTasks ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500 text-center">
                                No hay tareas pendientes.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tasks.slice(0, 3).map((task) => (
                                    <Link
                                        key={task.id}
                                        href={task.href}
                                        className="relative flex items-center justify-between rounded-[20px] bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all p-5 group overflow-hidden"
                                    >
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-2.5 rounded-l-[20px]"
                                            style={{ backgroundColor: task.color || '#4A86F7' }}
                                        />
                                        <div className="ml-2 pr-4">
                                            <p className="font-black text-gray-900 text-[15px] leading-tight mb-1">
                                                {task.type}: {task.title}
                                            </p>
                                            <p className="text-[13px] text-gray-500 font-medium">
                                                {task.moduleName} · {task.courseName}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {task.dateLabel && (
                                                <span
                                                    className="text-[11px] font-bold uppercase"
                                                    style={{ color: task.color || '#4A86F7' }}
                                                >
                                                    {task.dateLabel}
                                                </span>
                                            )}
                                            <ChevronRight className="size-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </article>
                </section>

                <section className={`grid grid-cols-1 gap-6 ${isProfessor ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                    {/* Learning Summary */}
                    <article className="rounded-3xl bg-white border border-gray-200 p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                        <h2 className="font-black text-gray-900 text-[17px] mb-8">Resumen de aprendizaje</h2>
                        <div className="flex gap-4 h-[calc(100%-3rem)]">
                            <div className="flex-1 flex flex-col items-center justify-center p-4">
                                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                    <BookOpen className="size-8" />
                                </div>
                                <p className="text-[32px] font-black text-gray-900">{displayStats.activeUnits || 1}</p>
                                <p className="text-[12px] font-medium text-gray-600 mt-1">Cursos activos</p>
                            </div>
                            <div className="w-px bg-gray-100 hidden sm:block h-3/4 self-center"></div>
                            <div className="flex-1 flex flex-col items-center justify-center p-4">
                                <div className="w-16 h-16 rounded-full bg-[#F3E8FF] text-[#A855F7] flex items-center justify-center mb-4">
                                    {isProfessor ? (
                                        <FileText className="size-8" />
                                    ) : (
                                        <BarChart3 className="size-8" />
                                    )}
                                </div>
                                <p className="text-[32px] font-black text-gray-900">
                                    {isProfessor 
                                        ? (displayStats.totalExercises || 3)
                                        : (displayStats.averageProgress || 87) + '%'
                                    }
                                </p>
                                <p className="text-[12px] font-medium text-gray-600 mt-1 text-center">
                                    {isProfessor ? 'Ejercicios publicados' : 'Progreso promedio'}
                                </p>
                            </div>
                        </div>
                    </article>

                    {/* Recent Activity - AHORA USA DATOS REALES */}
                    {!isProfessor && (
                        <article className="rounded-3xl bg-white border border-gray-200 p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col">
                            <h2 className="font-black text-gray-900 text-[17px] mb-6">Actividad reciente</h2>

                            {recentActivity.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-8">
                                    <p className="text-sm text-gray-400">No hay actividad reciente</p>
                                </div>
                            ) : (
                                <div className="flex-1 space-y-5">
                                    {recentActivity.slice(0, 3).map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3">
                                            <div
                                                className="size-8 rounded-full flex items-center justify-center shrink-0 border"
                                                style={{
                                                    backgroundColor: activity.color ? `${activity.color}15` : '#4A86F715',
                                                    borderColor: activity.color ? `${activity.color}30` : '#4A86F730',
                                                    color: activity.color || '#4A86F7',
                                                }}
                                            >
                                                {activity.icon === 'star' ? (
                                                    <Star className="size-4 fill-current" />
                                                ) : activity.icon === 'play' ? (
                                                    <Play className="size-4 fill-current" />
                                                ) : (
                                                    <Check className="size-4" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 mt-0.5">
                                                <p className="text-sm font-bold text-gray-900 leading-tight">
                                                    {activity.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatActivityTime(activity.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>
                    )}

                    {/* Achievements - SOLO para estudiantes */}
                    {!isProfessor && (
                        <article className="rounded-3xl bg-white border border-gray-200 p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col">
                            <h2 className="font-black text-gray-900 text-[17px] mb-6">Logros</h2>

                            {realAchievements.length === 0 ? (
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-xl shadow-inner text-emerald-600">
                                            <Trophy className="size-5" />
                                        </div>
                                        <div className="mt-1">
                                            <p className="text-sm font-bold text-gray-900">Bienvenido</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Aún no tienes logros</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 space-y-6">
                                    {realAchievements.map((ua) => (
                                        <div key={ua.id} className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-xl shadow-inner text-emerald-600">
                                                <Trophy className="size-5" />
                                            </div>
                                            <div className="mt-1">
                                                <p className="text-[15px] font-bold text-gray-900">
                                                    {ua.achievement?.name || ''}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {ua.achievement?.description || ''}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-auto pt-4">
                                <Link
                                    href="/logros"
                                    className="text-[13px] font-bold text-[#2563EB] hover:underline flex items-center justify-between"
                                >
                                    Ver todos mis logros <ChevronRight className="size-4" />
                                </Link>
                            </div>
                        </article>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
