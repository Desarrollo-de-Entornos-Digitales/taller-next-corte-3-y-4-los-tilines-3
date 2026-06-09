'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { achievementsService, Achievement, UserAchievement } from '../services/achievementsService';
import Link from 'next/link';

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
    const totalPoints = allAchievements.filter((a) => unlockedIds.has(a.id)).reduce((sum, a) => sum + a.points_required, 0);
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
        <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in pb-20 font-sans">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#0B1527] mb-2 tracking-tight">Mis Logros</h1>
                    <p className="text-gray-500 text-[15px] flex items-center">
                        Cada<span className="inline-block border-b-2 border-blue-400 border-dashed mx-1 w-8"></span>logro es un paso más en tu camino para convertirte en un gran programador.
                    </p>
                </div>
                {isAdmin && (
                    <Link href="/logros/manage" className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-full transition-colors shadow-sm gap-2 text-sm whitespace-nowrap w-fit">
                        ⚙️ Administrar Logros
                    </Link>
                )}
            </div>

            {/* Top Status Card */}
            <div className="bg-white rounded-[32px] border border-gray-100 p-8 flex flex-col lg:flex-row gap-12 items-center justify-between shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
                
                {/* Left side: Mascot & Progress */}
                <div className="flex items-center gap-8 w-full lg:w-5/12">
                    <div className="w-36 h-36 flex-shrink-0 relative">
                        {/* Circle background behind mascot */}
                        <div className="absolute inset-0 bg-blue-50 rounded-full scale-90"></div>
                        <img src="/Otly.svg" alt="Otly Mascot" className="w-full h-full object-contain relative z-10 drop-shadow-md" onError={(e) => { e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=otly'; }} />
                    </div>
                    <div className="space-y-1 flex-grow">
                        <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Tu progreso</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-[44px] font-black text-blue-600 leading-none">{totalUnlocked}</span>
                            <span className="text-2xl text-gray-400 font-bold">/ {totalAchievements}</span>
                        </div>
                        <p className="text-[15px] font-medium text-gray-600 mb-2">Logros desbloqueados</p>
                        
                        <div className="w-full bg-gray-100 rounded-full h-3 mt-4 overflow-hidden">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${completionPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-[13px] font-bold text-blue-600 mt-2">{completionPercentage}% completado</p>
                    </div>
                </div>

                {/* Right side: 4 Stats */}
                <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-6 w-full lg:w-7/12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-blue-100/50">
                            🏅
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-gray-900">{totalUnlocked}</div>
                            <div className="text-[13px] text-gray-500 font-medium">Desbloqueados</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-green-100/50">
                            🔒
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-gray-900">{totalAchievements - totalUnlocked}</div>
                            <div className="text-[13px] text-gray-500 font-medium">Por desbloquear</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-purple-100/50">
                            ⭐
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-gray-900">{totalPoints}</div>
                            <div className="text-[13px] text-gray-500 font-medium">Puntos totales</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-orange-100/50">
                            🔥
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-gray-900">{streakDays}</div>
                            <div className="text-[13px] text-gray-500 font-medium">Días de racha</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between overflow-x-auto pb-2 pt-4 scrollbar-hide gap-4 border-b border-gray-100/50">
                <div className="flex gap-3 min-w-max">
                    <button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-full px-5 py-2.5 text-[14px] transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        Todos
                    </button>
                    <button className="flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 font-bold rounded-full px-5 py-2.5 text-[14px] transition-colors">
                        <span className="text-gray-400">📊</span> Progreso
                    </button>
                    <button className="flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 font-bold rounded-full px-5 py-2.5 text-[14px] transition-colors">
                        <span className="text-gray-400">&lt;/&gt;</span> Ejercicios
                    </button>
                    <button className="flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 font-bold rounded-full px-5 py-2.5 text-[14px] transition-colors">
                        <span className="text-gray-400">🚩</span> Retos
                    </button>
                    <button className="flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 font-bold rounded-full px-5 py-2.5 text-[14px] transition-colors">
                        <span className="text-gray-400">👥</span> Comunidad
                    </button>
                    <button className="flex items-center gap-2 bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 font-bold rounded-full px-5 py-2.5 text-[14px] transition-colors">
                        <span className="text-gray-400">⭐</span> Especiales
                    </button>
                </div>
                <div className="min-w-max">
                    <select className="bg-white border border-gray-200 text-gray-600 font-bold rounded-full px-4 py-2.5 text-[14px] appearance-none pr-8 relative outline-none focus:border-blue-400">
                        <option>Más recientes</option>
                        <option>Mayor XP</option>
                        <option>Alfabético</option>
                    </select>
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="pt-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-gray-900">Logros desbloqueados</h2>
                    <button className="text-blue-600 font-bold text-[14px] hover:underline flex items-center gap-1">Ver todos <span className="text-lg leading-none">&rsaquo;</span></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    {allAchievements.map((achievement: any) => {
                        const isUnlocked = unlockedIds.has(achievement.id);
                        const style = getIconStyleForAchievement(achievement.name, !isUnlocked);
                        
                        return (
                            <div
                                key={achievement.id}
                                className="relative flex flex-col items-center bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className={`w-20 h-20 mb-5 rounded-full ${style.bg} flex items-center justify-center text-4xl shadow-inner relative`}>
                                    <span className="drop-shadow-sm">{style.icon}</span>
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 bg-white/40 rounded-full flex items-center justify-center backdrop-blur-[1.5px]">
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-[#0B1527] text-[15px] text-center leading-tight mb-1">
                                    {achievement.name}
                                </h3>
                                <p className="text-[12px] text-gray-500 text-center mb-6 leading-relaxed line-clamp-2">
                                    {achievement.description}
                                </p>
                                <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${isUnlocked ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {achievement.points_required} XP
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-400">
                                        {achievement.date || '---'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Motivational Banner */}
            <div className="bg-[#EEF2FF] rounded-[24px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 mt-12 border border-blue-100">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl">
                        🚀
                    </div>
                    <div>
                        <h4 className="text-[17px] font-black text-gray-900 mb-0.5">¡Sigue así, {user?.username || 'Verónica'}!</h4>
                        <p className="text-[14px] text-gray-600 font-medium">Cada desafío que superas te acerca más a tus metas.</p>
                    </div>
                </div>
                <button className="bg-blue-600 text-white font-bold rounded-full px-8 py-3 text-[14px] shadow-sm hover:bg-blue-700 transition-colors">Ver desafíos</button>
            </div>
            
            {/* Footer Mock */}
            <div className="bg-[#032B8B] rounded-[32px] p-10 mt-12 text-white flex flex-col md:flex-row justify-between relative overflow-hidden">
                <div className="relative z-10 max-w-xs">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">🦦</div>
                        <span className="font-bold text-xl tracking-tight">Otly</span>
                    </div>
                    <p className="text-blue-200 text-sm leading-relaxed mb-6">
                        Made for students who want to actually understand programming.
                    </p>
                    <p className="text-blue-300 text-xs">© 2026 Otly. All rights reserved.</p>
                </div>
                
                <div className="flex gap-16 relative z-10 mt-8 md:mt-0 pr-32">
                    <div>
                        <h4 className="font-bold mb-4 text-sm">Company</h4>
                        <ul className="space-y-3 text-sm text-blue-200">
                            <li>About us</li>
                            <li>Contact</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-sm">Product</h4>
                        <ul className="space-y-3 text-sm text-blue-200">
                            <li>Exercises</li>
                            <li>Progress</li>
                            <li>Challenges</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-sm">Resources</h4>
                        <ul className="space-y-3 text-sm text-blue-200">
                            <li>Help Center</li>
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                        </ul>
                    </div>
                </div>
                
                {/* Decorative Mascot in Footer */}
                <div className="absolute right-0 bottom-0 text-8xl leading-none opacity-90 transform translate-x-4 translate-y-4">
                    🦦
                </div>
            </div>
        </div>
    );
}
