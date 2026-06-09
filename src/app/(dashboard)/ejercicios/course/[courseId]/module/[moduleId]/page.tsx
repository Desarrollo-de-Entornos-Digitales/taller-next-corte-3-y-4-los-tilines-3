'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import CaminoPath from '@/components/camino/CaminoPath';
import {
    ArenaExercise,
    getArenaExercisesByModule,
    getCourseLearningHub,
    getExerciseTypeLabel,
    LearningModule,
} from '@/app/(dashboard)/services/exerciseService';

export default function ModuleLearningPage() {
    const params = useParams();
    const courseId = Number(params.courseId);
    const moduleId = Number(params.moduleId);

    const [module, setModule] = useState<LearningModule | null>(null);
    const [exercises, setExercises] = useState<ArenaExercise[]>([]);
    const [userId, setUserId] = useState<number | undefined>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('user');
            if (raw) {
                try {
                    setUserId(Number(JSON.parse(raw).id));
                } catch {
                    setUserId(undefined);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (!moduleId || Number.isNaN(moduleId) || !courseId || Number.isNaN(courseId)) {
            setError('ID de módulo inválido');
            setLoading(false);
            return;
        }

        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                const [hub, arenaExercises] = await Promise.all([
                    getCourseLearningHub(courseId, userId),
                    getArenaExercisesByModule(moduleId),
                ]);
                const match = hub.modules.find((item) => item.id === moduleId);
                if (!mounted) return;
                if (!match) {
                    setError('Módulo no encontrado en este curso.');
                    return;
                }
                setModule(match);
                setExercises(arenaExercises);
            } catch (err: any) {
                if (mounted) {
                    setError(err.response?.data?.message ?? 'No se pudo cargar el módulo.');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [moduleId, courseId, userId]);

    const exerciseNodes = useMemo(() => {
        if (!module) return [];

        let seenCurrent = false;
        return module.exercises.map((exercise, index) => {
            let state: 'done' | 'current' | 'locked' = 'locked';
            if (exercise.completed) {
                state = 'done';
            } else if (!seenCurrent) {
                state = 'current';
                seenCurrent = true;
            }

            return {
                id: exercise.id,
                label: exercise.title,
                state,
                meta: getExerciseTypeLabel(exercise.exercise_type),
                href:
                    state !== 'locked'
                        ? `/ejercicios/arena/${exercise.id}?courseId=${courseId}&moduleId=${moduleId}`
                        : undefined,
            };
        });
    }, [module, courseId, moduleId]);

    const moduleProgress =
        module && module.exerciseCount > 0
            ? Math.round(((module.exercisesCompleted ?? 0) / module.exerciseCount) * 100)
            : (module?.progress ?? 0);

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <NavBar />

            <main className="flex-1 max-w-[1000px] mx-auto w-full px-6 py-12">
                {loading && (
                    <div className="bg-white rounded-3xl p-8 animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-2/3" />
                        <div className="h-24 bg-gray-200 rounded" />
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">{error}</div>
                )}

                {!loading && module && (
                    <div className="space-y-12">
                        {/* Header Section */}
                        <section className="flex flex-col md:flex-row justify-between gap-10">
                            <div className="w-full md:w-1/2 flex flex-col justify-center">
                                <p className="text-[15px] font-black text-[#2563EB] mb-2 tracking-tight">
                                    Unidad {module.level_order}
                                </p>
                                <h1 className="text-[42px] font-black text-gray-900 leading-none mb-4">
                                    {module.title || 'Condicionales'}
                                </h1>
                                <p className="text-[15px] text-gray-500 font-medium leading-relaxed mb-8 max-w-sm">
                                    {module.description ||
                                        'Aprenderás a tomar decisiones en tus programas usando estructuras condicionales.'}
                                </p>

                                {/* Progress Box */}
                                <div className="rounded-3xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] p-6 w-full max-w-sm bg-white">
                                    <h3 className="text-[13px] font-black text-gray-900 mb-4">
                                        Tu progreso en esta unidad
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-grow bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-[#A855F7] h-3 rounded-full"
                                                style={{ width: `${moduleProgress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[13px] font-black text-gray-900">{moduleProgress}%</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium mt-4 border-t border-gray-50 pt-3">
                                        {module.exercisesCompleted ?? 0} de {module.exerciseCount ?? exercises.length}{' '}
                                        ejercicios completados
                                    </p>
                                </div>
                            </div>

                            {/* Otter Mascot */}
                            <div className="w-full md:w-1/2 flex justify-center md:justify-end items-center relative">
                                <div className="relative w-80 h-80">
                                    <img
                                        src="/Otly.svg"
                                        alt="Otter"
                                        className="w-full h-full object-contain drop-shadow-xl"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Exercise List */}
                        <section>
                            <h2 className="text-[17px] font-black text-gray-900 mb-6">Ejercicios de la unidad</h2>

                            {exercises.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                                    Este módulo aún no tiene ejercicios configurados.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {exercises.map((exercise, index) => {
                                        const hubExercise = module.exercises.find((e) => e.id === exercise.id);
                                        const isCompleted = hubExercise?.completed;

                                        const firstIncomplete = module.exercises.findIndex((e) => !e.completed);
                                        const isLocked = firstIncomplete !== -1 && index > firstIncomplete;

                                        const btnClasses = isCompleted
                                            ? 'border-2 border-emerald-500 text-emerald-500 bg-transparent'
                                            : isLocked
                                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                              : 'bg-[#4A86F7] hover:bg-blue-600 text-white shadow-sm';

                                        const btnText = isCompleted
                                            ? 'Completado'
                                            : isLocked
                                              ? '🔒 Bloqueado'
                                              : 'Disponible';

                                        return (
                                            <div
                                                key={exercise.id}
                                                className={`flex items-center justify-between rounded-2xl bg-white border border-gray-100 px-6 py-5 shadow-sm transition-all ${isLocked ? 'opacity-70 bg-gray-50' : 'hover:border-blue-200'}`}
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div
                                                        className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 text-gray-500 bg-white'}`}
                                                    >
                                                        {isCompleted ? '✓' : index + 1}
                                                    </div>
                                                    <h3
                                                        className={`font-black text-[15px] ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}
                                                    >
                                                        {index + 1}. {exercise.title}
                                                    </h3>
                                                </div>

                                                {isLocked ? (
                                                    <span
                                                        className={`rounded-xl py-2.5 px-6 font-bold text-[13px] text-center min-w-[140px] ${btnClasses}`}
                                                    >
                                                        {btnText}
                                                    </span>
                                                ) : (
                                                    <Link
                                                        href={`/ejercicios/arena/${exercise.id}?courseId=${courseId}&moduleId=${moduleId}`}
                                                        className={`rounded-xl py-2.5 px-6 font-bold text-[13px] text-center min-w-[140px] transition-colors ${btnClasses}`}
                                                    >
                                                        {btnText}
                                                    </Link>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Quiz Banner */}
                            <div className="mt-8 rounded-3xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] p-8 flex items-center justify-between bg-white relative overflow-hidden group hover:border-[#4A86F7] transition-colors cursor-pointer">
                                <div>
                                    <h3 className="text-[22px] font-black text-gray-900 mb-1">
                                        Quiz final de la unidad
                                    </h3>
                                    <p className="text-[13px] text-gray-500 font-medium">
                                        Demuestra todo lo que aprendiste y deten tu insignia
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#4A86F7] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-md">
                                    <span className="font-bold text-lg leading-none">→</span>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
