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
} from '@/app/(dashboard)/services/exerciseService';

export default function ArenaPageClient() {
    const params = useParams();
    const searchParams = useSearchParams();
    const exerciseId = Number(params.exerciseId);
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');

    const [exercise, setExercise] = useState<ArenaExercise | null>(null);
    const [siblings, setSiblings] = useState<ArenaExercise[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('user');
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    setUserId(Number(parsed.id));
                } catch {
                    setUserId(null);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (!exerciseId || Number.isNaN(exerciseId)) {
            setError('ID de ejercicio inválido');
            setLoading(false);
            return;
        }

        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                const data = await getArenaExercise(exerciseId);
                if (!mounted) return;
                setExercise(data);

                const resolvedModuleId = moduleId ? Number(moduleId) : data.module_id;
                if (resolvedModuleId) {
                    const list = await getArenaExercisesByModule(resolvedModuleId);
                    if (mounted) setSiblings(list);
                }
            } catch (err: any) {
                if (mounted) {
                    setError(err.response?.data?.message ?? 'No se pudo cargar el ejercicio.');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [exerciseId, moduleId]);

    const currentIndex = siblings.findIndex((item) => item.id === exerciseId);
    const prevExerciseId = currentIndex > 0 ? siblings[currentIndex - 1]?.id : null;
    const nextExerciseId =
        currentIndex >= 0 && currentIndex < siblings.length - 1
            ? siblings[currentIndex + 1]?.id
            : null;

    const resolvedModuleId = moduleId ? Number(moduleId) : exercise?.module_id ?? undefined;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavBar />

            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
                {loading && <div className="bg-white rounded-3xl p-8 animate-pulse h-96" />}

                {error && !loading && (
                    <div className="space-y-4">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                            {error}
                        </div>
                        <Link href="/feed" className="btn btn-outline">
                            Ir al feed
                        </Link>
                    </div>
                )}

                {!userId && !loading && !error && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl">
                        Debes iniciar sesión para practicar.{' '}
                        <Link href="/login" className="underline font-semibold">
                            Iniciar sesión
                        </Link>
                    </div>
                )}

                {!loading && exercise && userId && (
                    <ArenaPlayer
                        exercise={exercise}
                        userId={userId}
                        courseId={courseId ? Number(courseId) : undefined}
                        moduleId={resolvedModuleId}
                        exerciseIndex={currentIndex >= 0 ? currentIndex + 1 : 1}
                        totalExercises={siblings.length || 1}
                        prevExerciseId={prevExerciseId}
                        nextExerciseId={nextExerciseId}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
}
