'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { achievementsService, Achievement, UserAchievement } from '../services/achievementsService';

export default function LogrosPage() {
    const { user, token } = useAuth();
    const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
    const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || !token) return;

        const fetchData = async () => {
            try {
                const [all, unlocked] = await Promise.all([
                    achievementsService.getAllAchievements(token),
                    achievementsService.getUserAchievements(user.id, token),
                ]);

                setAllAchievements(all);
                setUnlockedAchievements(unlocked);
            } catch (error) {
                console.error('Error loading achievements', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, token]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full min-h-screen">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    const unlockedIds = new Set(unlockedAchievements.map((ua) => ua.achievement_id));
    const totalUnlocked = unlockedAchievements.length;
    const totalAchievements = allAchievements.length;
    const completionPercentage = totalAchievements > 0 ? Math.round((totalUnlocked / totalAchievements) * 100) : 0;
    
    // Just a placeholder for total points logic; normally we would fetch total_points from Student entity
    const totalPoints = allAchievements
        .filter((a) => unlockedIds.has(a.id))
        .reduce((sum, a) => sum + a.points_required, 0);

    const getIconForAchievement = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('paso') || n.includes('inicio')) return '🚀';
        if (n.includes('limpio') || n.includes('bug')) return '💻';
        if (n.includes('constante') || n.includes('racha')) return '📅';
        if (n.includes('reto') || n.includes('experto')) return '🔥';
        if (n.includes('maestro') || n.includes('algoritmo')) return '👑';
        return '🏆';
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in pb-20">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Mis Logros</h1>
                <p className="text-gray-500">
                    Cada logro es un paso más en tu camino para convertirte en un gran programador.
                </p>
            </div>

            {/* Top Status Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col lg:flex-row gap-8 items-center justify-between overflow-hidden relative">
                <div className="flex items-center gap-6 z-10 w-full lg:w-1/3">
                    <div className="w-32 h-32 flex-shrink-0 bg-blue-50 rounded-full flex items-center justify-center p-4">
                        {/* Placeholder Mascot / Otly */}
                        <img src="/Otly.svg" alt="Otly Mascot" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=otly'; }} />
                    </div>
                    <div className="space-y-2 flex-grow">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tu progreso</h3>
                        <div className="text-4xl font-black text-primary">
                            {totalUnlocked} <span className="text-2xl text-gray-400 font-bold">/ {totalAchievements}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600">Logros desbloqueados</p>
                        <div className="w-full bg-gray-100 rounded-full h-3 mt-4 overflow-hidden">
                            <div
                                className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-xs font-bold text-primary text-right mt-1">{completionPercentage}% completado</p>
                    </div>
                </div>

                <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-4 z-10 w-full">
                    <div className="flex flex-col items-center justify-center p-4 bg-blue-50/50 rounded-2xl">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-2">
                            🏅
                        </div>
                        <span className="text-2xl font-black text-gray-900">{totalUnlocked}</span>
                        <span className="text-xs font-medium text-gray-500">Desbloqueados</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-green-50/50 rounded-2xl">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-2">
                            🔒
                        </div>
                        <span className="text-2xl font-black text-gray-900">{totalAchievements - totalUnlocked}</span>
                        <span className="text-xs font-medium text-gray-500">Por desbloquear</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-purple-50/50 rounded-2xl">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl mb-2">
                            ⭐
                        </div>
                        <span className="text-2xl font-black text-gray-900">{totalPoints}</span>
                        <span className="text-xs font-medium text-gray-500">Puntos totales</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-orange-50/50 rounded-2xl">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-2xl mb-2">
                            🔥
                        </div>
                        <span className="text-2xl font-black text-gray-900">0</span>
                        <span className="text-xs font-medium text-gray-500">Días de racha</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-hide gap-4">
                <div className="flex gap-2 min-w-max">
                    <button className="btn btn-primary rounded-full px-6 shadow-sm border-none">
                        <span className="mr-2">⚏</span> Todos
                    </button>
                    <button className="btn bg-white hover:bg-gray-50 text-gray-600 border-gray-200 rounded-full px-6 shadow-sm">
                        Progreso
                    </button>
                    <button className="btn bg-white hover:bg-gray-50 text-gray-600 border-gray-200 rounded-full px-6 shadow-sm">
                        Ejercicios
                    </button>
                    <button className="btn bg-white hover:bg-gray-50 text-gray-600 border-gray-200 rounded-full px-6 shadow-sm">
                        Retos
                    </button>
                    <button className="btn bg-white hover:bg-gray-50 text-gray-600 border-gray-200 rounded-full px-6 shadow-sm">
                        Especiales
                    </button>
                </div>
                <div className="min-w-max">
                    <select className="select select-bordered bg-white rounded-full text-gray-600 font-medium">
                        <option>Más recientes</option>
                        <option>Mayor XP</option>
                        <option>Alfabético</option>
                    </select>
                </div>
            </div>

            {/* Achievements Grid */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Logros</h2>
                    <button className="text-primary font-semibold text-sm hover:underline">Ver todos &gt;</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {allAchievements.map((achievement) => {
                        const isUnlocked = unlockedIds.has(achievement.id);
                        return (
                            <div
                                key={achievement.id}
                                className={`relative flex flex-col items-center bg-white rounded-3xl p-6 border shadow-sm transition-all duration-300 ${
                                    isUnlocked ? 'border-gray-100 hover:shadow-md hover:-translate-y-1' : 'border-gray-200 opacity-60 grayscale'
                                }`}
                            >
                                <div className="w-24 h-24 mb-4 rounded-full bg-blue-50 flex items-center justify-center text-5xl shadow-inner relative">
                                    {getIconForAchievement(achievement.name)}
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 bg-gray-900/10 rounded-full flex items-center justify-center backdrop-blur-[1px]">
                                            <span className="text-2xl text-gray-600 drop-shadow-md">🔒</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg text-center leading-tight mb-2">
                                    {achievement.name}
                                </h3>
                                <p className="text-xs text-gray-500 text-center mb-6 px-2">
                                    {achievement.description}
                                </p>
                                <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${isUnlocked ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {achievement.points_required} XP
                                    </span>
                                    <span className="text-xs font-medium text-gray-400">
                                        {isUnlocked ? 'Desbloqueado' : 'Bloqueado'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Motivational Banner */}
            <div className="bg-primary/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-primary/10 mt-12">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-3xl">
                        🚀
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-900">¡Sigue así, {user?.username || 'Estudiante'}!</h4>
                        <p className="text-sm text-gray-600">Cada desafío que superas te acerca más a tus metas.</p>
                    </div>
                </div>
                <button className="btn btn-primary rounded-full px-8 shadow-md">Ver desafíos</button>
            </div>
        </div>
    );
}
