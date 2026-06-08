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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavBar />

            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
                <Link
                    href={`/ejercicios/course/${courseId}`}
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6"
                >
                    ← Volver al camino
                </Link>

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
                    <div className="space-y-8">
                        <section className="rounded-3xl bg-white shadow-sm border border-gray-100 p-8">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                Módulo {module.level_order}
                            </p>
                            <h1 className="text-3xl font-black text-gray-900 mt-1">{module.title}</h1>
                            <div className="mt-6">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                                    Documentación del tema
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mt-2">
                                    {module.description}
                                </p>
                            </div>
                        </section>

                        {exerciseNodes.length > 0 ? (
                            <CaminoPath
                                title={`Retos · ${module.title}`}
                                subtitle="Ejercicios del módulo"
                                description="Completa cada reto en orden. Quiz, editor de código, ordenar líneas o encontrar errores."
                                nodes={exerciseNodes}
                                overallProgress={moduleProgress}
                                completedLabel="retos"
                                activeLabel="activo"
                                lockedLabel="bloqueados"
                            />
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                                Este módulo aún no tiene ejercicios configurados.
                            </div>
                        )}

                        {exercises.length > 0 && (
                            <section>
                                <h2 className="text-lg font-black text-gray-900 mb-4">Lista de ejercicios</h2>
                                <div className="space-y-3">
                                    {exercises.map((exercise, index) => {
                                        const hubExercise = module.exercises.find((e) => e.id === exercise.id);
                                        const firstIncomplete = module.exercises.findIndex((e) => !e.completed);
                                        const isLocked = firstIncomplete !== -1 && index > firstIncomplete;

                                        return (
                                            <Link
                                                key={exercise.id}
                                                href={
                                                    isLocked
                                                        ? '#'
                                                        : `/ejercicios/arena/${exercise.id}?courseId=${courseId}&moduleId=${moduleId}`
                                                }
                                                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white border p-5 shadow-sm transition-all ${
                                                    isLocked
                                                        ? 'border-gray-100 opacity-50 pointer-events-none'
                                                        : 'border-gray-100 hover:shadow-md hover:border-blue-200'
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A] text-white font-black text-sm">
                                                        {hubExercise?.completed ? '✓' : index + 1}
                                                    </span>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{exercise.title}</h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {exercise.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="badge bg-[#4A86F7] text-white border-none">
                                                    {getExerciseTypeLabel(exercise.exercise_type)}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
