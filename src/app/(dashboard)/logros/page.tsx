'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { achievementsService, Achievement, UserAchievement } from '../services/achievementsService';
import { Settings, Trophy, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

import ManagementLayout from '@/components/ManagementLayout';

export default function LogrosPage() {
    const { user, token, isAdmin } = useAuth();
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
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    const unlockedIds = new Set(unlockedAchievements.map((ua) => ua.achievement_id));

    // We now rely purely on the real data from the API
    const totalUnlocked = unlockedAchievements.length;
    const totalAchievements = allAchievements.length;
    const completionPercentage = totalAchievements > 0 ? Math.round((totalUnlocked / totalAchievements) * 100) : 0;

    // Total points is the sum of points of unlocked achievements
    const totalPoints = allAchievements
        .filter((a) => unlockedIds.has(a.id))
        .reduce((sum, a) => sum + a.points_required, 0);
    const streakDays = 0; // Here you could fetch the real streak from user stats

    const getIconStyleForAchievement = (name: string, isLocked: boolean) => {
        if (isLocked) return { bg: 'bg-gray-100', icon: '🔒' };
        const n = name.toLowerCase();
        if (n.includes('paso') || n.includes('inicio')) return { bg: 'bg-blue-50', icon: '📖' };
        if (n.includes('limpio') || n.includes('código')) return { bg: 'bg-green-50', icon: '💻' };
        if (n.includes('semana') || n.includes('constante')) return { bg: 'bg-purple-50', icon: '🏅' };
        if (n.includes('racha')) return { bg: 'bg-orange-50', icon: '🔥' };
        if (n.includes('experto') || n.includes('reto')) return { bg: 'bg-yellow-50', icon: '🏆' };
        return { bg: 'bg-blue-50', icon: '🦦' };
    };

    return (
        <ManagementLayout>
            <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in pb-20">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-4">
                    <h1 className="text-3xl font-black text-[#0B1527] tracking-tight relative">
                        Mis logros
                        <span className="absolute -bottom-4 left-0 w-full h-1 bg-[#4A86F7] rounded-t-lg"></span>
                    </h1>
                    {isAdmin && (
                        <Link
                            href="/logros/manage"
                            className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-full transition-colors shadow-sm gap-2 text-sm whitespace-nowrap w-fit"
                        >
                            <Settings className="w-4 h-4" /> Administrar Logros
                        </Link>
                    )}
                </div>

                {/* Top Status Card */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col md:flex-row gap-12 items-center shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
                    {/* Left side: Mascot & Progress */}
                    <div className="flex items-center gap-8 w-full md:w-1/2">
                        <div className="w-40 h-40 flex-shrink-0 relative">
                            <img
                                src="/Otly.svg"
                                alt="Otly Mascot"
                                className="w-full h-full object-contain relative z-10 drop-shadow-md"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=otly';
                                }}
                            />
                        </div>
                        <div className="space-y-1 flex-grow">
                            <h3 className="text-[13px] font-black text-gray-800">Tu progreso</h3>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-[48px] font-black text-[#4A86F7] leading-none">
                                    {totalUnlocked.toString().padStart(2, '0')}
                                </span>
                                <span className="text-2xl text-gray-400 font-bold">
                                    / {totalAchievements.toString().padStart(2, '0')}
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">Logros desbloqueados</p>

                            <div className="w-full bg-gray-200 rounded-full h-3.5 mt-4 overflow-hidden">
                                <div
                                    className="bg-[#A855F7] h-3.5 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${completionPercentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs font-bold text-[#A855F7] mt-2">{completionPercentage}% completado</p>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-32 bg-gray-100"></div>

                    {/* Right side: 2 Stats */}
                    <div className="flex-grow flex justify-center gap-6 w-full md:w-auto">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-[#EEF2FF] text-[#4A86F7] rounded-full flex items-center justify-center shadow-sm mb-3">
                                <Trophy className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-gray-900">{totalUnlocked}</div>
                                <div className="text-[11px] text-gray-500 font-bold mt-0.5">Desbloqueados</div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-[#F3E8FF] text-[#A855F7] rounded-full flex items-center justify-center shadow-sm mb-3">
                                <Lock className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-gray-900">
                                    {totalAchievements - totalUnlocked}
                                </div>
                                <div className="text-[11px] text-gray-500 font-bold mt-0.5">Bloqueados</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="pt-2">
                    <h2 className="text-[22px] font-black text-gray-900 mb-6">Mis insignias</h2>
                    <div className="grid grid-cols-1 justify-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {allAchievements.map((achievement: any) => {
                            const isUnlocked = unlockedIds.has(achievement.id);
                            // Obtenemos el color base, enviando false para que incluso los bloqueados tengan fondo de color para difuminar
                            const style = getIconStyleForAchievement(achievement.name, false);

                            return (
                                <div
                                    key={achievement.id}
                                    className={`relative flex flex-col items-center rounded-3xl p-6 w-full h-[240px] transition-all duration-300 border ${
                                        !isUnlocked
                                            ? 'bg-[#E5E7EB]/60 border-transparent shadow-none'
                                            : 'bg-white border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.06)]'
                                    }`}
                                >
                                    <div
                                        className={`w-24 h-24 mb-4 rounded-full flex items-center justify-center relative overflow-hidden ${style.bg}`}
                                    >
                                        <img
                                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${achievement.name}`}
                                            alt={achievement.name}
                                            className={`w-16 h-16 transition-all ${!isUnlocked ? 'blur-[3px] opacity-50' : ''}`}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />

                                        {!isUnlocked && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                {/* Thick Stroke Lock Icon */}
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="w-9 h-9 text-gray-800 drop-shadow-md"
                                                >
                                                    <rect width="14" height="11" x="5" y="11" rx="2" ry="2" />
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <h3
                                        className={`font-black text-[15px] text-center leading-tight mb-1.5 ${!isUnlocked ? 'text-gray-800' : 'text-[#0B1527]'}`}
                                    >
                                        {!isUnlocked ? 'Logro Bloqueado' : achievement.name}
                                    </h3>
                                    <p
                                        className={`text-[12px] text-center leading-snug line-clamp-3 ${
                                            !isUnlocked
                                                ? 'text-gray-600 blur-[3px] select-none opacity-50'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {!isUnlocked
                                            ? 'Completa ejercicios para ver el logro'
                                            : achievement.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Motivational Banner */}
                <div className="bg-[#EBF1FF] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 mt-12">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500">
                            <Sparkles className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-[17px] font-black text-gray-900 mb-0.5 tracking-tight">
                                ¡Sigue así, {user?.username || 'Veronica'}!
                            </h4>
                            <p className="text-[14px] text-gray-600 font-medium">
                                Cada ejercicio que completas te acerca mas a tus metas
                            </p>
                        </div>
                    </div>
                    <button className="bg-[#4A86F7] hover:bg-blue-600 text-white font-bold rounded-xl px-8 py-3.5 text-[14px] transition-colors shadow-sm cursor-pointer whitespace-nowrap">
                        Ver ejercicios
                    </button>
                </div>
            </main>
        </ManagementLayout>
    );
}
