'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/context/AuthContext';
import { useProfileStore } from '@/lib/zustand/profileStore';
import { Check, Star, Play, ChevronRight, Calendar, BookOpen, BarChart3, Trophy, Compass } from 'lucide-react';

import { getProfileOverview, ProfileStats } from '../services/profileService';

const initialStats: ProfileStats = {
    activeCourses: 0,
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
    const { user } = useAuth();

    const {
        tasks,
        loadingTasks,
        tasksError,
        recentActivity,
        setTasks,
        setLoadingTasks,
        setTasksError,
        mergeRecentActivity,
    } = useProfileStore();

    const [stats, setStats] = useState<ProfileStats>(initialStats);

    const displayName = user?.username ?? 'Estudiante';
    const displayRole = user?.roleName ? String(user.roleName).toLowerCase() : 'student';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    const achievements = useMemo(() => {
        const items: { id: string; title: string; subtitle: string }[] = [];

        if (stats.completedExercises > 0) {
            items.push({
                id: 'logic',
                title: 'Logica en accion',
                subtitle: `Completaste ${stats.completedExercises} ejercicio${stats.completedExercises === 1 ? '' : 's'}`,
            });
        }

        if (stats.activeCourses > 0) {
            items.push({
                id: 'explorer',
                title: 'Explorador',
                subtitle: `Inscrito en ${stats.activeCourses} curso${stats.activeCourses === 1 ? '' : 's'}`,
            });
        }

        if (stats.averageProgress >= 80) {
            items.push({
                id: 'streak',
                title: 'Ritmo imparable',
                subtitle: `Mantienes un progreso promedio de ${stats.averageProgress}%`,
            });
        }

        return items.slice(0, 3);
    }, [stats]);

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

        // Listen for activity changes to refresh stats/tasks
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
        <div className="min-h-screen bg-[#F4F6F8] flex flex-col">
            <NavBar />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
                <header>
                    <h1 className="text-4xl font-black text-gray-900">Profile</h1>
                </header>

                {tasksError && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-2xl">
                        {tasksError}
                    </div>
                )}

                <section className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-6">
                    <article className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="size-28 rounded-full bg-linear-to-br from-gray-300 to-gray-500 text-white text-4xl font-black flex items-center justify-center">
                                    {avatarLetter}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900">{displayName}</h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        @{displayName.toLowerCase().replace(/\s+/g, '_')}
                                    </p>
                                    <p className="text-gray-600 text-sm mt-3">Rol: {displayRole}</p>
                                </div>
                            </div>

                            <button className="btn bg-[#4A86F7] hover:bg-blue-600 text-white border-none rounded-xl px-8">
                                Editar perfil
                            </button>
                        </div>
                    </article>

                    <article className="rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar className="size-5 text-[#1E3A8A]" />
                            <h2 className="font-black text-gray-900 text-lg">Próximas tareas</h2>
                        </div>

                        {loadingTasks ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                                No tienes ejercicios pendientes. Muy bien.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tasks.slice(0, 3).map((task) => (
                                    <Link
                                        key={task.id}
                                        href={task.href}
                                        className="relative block rounded-2xl border border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50 transition-all p-5 pr-12 group overflow-hidden"
                                    >
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-4"
                                            style={{ backgroundColor: task.color || '#4A86F7' }}
                                        />
                                        <div className="flex justify-between items-start gap-4 ml-2">
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">
                                                    {task.type}: {task.title}
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {task.moduleName} · {task.courseName}
                                                </p>
                                            </div>
                                            {task.dateLabel && (
                                                <span
                                                    className="text-sm font-bold whitespace-nowrap"
                                                    style={{ color: task.color || '#4A86F7' }}
                                                >
                                                    {task.dateLabel}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronRight
                                            className="absolute right-4 top-1/2 -translate-y-1/2 size-5 transition-transform group-hover:translate-x-1"
                                            style={{ color: task.color || '#4A86F7' }}
                                        />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </article>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <article className="lg:col-span-1 rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
                        <h2 className="font-black text-gray-900 mb-8">Resumen de aprendizaje</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col items-center">
                                <div className="size-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                                    <BookOpen className="size-7 text-blue-600" />
                                </div>
                                <p className="text-3xl font-black text-gray-900">{stats.activeCourses}</p>
                                <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Cursos activos</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="size-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-3">
                                    <BarChart3 className="size-7 text-violet-600" />
                                </div>
                                <p className="text-3xl font-black text-gray-900">{stats.averageProgress}%</p>
                                <p className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wider">
                                    Progreso promedio
                                </p>
                            </div>
                        </div>
                    </article>

                    <article className="lg:col-span-1 rounded-3xl bg-white border border-gray-100 p-6 shadow-sm flex flex-col">
                        <h2 className="font-black text-gray-900 mb-6">Actividad reciente</h2>

                        {recentActivity.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                                Aun no hay actividad reciente para mostrar.
                            </div>
                        ) : (
                            <div className="flex-1 space-y-6">
                                {recentActivity.slice(0, 3).map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-4 group">
                                        <div
                                            className="size-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs transition-colors"
                                            style={{
                                                backgroundColor: activity.color ? `${activity.color}15` : '#4A86F715',
                                                borderColor: activity.color ? `${activity.color}30` : '#4A86F730',
                                                color: activity.color || '#4A86F7',
                                            }}
                                        >
                                            {activity.icon === 'star' ? (
                                                <Star className="size-5 fill-current" />
                                            ) : activity.icon === 'play' ? (
                                                <Play className="size-5 fill-current" />
                                            ) : (
                                                <Check className="size-5" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{activity.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatActivityTime(activity.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-50">
                            <Link
                                href="/activity"
                                className="group flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700"
                            >
                                Ver toda mi actividad
                                <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </article>

                    <article className="lg:col-span-1 rounded-3xl bg-white border border-gray-100 p-6 shadow-sm flex flex-col">
                        <h2 className="font-black text-gray-900 mb-6">Logros</h2>

                        {achievements.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                                Completa ejercicios para desbloquear logros.
                            </div>
                        ) : (
                            <div className="flex-1 space-y-6">
                                {achievements.map((achievement) => (
                                    <div key={achievement.id} className="flex items-start gap-4">
                                        <div
                                            className={`size-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${
                                                achievement.id === 'logic'
                                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                    : achievement.id === 'explorer'
                                                      ? 'bg-purple-50 border-purple-100 text-purple-600'
                                                      : 'bg-amber-50 border-amber-100 text-amber-600'
                                            }`}
                                        >
                                            {achievement.id === 'logic' ? (
                                                <Trophy className="size-5" />
                                            ) : achievement.id === 'explorer' ? (
                                                <Compass className="size-5" />
                                            ) : (
                                                <Star className="size-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{achievement.title}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{achievement.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-50">
                            <Link
                                href="/achievements"
                                className="group flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700"
                            >
                                Ver todos mis logros
                                <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </article>
                </section>
            </main>

            <Footer />
        </div>
    );
}
