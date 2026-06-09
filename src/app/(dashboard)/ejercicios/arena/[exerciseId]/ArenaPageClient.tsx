'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ArenaPlayer from '@/components/arena/ArenaPlayer';
import {
    ArenaExercise,
    getArenaExercise,
    getArenaExercisesByModule,
    getCourseLearningHub,
} from '@/app/(dashboard)/services/exerciseService';

const readErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null) {
        const maybeError = error as {
            response?: { data?: { message?: string } };
            message?: string;
        };

        if (typeof maybeError.response?.data?.message === 'string') {
            return maybeError.response.data.message;
        }

        if (typeof maybeError.message === 'string') {
            return maybeError.message;
        }
    }

    return fallback;
};

export default function ArenaPageClient() {
    const params = useParams();
    const searchParams = useSearchParams();
    const exerciseIdParam = params.exerciseId;
    const exerciseId = Number(Array.isArray(exerciseIdParam) ? exerciseIdParam[0] : exerciseIdParam);
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');
    const hasValidExerciseId = Number.isFinite(exerciseId) && exerciseId > 0;

    const [exercise, setExercise] = useState<ArenaExercise | null>(null);
    const [siblings, setSiblings] = useState<ArenaExercise[]>([]);
    const [userId] = useState<number | null>(() => {
        if (typeof window === 'undefined') return null;

        const raw = localStorage.getItem('user');
        if (!raw) return null;

        try {
            const parsed = JSON.parse(raw) as { id?: number | string };
            const parsedId = Number(parsed.id);
            return Number.isFinite(parsedId) ? parsedId : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nextModuleId, setNextModuleId] = useState<number | null>(null);

    useEffect(() => {
        if (!hasValidExerciseId) {
            setLoading(false);
            return;
        }

        let mounted = true;

        const loadExercise = async () => {
            try {
                setLoading(true);
                const data = await getArenaExercise(exerciseId);
                if (!mounted) return;
                setExercise(data);

                const resolvedModuleId = moduleId ? Number(moduleId) : data.module_id;
                if (resolvedModuleId) {
                    const list = await getArenaExercisesByModule(resolvedModuleId);
                    if (mounted) setSiblings(list);

                    if (courseId) {
                        try {
                            const hub = await getCourseLearningHub(Number(courseId));
                            const sortedModules = [...hub.modules].sort((a, b) => a.level_order - b.level_order);
                            const currentModuleIndex = sortedModules.findIndex((m) => m.id === resolvedModuleId);
                            if (currentModuleIndex >= 0 && currentModuleIndex < sortedModules.length - 1) {
                                if (mounted) setNextModuleId(sortedModules[currentModuleIndex + 1].id);
                            }
                        } catch (e) {
                            // ignore
                        }
                    }
                }
            } catch (err: unknown) {
                if (mounted) {
                    setError(readErrorMessage(err, 'No se pudo cargar el ejercicio.'));
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void loadExercise();

        return () => {
            mounted = false;
        };
    }, [exerciseId, hasValidExerciseId, moduleId]);

    const currentIndex = siblings.findIndex((item) => item.id === exerciseId);
    const prevExerciseId = currentIndex > 0 ? siblings[currentIndex - 1]?.id : null;
    const nextExerciseId =
        currentIndex >= 0 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1]?.id : null;

    const resolvedModuleId = moduleId ? Number(moduleId) : (exercise?.module_id ?? undefined);
    const displayError = !hasValidExerciseId ? 'ID de ejercicio inválido' : error;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <NavBar />

            <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {loading && <div className="bg-white rounded-3xl p-8 animate-pulse h-96 border border-gray-100" />}

                {displayError && !loading && (
                    <div className="space-y-4">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl shadow-sm">
                            {displayError}
                        </div>
                        <Link
                            href="/feed"
                            className="btn btn-outline border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                            Ir al feed
                        </Link>
                    </div>
                )}

                {!userId && !loading && !displayError && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-5 rounded-2xl shadow-sm text-center">
                        <p className="font-medium mb-3">Debes iniciar sesión para practicar.</p>
                        <Link
                            href="/login"
                            className="bg-[#4A86F7] hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm inline-block transition-colors"
                        >
                            Iniciar sesión
                        </Link>
                    </div>
                )}

                {!loading && exercise && userId && (
                    <ArenaPlayer
                        key={exercise.id}
                        exercise={exercise}
                        userId={userId}
                        courseId={courseId ? Number(courseId) : undefined}
                        moduleId={resolvedModuleId}
                        exerciseIndex={currentIndex >= 0 ? currentIndex + 1 : 1}
                        totalExercises={siblings.length || 1}
                        prevExerciseId={prevExerciseId}
                        nextExerciseId={nextExerciseId}
                        nextModuleId={nextModuleId}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
}
